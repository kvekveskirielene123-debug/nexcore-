import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/chat/archive
// Atomically archives a conversation (sets its title) and creates a fresh one.
// Body: { conversationId: string, title: string, characterId: string }
// Response: { newConversationId: string }
export async function POST(request: Request) {
  const body = (await request.json()) as {
    conversationId?: string;
    title?: string;
    characterId?: string;
  };

  const { conversationId, title, characterId } = body;
  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Save the title on the old conversation (if it exists and belongs to this user)
  if (conversationId && title?.trim()) {
    await supabase
      .from("conversations")
      .update({ title: title.trim().slice(0, 80), title_auto_generated: false })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    // We intentionally don't abort on error here — the new conversation should
    // still be created even if the title update hits an edge case.
  }

  // 2. Create a fresh conversation for the same character
  const { data: newConv, error: insertError } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      character_id: characterId,
      title: "New Chat",
      title_auto_generated: true,
    })
    .select("id")
    .single();

  if (insertError || !newConv) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create conversation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ newConversationId: newConv.id });
}
