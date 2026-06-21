-- Add token usage columns to messages table.
-- Run in Supabase SQL editor.

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS model_used     TEXT,
  ADD COLUMN IF NOT EXISTS marks_cost     INTEGER,
  ADD COLUMN IF NOT EXISTS input_tokens   INTEGER,
  ADD COLUMN IF NOT EXISTS output_tokens  INTEGER;

-- Index to make per-model usage queries fast
CREATE INDEX IF NOT EXISTS messages_model_used_idx
  ON messages (model_used, created_at DESC)
  WHERE model_used IS NOT NULL;
