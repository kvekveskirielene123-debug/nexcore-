-- ─────────────────────────────────────────────────────────────
-- v11  Content Moderation: reports, bans, admin users
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- ── Admin users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Only admins can see the table
CREATE POLICY "admins_read_own" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ── Reports ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type text NOT NULL
    CHECK (content_type IN ('character', 'post', 'comment', 'user', 'message')),
  content_id  text NOT NULL,
  reason      text NOT NULL
    CHECK (reason IN ('spam', 'nsfw_unlabeled', 'harassment', 'misinformation', 'illegal', 'other')),
  details     text,
  status      text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- Anyone can insert a report
CREATE POLICY "anyone_insert_report" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- Users can see their own reports; admins see all (handled in API)
CREATE POLICY "user_read_own_reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

-- ── User bans ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_bans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason     text,
  expires_at timestamptz, -- NULL = permanent
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
-- Users can check if they themselves are banned
CREATE POLICY "user_read_own_ban" ON public.user_bans
  FOR SELECT USING (user_id = auth.uid());

-- ── Helper: is current user an admin ─────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS reports_status_idx     ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_content_idx    ON public.reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS reports_reporter_idx   ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS user_bans_user_idx     ON public.user_bans(user_id);
