-- ============================================================
-- NEXCOR · Migration v6 (USER PREFERENCES)
-- Adds the columns that back the Settings page preferences.
--
-- Run AFTER v5.1 has been applied.
-- ============================================================

ALTER TABLE public.profiles
  -- Already-locked schema columns (re-asserting in case anything missed):
  ADD COLUMN IF NOT EXISTS show_nsfw           boolean NOT NULL DEFAULT false,

  -- New preference columns:
  ADD COLUMN IF NOT EXISTS default_model       text    NOT NULL DEFAULT 'haiku'
    CHECK (default_model IN ('haiku', 'sonnet', 'opus')),

  ADD COLUMN IF NOT EXISTS chat_language       text    NOT NULL DEFAULT 'en',
  -- ISO 639-1 codes: en, ka (Georgian), ru, es, fr, de, pt, it, ja, zh, ko, etc.

  ADD COLUMN IF NOT EXISTS pref_italics_on     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pref_gray_text_on   boolean NOT NULL DEFAULT true,

  ADD COLUMN IF NOT EXISTS chat_font_size      text    NOT NULL DEFAULT 'medium'
    CHECK (chat_font_size IN ('small', 'medium', 'large')),

  ADD COLUMN IF NOT EXISTS chat_theme          text    NOT NULL DEFAULT 'midnight'
    CHECK (chat_theme IN ('midnight', 'bloodline', 'dawn', 'helix', 'void')),

  -- Reserved for E2 (personas — not built yet but column ready):
  ADD COLUMN IF NOT EXISTS default_persona_id  uuid;

-- ============================================================
-- DONE. All preferences have safe defaults so existing users
-- get sensible behavior automatically.
-- ============================================================
