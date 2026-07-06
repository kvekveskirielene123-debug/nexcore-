// Server-only. Never import from client components.
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { SIGNUP_BONUS, MARKS_DAILY_BONUS } from "@/lib/ai/modelConfig";

/**
 * Grant the one-time signup bonus.
 * Idempotent: checks mark_transactions before crediting so it's safe to call
 * on every auth event (returns false if already granted).
 */
export async function grantSignupBonus(userId: string): Promise<boolean> {

  const { count } = await supabase
    .from("mark_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", "signup_bonus");

  if ((count ?? 0) > 0) return false;

  // Use a deterministic payment_session_id so that if two concurrent requests
  // both pass the count check above, the second credit_marks call will fail
  // on the unique constraint and return an error we can safely ignore.
  const idempotencyKey = `signup_bonus_${userId}`;

  // Retry a few times — profile row may not exist yet right after signup
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));
    const { error } = await supabase.rpc("credit_marks", {
      p_user_id: userId,
      p_amount: SIGNUP_BONUS,
      p_reason: "signup_bonus",
      p_payment_session_id: idempotencyKey,
    });
    if (!error) return true;
    // Unique constraint violation means another request already claimed it
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) return false;
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

  // Atomic conditional UPDATE: re-checks the 24h condition inside Postgres
  // so two concurrent on-auth events cannot both claim the bonus.
  let updateQuery = supabase
    .from("profiles")
    .update({ last_daily_bonus_at: now.toISOString() })
    .eq("id", userId)
    .select("id");

  if (profile?.last_daily_bonus_at) {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    updateQuery = (updateQuery as any).lt("last_daily_bonus_at", cutoff);
  } else {
    updateQuery = (updateQuery as any).is("last_daily_bonus_at", null);
  }

  const { data: updatedRows } = await updateQuery;
  if (!updatedRows || updatedRows.length === 0) return false;

  const { error } = await supabase.rpc("credit_marks", {
    p_user_id: userId,
    p_amount: MARKS_DAILY_BONUS,
    p_reason: "daily_bonus",
    p_payment_session_id: null,
  });

  if (error) throw new Error(error.message);
  return true;
}
