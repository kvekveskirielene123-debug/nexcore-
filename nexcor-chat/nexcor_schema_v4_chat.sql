-- ============================================================
-- NEXCOR · Supabase Migration v4 (CHAT + MARKS + SUBSCRIPTIONS)
-- Run AFTER nexcor_schema_v3.sql has already been applied.
-- ============================================================

-- ── profiles additions ───────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marks                  integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_daily_bonus_at    timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_tier      text,           -- null, 'biweekly', 'monthly', 'bimonthly'
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id     text UNIQUE,
  ADD COLUMN IF NOT EXISTS active_bubble_style    text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS active_frame           text NOT NULL DEFAULT 'none';

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- ── characters addition ──────────────────────────────────
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS active_frame text NOT NULL DEFAULT 'none';

-- ── mark_transactions: audit log of every Mark change ────
CREATE TABLE IF NOT EXISTS public.mark_transactions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      integer NOT NULL,              -- positive = earned, negative = spent
  reason      text NOT NULL,                 -- 'signup_bonus', 'daily_login', 'ad_watch',
                                             -- 'chat_haiku', 'chat_sonnet', 'chat_opus',
                                             -- 'pack_small', 'pack_medium', 'pack_large',
                                             -- 'refund_api_error', 'admin_grant'
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  stripe_session_id text,                    -- filled in for pack purchases
  balance_after integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mark_tx_user ON public.mark_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mark_tx_stripe ON public.mark_transactions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;


-- ── subscriptions: user purchase history (Phase 2 ready) ─
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier            text NOT NULL CHECK (tier IN ('biweekly', 'monthly', 'bimonthly')),
  status          text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text UNIQUE,
  started_at      timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  canceled_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_active ON public.subscriptions(user_id, status)
  WHERE status = 'active';


-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.mark_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mark_tx: own read"
  ON public.mark_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subs: own read"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- mark_transactions and subscriptions inserts are only done via
-- server-side service role (from API routes), so no INSERT policy needed.

-- ── RPC: atomic Mark deduction ───────────────────────────
-- Guarantees the balance check + deduct happen in one transaction.
-- Used by /api/chat/stream before calling the AI.
CREATE OR REPLACE FUNCTION public.deduct_marks(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text,
  p_conversation_id uuid DEFAULT NULL
) RETURNS integer AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  SELECT marks INTO v_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_marks';
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE public.profiles SET marks = v_new_balance WHERE id = p_user_id;

  INSERT INTO public.mark_transactions (user_id, amount, reason, conversation_id, balance_after)
  VALUES (p_user_id, -p_amount, p_reason, p_conversation_id, v_new_balance);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── RPC: credit Marks (ad, daily, pack, refund, etc.) ────
CREATE OR REPLACE FUNCTION public.credit_marks(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text,
  p_stripe_session_id text DEFAULT NULL
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

  INSERT INTO public.mark_transactions (user_id, amount, reason, stripe_session_id, balance_after)
  VALUES (p_user_id, p_amount, p_reason, p_stripe_session_id, v_balance);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Give existing users their 100 signup Marks (idempotent) ─
UPDATE public.profiles
SET marks = 100
WHERE marks IS NULL OR marks = 0;


-- ============================================================
-- DONE · v4 CHAT + MARKS MIGRATION
-- Manual Stripe setup is still required — see README.
-- ============================================================
