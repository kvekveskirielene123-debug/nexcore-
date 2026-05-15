import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      .select("id, character_id, title, title_auto_generated")
      .eq("id", conversationId)
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
        await deductMarks(user.id, cost, `chat_${model}`, conversationId);
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

    const anthropicMessages = (history ?? []).map((m: any) => ({
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
              await refundMarks(user.id, cost, conversationId);
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
