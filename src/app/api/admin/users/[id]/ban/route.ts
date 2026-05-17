import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/admin/users/[id]/ban  — ban a user
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminRow } = await supabase
    .from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (targetId === user.id)
    return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const reason    = typeof body.reason === "string" ? body.reason.substring(0, 500) : null;
  const expiresAt = body.expires_at ?? null;

  const { error } = await supabase.from("user_bans").upsert({
    user_id:    targetId,
    banned_by:  user.id,
    reason,
    expires_at: expiresAt,
  }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: "Ban failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users/[id]/ban  — lift a ban
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminRow } = await supabase
    .from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("user_bans").delete().eq("user_id", targetId);
  if (error) return NextResponse.json({ error: "Unban failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
