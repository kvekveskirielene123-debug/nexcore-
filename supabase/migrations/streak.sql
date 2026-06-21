-- Streak bonus system columns on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_streak        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date      DATE,
  ADD COLUMN IF NOT EXISTS streak_freezes_used   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_freeze_month   TEXT;
