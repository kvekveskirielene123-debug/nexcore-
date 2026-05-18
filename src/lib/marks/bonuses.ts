// Server-only. Never import from client components.
import { createClient } from "@/lib/supabase/server";
import { SIGNUP_BONUS, MARKS_DAILY_BONUS } from "@/lib/ai/modelConfig";

/**
 * Grant the one-time signup bonus.
 * Idempotent: checks mark_transactions before crediting so it's safe to call
 * on every auth event (returns false if already granted).
 */
export async function grantSignupBonus(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("mark_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", "signup_bonus");

  if ((count ?? 0) > 0) return false;

  // Retry a few times — profile row may not exist yet right after signup
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));
    const { error } = await supabase.rpc("credit_marks", {
      p_user_id: userId,
      p_amount: SIGNUP_BONUS,
      p_reason: "signup_bonus",
      p_payment_session_id: null,
    });
    if (!error) return true;
    if (attempt === 3) throw new Error(error.message);
  }
  return false;
}

/**
 * Grant the daily login bonus (50 marks, once per 24 h).
 * Uses profiles.last_daily_bonus_at as the idempotency gate.
 * Returns false silently if already claimed today.
 */
export async function grantDailyBonus(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_daily_bonus_at")
    .eq("id", userId)
    .single();

  const now = new Date();
  if (profile?.last_daily_bonus_at) {
    const last = new Date(profile.last_daily_bonus_at);
    if (now.getTime() - last.getTime() < 24 * 60 * 60 * 1000) {
      return false;
    }
  }

  const { error } = await supabase.rpc("credit_marks", {
    p_user_id: userId,
    p_amount: MARKS_DAILY_BONUS,
    p_reason: "daily_bonus",
    p_payment_session_id: null,
  });

  if (error) throw new Error(error.message);

  await supabase
    .from("profiles")
    .update({ last_daily_bonus_at: now.toISOString() })
    .eq("id", userId);

  return true;
}
