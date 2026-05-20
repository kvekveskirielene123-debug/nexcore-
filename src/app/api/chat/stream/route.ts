import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

// Admin client used for DB operations when a Bearer token authenticates the request.
// All queries explicitly filter by user.id, so bypassing RLS is safe here.
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      // Direct REST call to Supabase auth — bypasses JS client state entirely.
      // This is the canonical server-side way to verify a Supabase user JWT.
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          cache: "no-store",
        }
      );
      if (!res.ok) {
        console.error("[auth] Bearer verify failed:", res.status, await res.text().catch(() => ""));
        return { user: null, supabase: supabaseAdmin };
      }
      const user = await res.json();
      return { user, supabase: supabaseAdmin };
    } catch (err) {
      console.error("[auth] Bearer verify error:", err);
      return { user: null, supabase: supabaseAdmin };
    }
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  conversationId: string;
  message: string;
  model: ModelKey;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { conversationId, message, model } = body;

    if (!conversationId || !message?.trim() || !model) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message too long (max 4000 characters)." }, { status: 400 });
    }

    if (!(model in MODELS)) {
      return NextResponse.json({ error: "Unknown model" }, { status: 400 });
    }

    const { user, supabase } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 60 messages per minute per user
    if (!checkRateLimit(`chat:${user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many messages. Slow down and try again." }, { status: 429 });
    }

    // Load conversation (confirms it belongs to the user via RLS)
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, character_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();
    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Load character
    const { data: character } = await supabase
      .from("characters")
      .select("id, name, subtitle, description, long_term_memory, gender_pronouns, greeting")
      .eq("id", conversation.character_id)
      .single();
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Load user profile (for Mark balance + subscription + facts)
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, facts_json, tone_preference, subscription_expires_at")
      .eq("id", user.id)
      .single();

    const isSub = isSubscriptionActive(profile?.subscription_expires_at ?? null);
    const cost = getModelCost(model, isSub);

    // Atomic Mark deduction if cost > 0
    let markedDebited = false;
    if (cost > 0) {
      try {
        await deductMarks(user.id, cost, `chat_${model}`, conversationId, supabase);
        markedDebited = true;
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
    const { error: userMsgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });
    if (userMsgError) {
      if (markedDebited) await refundMarks(user.id, cost, conversationId);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    // Load recent message history (limit to last 20 for context)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const systemPrompt = buildSystemPrompt({
      character,
      userProfile: profile ?? null,
    });

    // Build a valid alternating message history for Anthropic.
    // The DB may have a leading assistant greeting or consecutive user messages
    // (from prior failed sends), so we deduplicate consecutive same-role entries
    // and strip any leading assistant rows before sending.
    const rawHistory = history ?? [];
    const dedupedHistory: { role: string; content: string }[] = [];
    for (const m of rawHistory) {
      if (dedupedHistory.length > 0 && dedupedHistory.at(-1)!.role === m.role) {
        // Replace the tail with the more-recent same-role message
        dedupedHistory[dedupedHistory.length - 1] = m;
      } else {
        dedupedHistory.push(m);
      }
    }
    // Drop any leading assistant messages so the first turn is always user
    while (dedupedHistory.length > 0 && dedupedHistory[0].role !== "user") {
      dedupedHistory.shift();
    }

    const anthropicMessages = dedupedHistory.map((m) => ({
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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`));
            }
          }

          // Save the assistant reply
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullReply,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (err: any) {
          console.error("Streaming error:", err);
          // Refund Marks if we debited
          if (markedDebited) {
            try {
              await refundMarks(user.id, cost, conversationId, supabase);
            } catch (refundErr) {
              console.error("Refund also failed:", refundErr);
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Transmission interrupted. Marks refunded.",
              })}\n\n`
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
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
