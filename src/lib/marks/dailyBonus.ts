import { createClient as createServerClient } from "@/lib/supabase/server";
import { creditMarks } from "./balance";
import { MARKS_DAILY_BONUS, MARKS_DAILY_BONUS_SUBSCRIBER, isSubscriptionActive } from "@/lib/ai/modelConfig";

export interface DailyBonusResult {
  claimed: boolean;
  new_balance?: number;
  next_available_at?: string;
  amount?: number;
  error?: string;
}

/**
 * Claim the daily login bonus for a user.
 * Brilliant subscribers receive 100 marks; free users receive 50.
 * Returns { claimed: false } if already claimed in last 24h.
 */
export async function claimDailyBonus(userId: string): Promise<DailyBonusResult> {
  const supabase = await createServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("last_daily_bonus_at, subscription_expires_at")
    .eq("id", userId)
    .single();

  if (error) return { claimed: false, error: error.message };

  const now = new Date();
  if (profile.last_daily_bonus_at) {
    const lastClaim = new Date(profile.last_daily_bonus_at);
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      const nextAvailable = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
      return { claimed: false, next_available_at: nextAvailable.toISOString() };
    }
  }

  const subscriber = isSubscriptionActive(profile.subscription_expires_at ?? null);
  const amount = subscriber ? MARKS_DAILY_BONUS_SUBSCRIBER : MARKS_DAILY_BONUS;

  // Atomic conditional UPDATE: re-checks the 24h condition inside Postgres so
  // two concurrent requests cannot both succeed. Only the first writer wins.
  let updateQuery = supabase
    .from("profiles")
    .update({ last_daily_bonus_at: now.toISOString() })
    .eq("id", userId)
    .select("id");

  if (profile.last_daily_bonus_at) {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    updateQuery = (updateQuery as any).lt("last_daily_bonus_at", cutoff);
  } else {
    updateQuery = (updateQuery as any).is("last_daily_bonus_at", null);
  }

  const { data: updatedRows } = await updateQuery;
  if (!updatedRows || updatedRows.length === 0) {
    const nextAvailable = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return { claimed: false, next_available_at: nextAvailable.toISOString() };
  }

  const newBalance = await creditMarks(userId, amount, "daily_bonus");
  return { claimed: true, new_balance: newBalance, amount };
}
