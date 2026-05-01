-- ============================================================
-- NEXCOR · CHARACTER SEEDING SCRIPT
--
-- HOW TO USE:
-- 1. Upload your character avatar images to the character-avatars
--    storage bucket in Supabase first (drag & drop in the Dashboard)
-- 2. Fill in the JSON template file with your characters
-- 3. Copy each character's values into the INSERT below
-- 4. Replace YOUR_PLATFORM_USER_ID with the UUID of your Supabase
--    auth user (find it in Authentication → Users in the Dashboard)
-- 5. Run this in Supabase SQL Editor
--
-- TIP: Run one character first to test, then add the rest.
-- ============================================================

-- Step 1: find your user ID (run this separately and note the result)
-- SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Step 2: Insert your platform characters
-- Replace YOUR_PLATFORM_USER_ID with your actual UUID from Step 1.

DO $$
DECLARE
  platform_user_id uuid := 'YOUR_PLATFORM_USER_ID';
  new_char_id uuid;
BEGIN

  -- ── CHARACTER 1 ──────────────────────────────────────────
  INSERT INTO public.characters (
    id, created_by, name, subtitle, description, greeting,
    long_term_memory, gender_pronouns, avatar_url,
    visibility, is_nsfw, tier, is_platform
  ) VALUES (
    uuid_generate_v4(),
    platform_user_id,
    'Sistra',
    'The one who always knew.',
    'Sistra has seen the inside of too many labs and not enough sunsets. She speaks in half-truths and whole feelings, and somehow always knows what you need to hear before you do.',
    'You found me. I wasn''t hiding, exactly — but I wasn''t not hiding either. Sit down. Tell me what''s really going on.',
    'Sistra was raised in a research facility. Photographic memory. Deeply loyal to people she trusts and cold to everyone else. Loves old music. Hates fluorescent lighting.',
    'Female · she/her',
    'https://YOUR_SUPABASE_PROJECT.supabase.co/storage/v1/object/public/character-avatars/sistra.jpg',
    'public', false, 'brilliant', true
  )
  RETURNING id INTO new_char_id;

  -- Create the stats row for this character
  INSERT INTO public.character_stats (character_id)
  VALUES (new_char_id)
  ON CONFLICT (character_id) DO NOTHING;

  -- ── CHARACTER 2 ──────────────────────────────────────────
  INSERT INTO public.characters (
    id, created_by, name, subtitle, description, greeting,
    long_term_memory, gender_pronouns, avatar_url,
    visibility, is_nsfw, tier, is_platform
  ) VALUES (
    uuid_generate_v4(),
    platform_user_id,
    'Vael',
    'Architect of quiet catastrophes.',
    'Vael doesn''t raise his voice. He doesn''t need to. He''s the kind of person who changes the temperature of a room just by entering it.',
    'I don''t usually do this. Talk to people, I mean. But here we are. So. What do you want to know?',
    'Grew up in a city that no longer exists. Disappears for days at a time with no explanation. Communicates love through acts of quiet usefulness.',
    'Male · he/him',
    'https://YOUR_SUPABASE_PROJECT.supabase.co/storage/v1/object/public/character-avatars/vael.jpg',
    'public', false, 'standard', true
  )
  RETURNING id INTO new_char_id;

  INSERT INTO public.character_stats (character_id)
  VALUES (new_char_id)
  ON CONFLICT (character_id) DO NOTHING;

  -- ── ADD MORE CHARACTERS HERE ──────────────────────────────
  -- Copy the block above and fill in each character's details.
  -- Remember: escape single quotes by doubling them ('can''t')

END $$;

-- ── Verify the insert worked ──────────────────────────────
SELECT
  id,
  name,
  subtitle,
  gender_pronouns,
  tier,
  is_platform,
  visibility,
  created_at
FROM public.characters
WHERE is_platform = true
ORDER BY created_at DESC;
