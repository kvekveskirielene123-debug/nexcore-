-- Atomic shop purchase: checks balance, deducts marks, grants cosmetic
-- in a single transaction with a row-level lock to prevent TOCTOU races.
CREATE OR REPLACE FUNCTION purchase_item(
  p_user_id     uuid,
  p_item_id     text,
  p_price_marks integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance     integer;
  v_new_balance integer;
BEGIN
  -- Lock the row for the duration of this transaction
  SELECT marks INTO v_balance
    FROM profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN jsonb_build_object('error', 'user_not_found');
  END IF;

  IF v_balance < p_price_marks THEN
    RETURN jsonb_build_object('error', 'insufficient_marks', 'balance', v_balance);
  END IF;

  IF EXISTS (
    SELECT 1 FROM user_cosmetics
     WHERE user_id = p_user_id AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('error', 'already_owned');
  END IF;

  v_new_balance := v_balance - p_price_marks;

  INSERT INTO user_cosmetics (user_id, item_id) VALUES (p_user_id, p_item_id);
  UPDATE profiles SET marks = v_new_balance WHERE id = p_user_id;
  INSERT INTO mark_transactions (user_id, amount, reason, balance_after)
    VALUES (p_user_id, -p_price_marks, 'shop_purchase:' || p_item_id, v_new_balance);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;
