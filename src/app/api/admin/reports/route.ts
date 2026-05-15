import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/admin/reports?status=pending&page=0
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url     = new URL(req.url);
  const status  = url.searchParams.get("status") ?? "pending";
  const page    = parseInt(url.searchParams.get("page") ?? "0", 10);
  const limit   = 25;
  const offset  = page * limit;

  const { data, count, error } = await supabase
    .from("reports")
    .select(`
      id, content_type, content_id, reason, details, status, created_at,
      reporter:reporter_id ( id, username:profiles!reporter_id(username) ),
      reviewer:reviewed_by ( id, username:profiles!reviewed_by(username) ),
      reviewed_at
    `, { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ reports: data ?? [], total: count ?? 0, page, limit });
}
