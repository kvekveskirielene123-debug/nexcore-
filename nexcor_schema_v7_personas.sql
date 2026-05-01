-- ============================================================
-- NEXCOR · Migration v7 (PERSONAS)
-- Users can now create personas — saved profiles of themselves —
-- that get injected into the AI's system prompt.
--
-- Free users: 1 persona (enforced server-side in API route)
-- Subscribers: unlimited
--
-- Run AFTER v6 has been applied.
-- ============================================================

-- ── personas table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.personas (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- core identity
  name            text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 40),
  age             int  NOT NULL CHECK (age >= 18 AND age <= 120),
  gender_pronouns text NOT NULL CHECK (char_length(trim(gender_pronouns)) BETWEEN 1 AND 60),

  -- expression
  bio             text          CHECK (bio IS NULL OR char_length(bio) <= 2000),
  tone            text NOT NULL DEFAULT 'casual'
    CHECK (tone IN ('formal','casual','playful','gentle','serious','flirty')),
  tags            text[] NOT NULL DEFAULT '{}',
  hobbies_text    text          CHECK (hobbies_text IS NULL OR char_length(hobbies_text) <= 500),
  avatar_url      text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personas_user
  ON public.personas(user_id, created_at DESC);


-- updated_at auto-bump
CREATE OR REPLACE FUNCTION public.bump_persona_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_personas_updated_at ON public.personas;
CREATE TRIGGER trg_personas_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW EXECUTE FUNCTION public.bump_persona_updated_at();


-- ── conversations: track which persona was active ──────
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS persona_id uuid;

-- We use SET NULL so deleting a persona doesn't break old chats.
-- (Same pattern as character_id from migration v4.1.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversations_persona_id_fkey'
      AND table_name = 'conversations'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_persona_id_fkey
      FOREIGN KEY (persona_id)
      REFERENCES public.personas(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversations_persona
  ON public.conversations(persona_id) WHERE persona_id IS NOT NULL;


-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personas: own read"
  ON public.personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "personas: own insert"
  ON public.personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personas: own update"
  ON public.personas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personas: own delete"
  ON public.personas FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- DONE.
--
-- ⚠️  STORAGE BUCKET (do this manually in Supabase dashboard):
--
--   1. Go to: Storage → New bucket
--   2. Name: persona-avatars
--   3. Public: YES (so avatars can render in chat)
--   4. File size limit: 5MB
--   5. Allowed MIME types: image/jpeg, image/png, image/webp
--
--   Then add policies:
--     - SELECT: anyone (public read)
--     - INSERT: authenticated users, only into their own folder
--     - UPDATE: same
--     - DELETE: same
--
--   Policy expression for INSERT/UPDATE/DELETE:
--     bucket_id = 'persona-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
-- ============================================================
