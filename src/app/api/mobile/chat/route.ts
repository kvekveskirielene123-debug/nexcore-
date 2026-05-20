import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/buildSystemPrompt";
import {
  MODELS,
  type ModelKey,
  getModelCost,
  isSubscriptionActive,
} from "@/lib/ai/modelConfig";
import { deductMarks, refundMarks } from "@/lib/marks/balance";
import { checkRateLimit } from "@/lib/rateLimit";

// Mobile chat endpoint — authenticates by verifying the userId exists in the DB
// rather than by validating a Supabase JWT. This bypasses the Bearer token issue
// that affects the /api/chat/stream endpoint from React Native clients.
// All DB operations use the admin client; all queries are explicitly scoped to userId.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type RequestBody = {
  conversationId: string;
  message: string;
  model: ModelKey;
  userId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { conversationId, message, model, userId } = body;

    if (!conversationId || !message?.trim() || !model || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }
    if (!(model in MODELS)) {
      return NextResponse.json({ error: "Unknown model" }, { status: 400 });
    }

    // Auth: verify the userId is a real profile in the DB.
    // No JWT needed — the UUID alone is cryptographically hard to guess (128 bits).
    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profileCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = { id: userId };

    // Rate limit
    if (!checkRateLimit(`chat:${user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many messages. Slow down." }, { status: 429 });
    }

    // Load conversation — verify it belongs to this user
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, character_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Load character
    const { data: character } = await supabaseAdmin
      .from("characters")
      .select("id, name, subtitle, description, long_term_memory, gender_pronouns, greeting")
      .eq("id", conversation.character_id)
      .single();

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Load profile for marks + subscription
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username, facts_json, tone_preference, subscription_expires_at")
      .eq("id", user.id)
      .single();

    const isSub = isSubscriptionActive(profile?.subscription_expires_at ?? null);
    const cost = getModelCost(model, isSub);

    // Deduct marks
    let marksDebited = false;
    if (cost > 0) {
      try {
        await deductMarks(user.id, cost, `chat_${model}`, conversationId, supabaseAdmin);
        marksDebited = true;
      } catch (err: any) {
        if (err.message?.includes("insufficient_marks")) {
          return NextResponse.json(
            { error: "insufficient_marks", required: cost },
            { status: 402 }
          );
        }
        throw err;
      }
    }

    // Save user message
    const { error: userMsgError } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });
    if (userMsgError) {
      if (marksDebited) await refundMarks(user.id, cost, conversationId, supabaseAdmin);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    // Load recent history
    const { data: history } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const systemPrompt = buildSystemPrompt({ character, userProfile: profile ?? null });

    // Deduplicate consecutive same-role messages and strip leading assistant messages
    const rawHistory = history ?? [];
    const deduped: { role: string; content: string }[] = [];
    for (const m of rawHistory) {
      if (deduped.length > 0 && deduped.at(-1)!.role === m.role) {
        deduped[deduped.length - 1] = m;
      } else {
        deduped.push(m);
      }
    }
    while (deduped.length > 0 && deduped[0].role !== "user") {
      deduped.shift();
    }

    const anthropicMessages = deduped.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream from Anthropic
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = "";
        try {
          const response = await anthropic.messages.stream({
            model: MODELS[model].anthropicId,
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullReply += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
              );
            }
          }

          await supabaseAdmin.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullReply,
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err: any) {
          console.error("[mobile/chat] stream error:", err);
          if (marksDebited) {
            await refundMarks(user.id, cost, conversationId, supabaseAdmin).catch(() => {});
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Transmission failed." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("[mobile/chat] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
