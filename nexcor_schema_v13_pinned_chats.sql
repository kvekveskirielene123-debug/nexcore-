-- v13: Add is_pinned to conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_pinned
  ON public.conversations(user_id, is_pinned)
  WHERE is_pinned = true;
