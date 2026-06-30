-- Add soft-delete column to dm_messages (idempotent)
ALTER TABLE dm_messages
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
