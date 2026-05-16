-- ============================================================
-- NEXCOR · Migration v12 (PUBLIC RLS)
-- Allows anonymous (logged-out) users to read public characters
-- and public profiles. Required for explore page to work without login.
-- ============================================================

-- Characters: anyone can SELECT rows where visibility = 'public'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'characters' AND policyname = 'characters_public_read'
  ) THEN
    CREATE POLICY "characters_public_read"
      ON public.characters
      FOR SELECT
      USING (visibility = 'public');
  END IF;
END $$;

-- Profiles: anyone can read public profile info (needed for character creator display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_public_read'
  ) THEN
    CREATE POLICY "profiles_public_read"
      ON public.profiles
      FOR SELECT
      USING (true);
  END IF;
END $$;
