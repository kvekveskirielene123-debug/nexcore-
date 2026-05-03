import { createClient as createServerClient } from "@/lib/supabase/server";
import { creditMarks } from "./balance";
import { MARKS_DAILY_BONUS } from "@/lib/ai/modelConfig";

export interface DailyBonusResult {
  claimed: boolean;
  new_balance?: number;
  next_available_at?: string;
  error?: string;
}

/**
 * Claim the daily login bonus for a user.
 * Returns { claimed: false } if already claimed in last 24h.
 */
export async function claimDailyBonus(userId: string): Promise<DailyBonusResult> {
  const supabase = await createServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("last_daily_bonus_at")
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

  // Credit the Marks and update the last_daily_bonus_at
  const newBalance = await creditMarks(userId, MARKS_DAILY_BONUS, "daily_bonus");

  await supabase
    .from("profiles")
    .update({ last_daily_bonus_at: now.toISOString() })
    .eq("id", userId);

  return { claimed: true, new_balance: newBalance };
}
