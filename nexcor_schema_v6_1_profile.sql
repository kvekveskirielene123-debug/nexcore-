-- ============================================================
-- NEXCOR · Migration v6.1 (PROFILE EDITING)
-- Adds columns needed for the /settings/profile sub-page.
--
-- Run AFTER v6 has been applied.
-- Some columns (avatar_url, username) may already exist —
-- all ADD COLUMN statements use IF NOT EXISTS to be safe.
-- ============================================================

ALTER TABLE public.profiles
  -- Bio (displayed on profile page, injected into system prompt fallback)
  ADD COLUMN IF NOT EXISTS bio text
    CHECK (bio IS NULL OR char_length(bio) <= 300),

  -- Tone preference (global fallback when no persona is active)
  ADD COLUMN IF NOT EXISTS tone_preference text NOT NULL DEFAULT 'casual'
    CHECK (tone_preference IN ('casual','formal','playful','gentle','serious','flirty')),

  -- Avatar (public URL from user-avatars storage bucket)
  ADD COLUMN IF NOT EXISTS avatar_url text,

  -- Rate-limit username changes: track when last changed
  ADD COLUMN IF NOT EXISTS username_changed_at timestamptz;

-- ============================================================
-- ⚠️  STORAGE BUCKET (manual step — do this in Supabase dashboard):
--
--   1. Storage → New bucket
--   2. Name: user-avatars
--   3. Public: YES
--   4. File size limit: 5MB
--   5. Allowed MIME types: image/jpeg, image/png, image/webp
--
--   Storage policies for INSERT/UPDATE/DELETE:
--     bucket_id = 'user-avatars'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--
--   SELECT policy: true (public read)
-- ============================================================
