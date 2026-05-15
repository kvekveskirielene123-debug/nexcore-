import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_TYPES   = ["character", "post", "comment", "user", "message"] as const;
const VALID_REASONS = ["spam", "nsfw_unlabeled", "harassment", "misinformation", "illegal", "other"] as const;

// POST /api/reports  — submit a content report
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { content_type, content_id, reason, details } = body;

  if (!VALID_TYPES.includes(content_type))
    return NextResponse.json({ error: "Invalid content_type" }, { status: 400 });
  if (!VALID_REASONS.includes(reason))
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  if (!content_id || typeof content_id !== "string")
    return NextResponse.json({ error: "content_id required" }, { status: 400 });

  // Rate limit: 5 reports per hour per user
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", user.id)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= 5)
    return NextResponse.json({ error: "Too many reports. Try again later." }, { status: 429 });

  const { error } = await supabase.from("reports").insert({
    reporter_id:  user.id,
    content_type,
    content_id:   String(content_id).substring(0, 256),
    reason,
    details:      typeof details === "string" ? details.substring(0, 1000) : null,
  });

  if (error) return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
