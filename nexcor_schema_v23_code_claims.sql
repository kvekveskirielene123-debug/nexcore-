-- v23: Friend code claims — existing users can redeem a friend's invite code
-- for +50 marks to both parties (one lifetime claim per user).

CREATE TABLE IF NOT EXISTS code_claims (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  claimer_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  no_self_claim CHECK (claimer_id != owner_id)
);

-- One claim per user, ever
CREATE UNIQUE INDEX IF NOT EXISTS code_claims_claimer_unique ON code_claims (claimer_id);

-- RLS: users can only see their own claim record (used by the mobile app to check status on load)
ALTER TABLE code_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own claim" ON code_claims
  FOR SELECT USING (auth.uid() = claimer_id);
