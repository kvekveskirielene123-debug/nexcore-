// Server-only helpers for Mark balance operations.
// NEVER import this from a client component.

import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Deducts Marks atomically via Postgres RPC.
 * Throws 'insufficient_marks' if user doesn't have enough.
 * Returns new balance on success.
 */
export async function deductMarks(
  userId: string,
  amount: number,
  reason: string,
  conversationId?: string
): Promise<number> {
  if (amount <= 0) return 0; // Haiku / free: no deduction
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("deduct_marks", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_conversation_id: conversationId ?? null,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

/**
 * Credits Marks (refund, daily bonus, pack purchase, etc.)
 */
export async function creditMarks(
  userId: string,
  amount: number,
  reason: string,
  paymentSessionId?: string
): Promise<number> {
  if (amount <= 0) return 0;
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("credit_marks", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_payment_session_id: paymentSessionId ?? null,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

/**
 * Refund a previous deduction (called when AI call fails after deduction).
 */
export async function refundMarks(
  userId: string,
  amount: number,
  conversationId?: string
): Promise<number> {
  return creditMarks(userId, amount, "refund_api_error");
}
