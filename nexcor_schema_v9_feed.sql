-- ============================================================
-- NEXCOR · Migration v9 (SIGNAL FEED)
-- Social feed: posts with optional images + likes (resonates)
--
-- Run in Supabase SQL editor after v8 has been applied.
-- ============================================================

-- Posts
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  image_url  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Resonates (likes)
CREATE TABLE IF NOT EXISTS public.feed_post_likes (
  post_id    uuid        NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS feed_posts_created_at_idx ON public.feed_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS feed_posts_user_id_idx    ON public.feed_posts (user_id);
CREATE INDEX IF NOT EXISTS feed_post_likes_post_idx  ON public.feed_post_likes (post_id);

-- RLS
ALTER TABLE public.feed_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_post_likes ENABLE ROW LEVEL SECURITY;

-- feed_posts policies
DROP POLICY IF EXISTS "feed_posts_select" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_insert" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_delete" ON public.feed_posts;

CREATE POLICY "feed_posts_select" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "feed_posts_insert" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_posts_delete" ON public.feed_posts FOR DELETE USING (auth.uid() = user_id);

-- feed_post_likes policies
DROP POLICY IF EXISTS "feed_likes_select" ON public.feed_post_likes;
DROP POLICY IF EXISTS "feed_likes_insert" ON public.feed_post_likes;
DROP POLICY IF EXISTS "feed_likes_delete" ON public.feed_post_likes;

CREATE POLICY "feed_likes_select" ON public.feed_post_likes FOR SELECT USING (true);
CREATE POLICY "feed_likes_insert" ON public.feed_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_likes_delete" ON public.feed_post_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for post images (do this in Supabase dashboard):
--
--   Storage → New bucket
--   Name:              post-images
--   Public:            YES
--   File size limit:   10MB
--   Allowed MIME:      image/jpeg, image/png, image/webp, image/gif
--
--   INSERT policy:  (storage.foldername(name))[1] = auth.uid()::text
--   DELETE policy:  (storage.foldername(name))[1] = auth.uid()::text
--   SELECT policy:  true (public read)
-- ============================================================
