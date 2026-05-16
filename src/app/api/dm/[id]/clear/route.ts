import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* DELETE /api/dm/[id]/clear — delete all messages in a conversation for the current user */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the user is a participant
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user1_id, user2_id")
    .eq("id", id)
    .single();

  if (!conv || (conv.user1_id !== user.id && conv.user2_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("dm_messages")
    .delete()
    .eq("conversation_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
