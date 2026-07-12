-- Ad watch tracking columns on profiles
-- "Daily" window is 24h from first ad watched, NOT calendar midnight,
-- so users can't game the reset by knowing the UTC midnight cutoff.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ad_first_watched_at      TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ads_watched_total_window  INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ad_batch_start_at         TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ads_watched_in_batch      INTEGER     DEFAULT 0;
