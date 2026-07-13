-- v24: Persistent in-app notification feed
-- Run in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  type         TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  body         TEXT        NOT NULL,
  data         JSONB       NOT NULL DEFAULT '{}',
  read         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: all notifications for a user, newest first
CREATE INDEX IF NOT EXISTS notifications_recipient_idx
  ON notifications (recipient_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);
