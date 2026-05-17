import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* GET /api/dm/[id] — fetch messages for a DM conversation */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the user is a participant (RLS also enforces this)
  const { data: conv, error: convErr } = await supabase
    .from("dm_conversations")
    .select("id, user1_id, user2_id")
    .eq("id", id)
    .single();

  if (convErr || !conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  if (conv.user1_id !== user.id && conv.user2_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages, error } = await supabase
    .from("dm_messages")
    .select("id, sender_id, content, image_url, created_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark unread messages (sent by partner) as read
  supabase
    .from("dm_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .is("read_at", null)
    .then(() => {});

  return NextResponse.json({ messages: messages ?? [] });
}

/* POST /api/dm/[id] — send a message in a DM conversation */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify participant
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user1_id, user2_id")
    .eq("id", id)
    .single();

  if (!conv || (conv.user1_id !== user.id && conv.user2_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as { content?: string; image_url?: string | null };
  const content = (body.content ?? "").trim();
  const image_url = body.image_url ?? null;
  if (!content && !image_url) return NextResponse.json({ error: "Content or image required" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });

  const now = new Date().toISOString();

  // Insert message and bump last_message_at in parallel
  // Use null for empty content (image-only messages)
  const [{ data: message, error: msgErr }] = await Promise.all([
    supabase
      .from("dm_messages")
      .insert({ conversation_id: id, sender_id: user.id, content: content || null, image_url })
      .select("id, sender_id, content, image_url, created_at, read_at")
      .single(),
    supabase
      .from("dm_conversations")
      .update({ last_message_at: now })
      .eq("id", id),
  ]);

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
  return NextResponse.json({ message });
}
