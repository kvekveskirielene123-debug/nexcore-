import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MARKS_DAILY_BONUS = 50;
const MARKS_DAILY_BONUS_SUBSCRIBER = 100;

// Day-N → bonus marks awarded on top of the base daily claim
const STREAK_MILESTONES: Record<number, number> = { 3: 15, 7: 30, 14: 60, 30: 120 };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, marks, last_daily_bonus_at, subscription_expires_at, subscription_tier, current_streak, last_streak_date, streak_freezes_used, streak_freeze_month")
      .eq("id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();

    // 24h cooldown — unchanged
    if (profile.last_daily_bonus_at) {
      const diffH = (now.getTime() - new Date(profile.last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
      if (diffH < 24) {
        const next = new Date(new Date(profile.last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000);
        return NextResponse.json({ claimed: false, next_available_at: next.toISOString() });
      }
    }

    const isSub =
      (profile as any).subscription_tier != null &&
      isSubscriptionActive(profile.subscription_expires_at ?? null);
    const baseAmount = isSub ? MARKS_DAILY_BONUS_SUBSCRIBER : MARKS_DAILY_BONUS;

    // ── Streak logic ──────────────────────────────────────────────────────────
    const todayStr = now.toISOString().split("T")[0];     // "YYYY-MM-DD"
    const currentMonthStr = todayStr.slice(0, 7);          // "YYYY-MM"

    const lastStreakDate = (profile as any).last_streak_date as string | null;
    let currentStreak   = ((profile as any).current_streak as number) ?? 0;
    let freezesUsed     = ((profile as any).streak_freezes_used as number) ?? 0;
    let freezeMonth     = ((profile as any).streak_freeze_month as string | null) ?? null;
    let streakFrozen    = false;

    // Reset freeze counter when the calendar month rolls over
    if (freezeMonth !== currentMonthStr) {
      freezesUsed = 0;
      freezeMonth = currentMonthStr;
    }

    if (!lastStreakDate) {
      // First ever claim
      currentStreak = 1;
    } else {
      const lastD  = new Date(lastStreakDate + "T00:00:00Z");
      const todayD = new Date(todayStr + "T00:00:00Z");
      const diffDays = Math.round((todayD.getTime() - lastD.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // Same calendar day — keep streak (24h cooldown already prevents double-claim)
      } else if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays === 2 && freezesUsed < 1) {
        // Missed exactly 1 day and freeze available — save the streak
        streakFrozen = true;
        freezesUsed++;
        currentStreak++;
      } else {
        // Missed 2+ days, or freeze already used this month
        currentStreak = 1;
      }
    }

    // ── Milestone bonus ───────────────────────────────────────────────────────
    const milestoneBonus = STREAK_MILESTONES[currentStreak] ?? 0;
    const milestoneName  = milestoneBonus > 0 ? `${currentStreak}-day streak bonus` : null;

    const totalAmount = baseAmount + milestoneBonus;
    const newBalance  = (profile.marks ?? 0) + totalAmount;

    // ── Profile update (single write) ─────────────────────────────────────────
    const { data: updatedRows, error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({
        marks:                newBalance,
        last_daily_bonus_at:  now.toISOString(),
        current_streak:       currentStreak,
        last_streak_date:     todayStr,
        streak_freezes_used:  freezesUsed,
        streak_freeze_month:  freezeMonth,
      })
      .eq("id", userId)
      .select("id");

    if (updateErr) throw new Error(updateErr.message);
    if (!updatedRows || updatedRows.length === 0) throw new Error("Profile update matched 0 rows");

    // ── Transaction log (best-effort) ─────────────────────────────────────────
    supabaseAdmin.from("mark_transactions").insert({
      user_id:       userId,
      amount:        baseAmount,
      reason:        "daily_bonus",
      balance_after: newBalance - milestoneBonus,
    }).then(() => {});

    if (milestoneBonus > 0) {
      supabaseAdmin.from("mark_transactions").insert({
        user_id:       userId,
        amount:        milestoneBonus,
        reason:        milestoneName!,
        balance_after: newBalance,
      }).then(() => {});
    }

    return NextResponse.json({
      claimed:                   true,
      amount:                    baseAmount,
      new_balance:               newBalance,
      current_streak:            currentStreak,
      ...(milestoneBonus > 0  && { milestone_bonus: milestoneBonus, milestone_name: milestoneName }),
      ...(streakFrozen        && { streak_frozen: true, streak_freezes_remaining: 1 - freezesUsed }),
    });
  } catch (err: any) {
    console.error("[mobile/marks/claim-daily]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("marks, last_daily_bonus_at, current_streak")
    .eq("id", userId)
    .single();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let available = true;
  let next_available_at: string | null = null;
  if (profile.last_daily_bonus_at) {
    const diffH = (Date.now() - new Date(profile.last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
    if (diffH < 24) {
      available = false;
      next_available_at = new Date(new Date(profile.last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return NextResponse.json({
    available,
    next_available_at,
    current_balance:  profile.marks,
    current_streak:   (profile as any).current_streak ?? 0,
  });
}
