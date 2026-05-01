-- ============================================================
-- NEXCOR · Migration v8 (SUBSCRIPTION TRACKING)
-- Adds cancel reason storage + subscription tier label.
-- Run AFTER v7 has been applied.
-- ============================================================

ALTER TABLE public.profiles
  -- Store the reason they cancelled (from the survey)
  ADD COLUMN IF NOT EXISTS subscription_cancel_reason  text,

  -- Free-text "other" reason from cancel survey
  ADD COLUMN IF NOT EXISTS subscription_cancel_other   text,

  -- Human-readable tier label (free / brilliant_2wk / brilliant_1mo / brilliant_2mo)
  ADD COLUMN IF NOT EXISTS subscription_tier           text NOT NULL DEFAULT 'free',

  -- Stripe subscription ID so we can cancel it via API
  ADD COLUMN IF NOT EXISTS stripe_subscription_id      text;

-- ============================================================
-- DONE.
-- ============================================================
