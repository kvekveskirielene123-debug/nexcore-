// Server-only helpers for Mark balance operations.
// NEVER import this from a client component.

import { createClient as createServerClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getClient(client?: any) {
  return client ?? (await createServerClient());
}

export async function deductMarks(
  userId: string,
  amount: number,
  reason: string,
  conversationId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<number> {
  if (amount <= 0) return 0;
  const supabase = await getClient(client);
  const { data, error } = await supabase.rpc("deduct_marks", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_conversation_id: conversationId ?? null,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function creditMarks(
  userId: string,
  amount: number,
  reason: string,
  paymentSessionId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<number> {
  if (amount <= 0) return 0;
  const supabase = await getClient(client);
  const { data, error } = await supabase.rpc("credit_marks", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_payment_session_id: paymentSessionId ?? null,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function refundMarks(
  userId: string,
  amount: number,
  conversationId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<number> {
  return creditMarks(userId, amount, "refund_api_error", undefined, client);
}
