-- ============================================================
-- NEXCOR · Migration v5.1 (RATINGS)
-- Adds character_ratings table + cached aggregates on
-- character_stats + a trigger that keeps them in sync.
--
-- Run AFTER v5 (favorites) has been applied.
-- ============================================================

-- ── Ratings table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.character_ratings (
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  character_id  uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  rating        int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_char_ratings_character
  ON public.character_ratings(character_id);


-- ── Cached aggregates on character_stats ─────────────────
ALTER TABLE public.character_stats
  ADD COLUMN IF NOT EXISTS rating_sum   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;


-- ── Trigger function: keep rating_sum / rating_count in sync ─
CREATE OR REPLACE FUNCTION public.sync_character_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.character_stats (character_id, rating_sum, rating_count)
    VALUES (NEW.character_id, NEW.rating, 1)
    ON CONFLICT (character_id) DO UPDATE SET
      rating_sum   = public.character_stats.rating_sum   + NEW.rating,
      rating_count = public.character_stats.rating_count + 1;
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.rating IS DISTINCT FROM OLD.rating) THEN
      UPDATE public.character_stats
      SET rating_sum = rating_sum - OLD.rating + NEW.rating
      WHERE character_id = NEW.character_id;
    END IF;
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.character_stats
    SET rating_sum   = GREATEST(rating_sum - OLD.rating, 0),
        rating_count = GREATEST(rating_count - 1, 0)
    WHERE character_id = OLD.character_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS trg_sync_character_rating_stats ON public.character_ratings;

CREATE TRIGGER trg_sync_character_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.character_ratings
  FOR EACH ROW EXECUTE FUNCTION public.sync_character_rating_stats();


-- ── One-time backfill for any ratings that might already exist ─
-- (safe if table is empty — just resets nothing)
UPDATE public.character_stats cs
SET
  rating_sum   = COALESCE(sub.sum_rating, 0),
  rating_count = COALESCE(sub.count_rating, 0)
FROM (
  SELECT character_id, SUM(rating)::int AS sum_rating, COUNT(*)::int AS count_rating
  FROM public.character_ratings
  GROUP BY character_id
) sub
WHERE cs.character_id = sub.character_id;


-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.character_ratings ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read ratings (for "your rating" lookup;
-- aggregate stats are read from character_stats, which is already public).
CREATE POLICY "ratings: own read"
  ON public.character_ratings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert/update/delete their own ratings.
CREATE POLICY "ratings: own insert"
  ON public.character_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings: own update"
  ON public.character_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings: own delete"
  ON public.character_ratings FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- DONE · Ratings system ready.
-- ============================================================
