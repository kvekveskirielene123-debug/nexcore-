import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MARKS_DAILY_BONUS = 50;
const MARKS_DAILY_BONUS_SUBSCRIBER = 100;

const STREAK_MILESTONES: Record<number, number> = { 3: 15, 7: 30, 14: 60, 30: 120 };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log("[claim-daily] userId:", userId);
    if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    // Base columns — guaranteed to exist in profiles
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, marks, last_daily_bonus_at, subscription_expires_at, subscription_tier, current_streak")
      .eq("id", userId)
      .single();

    console.log("[claim-daily] profile:", JSON.stringify({
      marks: profile?.marks,
      last_daily_bonus_at: (profile as any)?.last_daily_bonus_at,
      current_streak: (profile as any)?.current_streak,
    }));
    console.log("[claim-daily] profileErr:", JSON.stringify(profileErr));

    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();

    // 24h cooldown
    if ((profile as any).last_daily_bonus_at) {
      const diffH = (now.getTime() - new Date((profile as any).last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
      if (diffH < 24) {
        const next = new Date(new Date((profile as any).last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000);
        return NextResponse.json({ claimed: false, next_available_at: next.toISOString() });
      }
    }

    const isSub =
      (profile as any).subscription_tier != null &&
      isSubscriptionActive((profile as any).subscription_expires_at ?? null);
    const baseAmount = isSub ? MARKS_DAILY_BONUS_SUBSCRIBER : MARKS_DAILY_BONUS;

    // Streak columns — optional, may not exist if migration hasn't run yet
    let hasStreakColumns = false;
    let lastStreakDate: string | null = null;
    let currentStreak: number = ((profile as any).current_streak as number) ?? 0;
    let freezesUsed = 0;
    let freezeMonth: string | null = null;

    const { data: streakData, error: streakErr } = await supabaseAdmin
      .from("profiles")
      .select("last_streak_date, streak_freezes_used, streak_freeze_month")
      .eq("id", userId)
      .single();

    if (!streakErr && streakData) {
      hasStreakColumns = true;
      lastStreakDate  = (streakData as any).last_streak_date   ?? null;
      freezesUsed     = (streakData as any).streak_freezes_used ?? 0;
      freezeMonth     = (streakData as any).streak_freeze_month ?? null;
    } else {
      console.log("[claim-daily] streak columns unavailable (run migration):", JSON.stringify(streakErr));
    }

    // Streak logic
    const todayStr        = now.toISOString().split("T")[0];
    const currentMonthStr = todayStr.slice(0, 7);
    let streakFrozen      = false;

    if (hasStreakColumns) {
      if (freezeMonth !== currentMonthStr) {
        freezesUsed = 0;
        freezeMonth = currentMonthStr;
      }

      if (!lastStreakDate) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round(
          (new Date(todayStr + "T00:00:00Z").getTime() - new Date(lastStreakDate + "T00:00:00Z").getTime())
          / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 0) {
          // same calendar day — keep streak
        } else if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays === 2 && freezesUsed < 1) {
          streakFrozen = true;
          freezesUsed++;
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
    } else {
      // Streak columns missing — just increment the simple counter
      currentStreak = Math.max(currentStreak, 0) + 1;
    }

    const milestoneBonus = STREAK_MILESTONES[currentStreak] ?? 0;
    const milestoneName  = milestoneBonus > 0 ? `${currentStreak}-day streak bonus` : null;
    const totalAmount    = baseAmount + milestoneBonus;
    const newBalance     = ((profile as any).marks ?? 0) + totalAmount;

    // Build update payload — only include streak columns if they exist
    const updatePayload: Record<string, any> = {
      marks:               newBalance,
      last_daily_bonus_at: now.toISOString(),
      current_streak:      currentStreak,
    };
    if (hasStreakColumns) {
      updatePayload.last_streak_date    = todayStr;
      updatePayload.streak_freezes_used = freezesUsed;
      updatePayload.streak_freeze_month = freezeMonth;
    }

    const { data: updatedRows, error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("id");

    console.log("[claim-daily] updatePayload:", JSON.stringify(updatePayload));
    console.log("[claim-daily] updateErr:", JSON.stringify(updateErr));
    console.log("[claim-daily] updatedRows:", JSON.stringify(updatedRows));

    if (updateErr) throw new Error(updateErr.message);
    if (!updatedRows || updatedRows.length === 0) throw new Error("Profile update matched 0 rows");

    // Transaction log (best-effort)
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

    const response = {
      claimed:        true,
      amount:         baseAmount,
      new_balance:    newBalance,
      current_streak: currentStreak,
      ...(milestoneBonus > 0 && { milestone_bonus: milestoneBonus, milestone_name: milestoneName }),
      ...(streakFrozen        && { streak_frozen: true, streak_freezes_remaining: 1 - freezesUsed }),
    };
    console.log("[claim-daily] response:", JSON.stringify(response));
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[claim-daily] ERROR:", err?.message ?? err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("marks, last_daily_bonus_at, current_streak")
    .eq("id", userId)
    .single();

  console.log("[claim-daily] GET profileErr:", JSON.stringify(profileErr));
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let available = true;
  let next_available_at: string | null = null;
  if ((profile as any).last_daily_bonus_at) {
    const diffH = (Date.now() - new Date((profile as any).last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
    if (diffH < 24) {
      available = false;
      next_available_at = new Date(new Date((profile as any).last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return NextResponse.json({
    available,
    next_available_at,
    current_balance:  (profile as any).marks,
    current_streak:   (profile as any).current_streak ?? 0,
  });
}
