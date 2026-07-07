-- ══════════════════════════════════════════════════════════════════
-- RLS AUDIT FIX
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- Safe to re-run — DROP IF EXISTS guards all policy creates.
-- ══════════════════════════════════════════════════════════════════


-- ── 1. mark_transactions ─────────────────────────────────────────
-- Users can read their own transaction history; all writes go
-- through credit_marks / deduct_marks SECURITY DEFINER RPCs.

ALTER TABLE public.mark_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mark_tx_select_own"   ON public.mark_transactions;
DROP POLICY IF EXISTS "mark_tx_insert_deny"  ON public.mark_transactions;
DROP POLICY IF EXISTS "mark_tx_update_deny"  ON public.mark_transactions;
DROP POLICY IF EXISTS "mark_tx_delete_deny"  ON public.mark_transactions;

CREATE POLICY "mark_tx_select_own"
  ON public.mark_transactions FOR SELECT
  USING (user_id = auth.uid());

-- No INSERT / UPDATE / DELETE policies → authenticated users cannot
-- write transaction rows directly; only service-role RPCs can.


-- ── 2. feed_posts ────────────────────────────────────────────────
-- SELECT is public. INSERT / UPDATE / DELETE require ownership.

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_posts_select" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_insert" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_update" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_delete" ON public.feed_posts;

CREATE POLICY "feed_posts_select"
  ON public.feed_posts FOR SELECT
  USING (true);

CREATE POLICY "feed_posts_insert"
  ON public.feed_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "feed_posts_update"
  ON public.feed_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "feed_posts_delete"
  ON public.feed_posts FOR DELETE
  USING (user_id = auth.uid());


-- ── 3. feed_comments ─────────────────────────────────────────────

ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_comments_select" ON public.feed_comments;
DROP POLICY IF EXISTS "feed_comments_insert" ON public.feed_comments;
DROP POLICY IF EXISTS "feed_comments_update" ON public.feed_comments;
DROP POLICY IF EXISTS "feed_comments_delete" ON public.feed_comments;

CREATE POLICY "feed_comments_select"
  ON public.feed_comments FOR SELECT
  USING (true);

CREATE POLICY "feed_comments_insert"
  ON public.feed_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "feed_comments_update"
  ON public.feed_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "feed_comments_delete"
  ON public.feed_comments FOR DELETE
  USING (user_id = auth.uid());


-- ── 4. profiles — column-level UPDATE restriction ────────────────
-- Remove blanket UPDATE privilege from the authenticated role, then
-- grant only the columns that the mobile app legitimately writes.
-- Sensitive fields (marks, subscription_expires_at, banned, strikes,
-- banned_until, referral_redeemed) can only be written by the
-- service role via SECURITY DEFINER functions.

REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  username,
  bio,
  website_url,
  avatar_url,
  push_token,
  show_nsfw,
  equipped_frame,
  equipped_banner,
  equipped_name_effect,
  equipped_bubble_theme,
  default_model,
  chat_font_size
) ON public.profiles TO authenticated;


-- ── 5. feed_posts / feed_comments — ban check on INSERT ──────────
-- Banned users cannot post or comment even via direct Supabase client.

DROP POLICY IF EXISTS "feed_posts_insert" ON public.feed_posts;
CREATE POLICY "feed_posts_insert"
  ON public.feed_posts FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (banned = true OR (banned_until IS NOT NULL AND banned_until > now()))
    )
  );

DROP POLICY IF EXISTS "feed_comments_insert" ON public.feed_comments;
CREATE POLICY "feed_comments_insert"
  ON public.feed_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (banned = true OR (banned_until IS NOT NULL AND banned_until > now()))
    )
  );


-- ── 6. Storage bucket policies ───────────────────────────────────
-- Prevent listing / enumerating other users' files.
-- Direct URL access for public buckets is unaffected (bypasses RLS).

DROP POLICY IF EXISTS "storage_select_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own_files"  ON storage.objects;

CREATE POLICY "storage_select_own_folder"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_insert_own_folder"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_delete_own_files"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);


-- ── 7. profiles — revoke push_token column from authenticated ─────
-- push_token is read server-side only via supabaseAdmin.
-- No mobile client code reads it; revoking prevents any user from
-- querying another user's token and sending direct Expo push calls.

REVOKE SELECT (push_token) ON public.profiles FROM authenticated;


-- ── 8. reports ───────────────────────────────────────────────────
-- Enable RLS, restrict reads to own reports, enforce reporter_id on
-- INSERT, and block duplicate reports for the same content item.

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
DROP POLICY IF EXISTS "reports_insert"     ON public.reports;

CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "reports_insert"
  ON public.reports FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.reporter_id = auth.uid()
        AND r.content_id = content_id
        AND r.content_type = content_type
    )
  );
