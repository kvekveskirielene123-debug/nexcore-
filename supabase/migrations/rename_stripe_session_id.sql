-- Rename stripe_session_id → payment_session_id in mark_transactions
-- Reflects that PayPal order IDs (not Stripe session IDs) are now stored here.

ALTER TABLE public.mark_transactions
  RENAME COLUMN stripe_session_id TO payment_session_id;

ALTER INDEX IF EXISTS idx_mark_tx_stripe
  RENAME TO idx_mark_tx_payment;

-- Recreate credit_marks RPC with renamed parameter
CREATE OR REPLACE FUNCTION public.credit_marks(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text,
  p_payment_session_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE
  v_balance integer;
BEGIN
  SELECT marks INTO v_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  v_balance := v_balance + p_amount;
  UPDATE public.profiles SET marks = v_balance WHERE id = p_user_id;

  INSERT INTO public.mark_transactions (user_id, amount, reason, payment_session_id, balance_after)
  VALUES (p_user_id, p_amount, p_reason, p_payment_session_id, v_balance);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
