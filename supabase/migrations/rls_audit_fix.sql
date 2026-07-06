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
  username_changed_at,
  bio,
  website_url,
  avatar_url,
  push_token,
  show_nsfw,
  pref_italics_on,
  equipped_frame,
  equipped_banner,
  equipped_name_effect,
  equipped_bubble_theme,
  pinned_post_id,
  default_model,
  chat_font_size
) ON public.profiles TO authenticated;
