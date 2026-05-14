-- ─────────────────────────────────────────────────────────────────────────────
-- NEXCOR Schema v10 — Feed Social Features
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend feed_posts with NSFW flag and tags array
ALTER TABLE public.feed_posts
  ADD COLUMN IF NOT EXISTS nsfw boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- 2. Comments table (supports one level of nesting via parent_id)
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.feed_posts(id)    ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id)            ON DELETE CASCADE,
  parent_id  uuid        REFERENCES public.feed_comments(id)          ON DELETE CASCADE,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feed_comments_post_id_idx    ON public.feed_comments(post_id);
CREATE INDEX IF NOT EXISTS feed_comments_parent_id_idx  ON public.feed_comments(parent_id);
CREATE INDEX IF NOT EXISTS feed_comments_user_id_idx    ON public.feed_comments(user_id);

-- 3. Row Level Security
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feed_comments' AND policyname = 'comments_select_all'
  ) THEN
    CREATE POLICY "comments_select_all" ON public.feed_comments FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feed_comments' AND policyname = 'comments_insert_own'
  ) THEN
    CREATE POLICY "comments_insert_own" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feed_comments' AND policyname = 'comments_delete_own'
  ) THEN
    CREATE POLICY "comments_delete_own" ON public.feed_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
