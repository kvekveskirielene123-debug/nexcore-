import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/mobile/dm/mark-read
// Body: { conversationId: string }
// Marks all messages in the conversation that were sent by someone other
// than the caller as read. Uses the service role so RLS doesn't block it.
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user: authUser }, error: authError } =
    await supabaseAdmin.auth.getUser(token);
  if (authError || !authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { conversationId?: string };
  const conversationId = body.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  // Verify the caller is actually a participant before marking anything read
  const { data: conv } = await supabaseAdmin
    .from("dm_conversations")
    .select("user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.user1_id !== authUser.id && conv.user2_id !== authUser.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from("dm_messages")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .neq("sender_id", authUser.id)
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}
