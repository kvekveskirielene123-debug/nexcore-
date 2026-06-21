-- ============================================================
-- Referral System
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Add referral columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_redeemed BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial unique index so multiple NULLs are allowed but non-NULL codes must be unique
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_unique
  ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- 2. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  CONSTRAINT referrals_referred_unique UNIQUE (referred_id),
  CONSTRAINT referrals_status_check CHECK (status IN ('pending', 'completed')),
  CONSTRAINT referrals_no_self CHECK (referrer_id != referred_id)
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_pending_idx  ON referrals(referred_id) WHERE status = 'pending';

-- 3. Function to generate a random 6-char alphanumeric code
--    Uses characters that are unambiguous (no 0/O, 1/I)
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
