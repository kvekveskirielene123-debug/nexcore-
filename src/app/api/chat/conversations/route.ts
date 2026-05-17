import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/chat/conversations?characterId=xxx
// List all conversations this user has with a given character.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, last_message_at, created_at")
    .eq("user_id", user.id)
    .eq("character_id", characterId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data ?? [] });
}

// POST /api/chat/conversations  { characterId }
// Creates a new conversation for (user, character), inserts the character's
// greeting as the first assistant message.
export async function POST(request: Request) {
  const body = (await request.json()) as { characterId: string };
  const { characterId } = body;
  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load character for greeting
  const { data: character } = await supabase
    .from("characters")
    .select("id, greeting")
    .eq("id", characterId)
    .single();
  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  // Create conversation
  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      character_id: characterId,
      title: "New Chat",
      title_auto_generated: true,
    })
    .select("id")
    .single();
  if (convError || !conv) {
    return NextResponse.json({ error: convError?.message ?? "Insert failed" }, { status: 500 });
  }

  // Note: greeting is displayed client-side only; storing it as a DB message
  // would cause Anthropic to receive an assistant-first history on the user's
  // first send, which the API rejects. The character's greeting is already
  // part of their profile/description accessible via the system prompt.

  return NextResponse.json({ conversationId: conv.id });
}

// PATCH /api/chat/conversations  { conversationId, title? } | { conversationId, pinned: boolean }
export async function PATCH(request: Request) {
  const body = (await request.json()) as { conversationId: string; title?: string; pinned?: boolean };
  const { conversationId, title, pinned } = body;
  if (!conversationId) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (pinned !== undefined) {
    const { error } = await supabase
      .from("conversations")
      .update({ is_pinned: pinned })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (!title?.trim()) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { error } = await supabase
    .from("conversations")
    .update({ title: title.trim().slice(0, 80), title_auto_generated: false })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/chat/conversations?id=xxx
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
