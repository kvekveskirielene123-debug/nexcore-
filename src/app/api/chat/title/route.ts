import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
export const runtime = "nodejs";

// POST /api/chat/title  { conversationId }
// Generate a 3-6 word title from the conversation's first user message.
// Silently updates the conversation.title if still auto-generated.
export async function POST(request: Request) {
  const body = (await request.json()) as { conversationId: string };
  const { conversationId } = body;
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only auto-title if the user hasn't renamed it
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, title, title_auto_generated")
    .eq("id", conversationId)
    .single();
  if (!conv || !conv.title_auto_generated) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Get first user message
  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .eq("role", "user")
    .order("created_at", { ascending: true })
    .limit(1);

  const firstMessage = messages?.[0]?.content;
  if (!firstMessage) return NextResponse.json({ ok: true, skipped: true });

  // Use Haiku for title generation (cheap + fast)
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 32,
      messages: [
        {
          role: "user",
          content: `Summarize this chat message as a 3-6 word title (no quotes, no punctuation at end):\n\n${firstMessage}`,
        },
      ],
    });
    const raw = (response.content[0] as any)?.text ?? "New Chat";
    const title = raw.trim().replace(/^["']|["']$/g, "").slice(0, 60) || "New Chat";

    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .eq("title_auto_generated", true);

    return NextResponse.json({ ok: true, title });
  } catch (err: any) {
    console.error("Title gen failed:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
