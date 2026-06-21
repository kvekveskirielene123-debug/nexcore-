-- gift_marks(p_sender_id, p_recipient_id, p_amount)
-- Atomically transfers marks between two users in a single transaction.
-- SECURITY DEFINER runs as the function owner (bypasses RLS), same
-- pattern as deduct_marks.
-- Returns the sender's new marks balance.
-- Raises exceptions for: insufficient_marks, sender_not_found, recipient_not_found
-- Run in Supabase SQL editor.

CREATE OR REPLACE FUNCTION gift_marks(
  p_sender_id    UUID,
  p_recipient_id UUID,
  p_amount       INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_marks    INTEGER;
  v_recipient_marks INTEGER;
  v_new_sender_bal  INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  -- Lock sender row first (consistent lock order prevents deadlocks)
  SELECT marks INTO v_sender_marks
  FROM profiles
  WHERE id = p_sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sender_not_found';
  END IF;

  IF v_sender_marks < p_amount THEN
    RAISE EXCEPTION 'insufficient_marks';
  END IF;

  -- Lock recipient row
  SELECT marks INTO v_recipient_marks
  FROM profiles
  WHERE id = p_recipient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'recipient_not_found';
  END IF;

  v_new_sender_bal := v_sender_marks - p_amount;

  UPDATE profiles SET marks = v_new_sender_bal          WHERE id = p_sender_id;
  UPDATE profiles SET marks = v_recipient_marks + p_amount WHERE id = p_recipient_id;

  -- Transaction log (best-effort — don't let log failures abort the transfer)
  BEGIN
    INSERT INTO mark_transactions (user_id, amount, reason, balance_after) VALUES
      (p_sender_id,    -p_amount, 'gift_sent',     v_new_sender_bal),
      (p_recipient_id,  p_amount, 'gift_received', v_recipient_marks + p_amount);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN v_new_sender_bal;
END;
$$;
