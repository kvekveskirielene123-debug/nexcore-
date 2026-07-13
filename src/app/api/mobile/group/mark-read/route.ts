import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/mobile/group/mark-read
// Body: { groupId: string, lastReadMessageId: string }
// Upserts the caller's last-read pointer for this group using service role
// so RLS on group_members doesn't complicate matters.
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

  const body = await request.json().catch(() => ({})) as { groupId?: string; lastReadMessageId?: string };
  const { groupId, lastReadMessageId } = body;
  if (!groupId || !lastReadMessageId) {
    return NextResponse.json({ error: "groupId and lastReadMessageId required" }, { status: 400 });
  }

  // Verify caller is a member before recording anything
  const { data: membership } = await supabaseAdmin
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabaseAdmin
    .from("group_read_receipts")
    .upsert(
      { group_id: groupId, user_id: authUser.id, last_read_message_id: lastReadMessageId, last_read_at: new Date().toISOString() },
      { onConflict: "group_id,user_id" }
    );

  return NextResponse.json({ ok: true });
}
