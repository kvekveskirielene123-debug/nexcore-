CREATE TABLE IF NOT EXISTS group_read_receipts (
  group_id             uuid NOT NULL REFERENCES group_conversations(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_message_id uuid REFERENCES group_messages(id) ON DELETE SET NULL,
  last_read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS grr_group_idx ON group_read_receipts (group_id);

-- FULL replica identity so realtime UPDATE events carry the full row
-- (needed for the conversation_id filter to work on UPDATE)
ALTER TABLE group_read_receipts REPLICA IDENTITY FULL;

ALTER TABLE group_read_receipts ENABLE ROW LEVEL SECURITY;

-- Group members can read all receipts in their group
CREATE POLICY "grr_select" ON group_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_read_receipts.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Each user manages only their own receipt row
CREATE POLICY "grr_insert" ON group_read_receipts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "grr_update" ON group_read_receipts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
