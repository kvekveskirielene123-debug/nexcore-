-- ============================================================
-- NEXCOR · Migration v4.1 (CHARACTER DELETION SAFETY)
-- Allows creators to delete their characters without destroying
-- the conversations users had with them. Chats become orphaned
-- but preserved ("archived — character deleted").
--
-- Run AFTER v4 has been applied.
-- ============================================================

-- Drop the existing FK constraint on conversations.character_id
-- (its name matches the auto-generated Postgres pattern).
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_character_id_fkey;

-- Recreate it as nullable with ON DELETE SET NULL.
-- This is safe because conversations.character_id is already nullable
-- in schema v3 (it's just FK'd to characters.id).
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_character_id_fkey
  FOREIGN KEY (character_id)
  REFERENCES public.characters(id)
  ON DELETE SET NULL;

-- ============================================================
-- DONE. Characters can now be safely deleted.
-- Their conversations will have character_id = NULL afterward,
-- which the /chat and /character pages handle gracefully.
-- ============================================================
