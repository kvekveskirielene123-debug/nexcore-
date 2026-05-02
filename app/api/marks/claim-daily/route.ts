import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { claimDailyBonus } from "@/lib/marks/dailyBonus";

// POST /api/marks/claim-daily
// Claims the 50-Mark daily login bonus if available.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await claimDailyBonus(user.id);
  return NextResponse.json(result);
}

// GET /api/marks/claim-daily
// Check if bonus is available (without claiming).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_daily_bonus_at, marks")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const now = new Date();
  let available = true;
  let nextAvailableAt: string | null = null;
  if (profile.last_daily_bonus_at) {
    const lastClaim = new Date(profile.last_daily_bonus_at);
    const diffH = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    if (diffH < 24) {
      available = false;
      nextAvailableAt = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return NextResponse.json({
    available,
    next_available_at: nextAvailableAt,
    current_balance: profile.marks,
  });
}
