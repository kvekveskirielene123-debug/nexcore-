-- Weekly AI generate counter stored in DB so it survives serverless cold starts.
-- Previously tracked in-process RAM which reset on every restart, making the
-- weekly limit (15 free / 50 Brilliant) trivially bypassable.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_gen_week_count  integer     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_gen_week_reset  date;
