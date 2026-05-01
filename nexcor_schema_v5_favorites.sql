-- ============================================================
-- NEXCOR · Migration v5 (FAVORITES)
-- Adds the character_favorites table so users can bookmark
-- characters and find them later via /favorites.
--
-- Run AFTER v4.1 has been applied.
-- Package D (ratings) will extend v5 with a second table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.character_favorites (
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  character_id  uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_char_fav_user
  ON public.character_favorites(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_char_fav_character
  ON public.character_favorites(character_id);

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.character_favorites ENABLE ROW LEVEL SECURITY;

-- Users can see and manage only their own favorites.
CREATE POLICY "favorites: own read"
  ON public.character_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites: own insert"
  ON public.character_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites: own delete"
  ON public.character_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DONE · Favorites system ready.
-- ============================================================
