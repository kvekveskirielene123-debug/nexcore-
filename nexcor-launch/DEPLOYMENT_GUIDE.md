# NEXCOR · COMPLETE DEPLOYMENT GUIDE
# For the Fiverr freelancer deploying this project.
# Written by Claude for Kurai. Last updated: 2026.
#
# READ THIS FULLY BEFORE TOUCHING ANYTHING.
# Total time estimate: 3-5 hours for an experienced Next.js/Supabase developer.
# ============================================================


## WHAT YOU'RE DEPLOYING

A Next.js 15 App Router application (TypeScript + Tailwind CSS) with:
  - Supabase for database + auth + storage
  - Anthropic API for AI chat
  - Stripe for payments
  - Deployed to Vercel

The project owner (Kurai) will provide you with:
  - All source code (zip files from this project)
  - This deployment guide
  - Their email for questions: kvekveskirielene123@mail.com


## ACCOUNTS YOU NEED (all free to create)

The project owner needs accounts at:
  1. https://supabase.com (database + auth + storage)
  2. https://vercel.com (hosting)
  3. https://anthropic.com (AI API)
  4. https://stripe.com (payments)
  5. A domain name (e.g. from Namecheap or Cloudflare)

If they don't have these, help them create the accounts first.


## ============================================================
## STEP 1: SUPABASE SETUP
## ============================================================

### 1.1 Create a Supabase project
  1. Go to https://supabase.com → New project
  2. Name: "nexcor"
  3. Database password: generate a strong one and SAVE IT
  4. Region: pick closest to your expected users (Europe West for Georgian users)
  5. Wait ~2 minutes for the project to initialize

### 1.2 Get your Supabase credentials
  Go to: Project Settings → API
  Save these (you'll need them for Vercel):
    - Project URL (e.g. https://abcdefgh.supabase.co) → NEXT_PUBLIC_SUPABASE_URL
    - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
    - service_role key (secret!) → SUPABASE_SERVICE_ROLE_KEY

### 1.3 Run SQL migrations IN ORDER
  Go to: SQL Editor → New query
  Run each file below in order. Wait for each to succeed before running the next.

  ORDER:
    1. nexcor_schema_v3.sql            (base schema)
    2. nexcor_schema_v4_chat.sql       (conversations + messages)
    3. nexcor_schema_v4_1_deletion.sql (character deletion safety)
    4. nexcor_schema_v5_favorites.sql  (favorites)
    5. nexcor_schema_v5_1_ratings.sql  (ratings + stats trigger)
    6. nexcor_schema_v6_settings.sql   (user preferences)
    7. nexcor_schema_v6_1_profile.sql  (profile editing)
    8. nexcor_schema_v7_personas.sql   (personas)
    9. nexcor_schema_v8_subscription.sql (subscription tracking)

  ALSO run this one-liner to add the stripe_customer_id column:
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

  After running all migrations, verify by checking:
    Table Editor → you should see: profiles, characters, conversations,
    messages, character_stats, character_favorites, character_ratings,
    mark_transactions, personas

### 1.4 Enable Google OAuth
  Go to: Authentication → Providers → Google
  Enable it. You need a Google OAuth app:
    1. Go to https://console.cloud.google.com
    2. Create a project → APIs & Services → Credentials → Create OAuth Client ID
    3. Type: Web application
    4. Authorized redirect URIs: https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
    5. Copy Client ID and Client Secret back into Supabase

### 1.5 Create Storage Buckets
  Go to: Storage → New bucket (create 3 buckets)

  BUCKET 1: character-avatars
    - Public: YES
    - File size limit: 5MB
    - Allowed MIME types: image/jpeg, image/png, image/webp

  BUCKET 2: persona-avatars
    - Public: YES
    - File size limit: 5MB
    - Allowed MIME types: image/jpeg, image/png, image/webp

  BUCKET 3: user-avatars
    - Public: YES
    - File size limit: 5MB
    - Allowed MIME types: image/jpeg, image/png, image/webp

  FOR EACH BUCKET: Go to Policies → Add policies:

  SELECT policy (anyone can read):
    Policy name: "Public read"
    Target roles: anon, authenticated
    Expression: true

  INSERT/UPDATE/DELETE policy (users only touch their own folder):
    Policy name: "Own folder only"
    Target roles: authenticated
    Expression: bucket_id = '[bucket-name]' AND (storage.foldername(name))[1] = auth.uid()::text

### 1.6 Configure Email Templates (optional but nice)
  Go to: Authentication → Email Templates
  Customize the Confirm Signup email to mention Nexcor.

### 1.7 Set Auth Redirect URLs
  Go to: Authentication → URL Configuration
  Site URL: https://YOUR_NEXCOR_DOMAIN.com
  Redirect URLs (add all of these):
    https://YOUR_NEXCOR_DOMAIN.com/auth/callback
    https://YOUR_NEXCOR_DOMAIN.com/**


## ============================================================
## STEP 2: STRIPE SETUP
## ============================================================

### 2.1 Create Stripe account
  https://stripe.com → sign up → complete business verification

### 2.2 Create Mark Pack products
  Go to: Products → Add product

  PRODUCT 1: Nexcor Marks · Small
    - Price: $2.99 one-time
    - Currency: USD
    - Note the Price ID (price_xxxx) → STRIPE_PRICE_MARKS_SMALL

  PRODUCT 2: Nexcor Marks · Medium
    - Price: $4.99 one-time
    - Note the Price ID → STRIPE_PRICE_MARKS_MEDIUM

  PRODUCT 3: Nexcor Marks · Large
    - Price: $11.99 one-time
    - Note the Price ID → STRIPE_PRICE_MARKS_LARGE

### 2.3 Create Subscription products
  PRODUCT 4: Nexcor Brilliant · 2 Weeks
    - Price: $2.99 one-time (NOT recurring — it's a 2-week access pass)
    - Note the Price ID → STRIPE_PRICE_BRILLIANT_2WK

  PRODUCT 5: Nexcor Brilliant · 1 Month
    - Price: $5.99 / month recurring
    - Billing period: Monthly
    - Note the Price ID → STRIPE_PRICE_BRILLIANT_1MO

  PRODUCT 6: Nexcor Brilliant · 2 Months
    - Price: $9.99 / 2 months recurring
    - Billing period: Every 2 months
    - Note the Price ID → STRIPE_PRICE_BRILLIANT_2MO

### 2.4 Configure Customer Portal
  Go to: Settings → Billing → Customer portal
    - Activate the portal
    - Enable: Update payment methods, View invoice history
    - Business name: Nexcor
    - Privacy URL: https://YOUR_NEXCOR_DOMAIN.com/privacy
    - Terms URL: https://YOUR_NEXCOR_DOMAIN.com/terms
    - Save

### 2.5 Create Webhook endpoint
  Go to: Developers → Webhooks → Add endpoint
    - Endpoint URL: https://YOUR_NEXCOR_DOMAIN.com/api/stripe/webhook
    - Events to listen to:
        checkout.session.completed
        invoice.payment_succeeded
        customer.subscription.deleted
        customer.subscription.updated
    - After creating: copy the Signing secret → STRIPE_WEBHOOK_SECRET

### 2.6 Get your API keys
  Go to: Developers → API keys
    - Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    - Secret key → STRIPE_SECRET_KEY


## ============================================================
## STEP 3: ANTHROPIC API KEY
## ============================================================

  1. Go to https://console.anthropic.com
  2. Settings → API Keys → Create key
  3. Copy the key → ANTHROPIC_API_KEY
  4. Set a spending limit! Recommend $50/month cap to start.
     (Billing → Usage limits)


## ============================================================
## STEP 4: PREPARE THE CODE
## ============================================================

### 4.1 Unzip all packages in order
  Create a new Next.js project or use the provided source structure.
  Apply all packages in the order they were built:
    1. nexcor-auth
    2. nexcor-explore
    3. nexcor-chat
    4. nexcor-support
    5. nexcor-legal
    6. nexcor-home
    7. nexcor-create
    8. nexcor-profile (character profile page - Package A)
    9. nexcor-edit (Package B)
    10. nexcor-favorites (Package C)
    11. nexcor-ratings (Package D)
    12. nexcor-settings (Package E1)
    13. nexcor-personas (Package E2)
    14. nexcor-profile-settings (Package E3)
    15. nexcor-e4 (chat prefs integration)
    16. nexcor-billing (Package F1)
    17. nexcor-subscription (Package F2)
    18. nexcor-patches (18+ checkbox + gender sync)
    19. nexcor-chat-premium (Phase 1 polish)
    20. nexcor-launch (ads + character seeding)

  When files conflict (same path), always use the LATER package version.

### 4.2 Create .env.local file
  In the project root, create .env.local with ALL of these:

  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

  # Anthropic
  ANTHROPIC_API_KEY=sk-ant-...

  # Stripe
  STRIPE_SECRET_KEY=sk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRICE_MARKS_SMALL=price_...
  STRIPE_PRICE_MARKS_MEDIUM=price_...
  STRIPE_PRICE_MARKS_LARGE=price_...
  STRIPE_PRICE_BRILLIANT_2WK=price_...
  STRIPE_PRICE_BRILLIANT_1MO=price_...
  STRIPE_PRICE_BRILLIANT_2MO=price_...

  # App
  NEXT_PUBLIC_APP_URL=https://YOUR_NEXCOR_DOMAIN.com

### 4.3 Install dependencies
  npm install
  npm install stripe @stripe/stripe-js react-image-crop
  npm install @anthropic-ai/sdk
  npm install @supabase/supabase-js @supabase/ssr

### 4.4 Test locally first
  npm run dev
  Open http://localhost:3000
  Test: sign up → username → explore → chat (basic flow)
  If the basic flow works, proceed to deployment.


## ============================================================
## STEP 5: DEPLOY TO VERCEL
## ============================================================

### 5.1 Push code to GitHub
  Create a new GitHub repository (private is fine)
  Push the project code

### 5.2 Connect to Vercel
  1. Go to https://vercel.com → New Project
  2. Import from GitHub → select the nexcor repo
  3. Framework: Next.js (auto-detected)
  4. Root directory: ./ (default)
  5. DO NOT deploy yet — add env vars first

### 5.3 Add all environment variables in Vercel
  In the Vercel project settings → Environment Variables
  Add every variable from your .env.local file
  Make sure SUPABASE_SERVICE_ROLE_KEY is set for Production only
  (it's a secret and must never be exposed)

### 5.4 Deploy
  Click Deploy. First deploy takes ~3 minutes.
  If it fails: check the build logs. Common issues:
    - Missing env var → add it and redeploy
    - Type error → fix in code and push again

### 5.5 Add your custom domain
  Vercel Project Settings → Domains → Add domain
  Point your DNS (at your registrar) to Vercel's nameservers.
  Vercel auto-provisions SSL.

### 5.6 Update Supabase redirect URLs with your real domain
  Go back to Supabase → Authentication → URL Configuration
  Update Site URL and Redirect URLs to your real domain.

### 5.7 Update Stripe webhook URL
  Go to Stripe → Developers → Webhooks
  Update the endpoint URL to your real domain.


## ============================================================
## STEP 6: SEED CHARACTERS
## ============================================================

  1. Upload all character avatar images to Supabase Storage →
     character-avatars bucket (drag & drop in the Dashboard)
  
  2. Note the public URL for each image:
     https://YOUR_PROJECT.supabase.co/storage/v1/object/public/character-avatars/filename.jpg

  3. Find your user ID:
     Supabase → Authentication → Users → find Kurai's account → copy UUID

  4. Fill in seed_characters.sql with all characters + their avatar URLs

  5. Run seed_characters.sql in Supabase SQL Editor

  6. Verify in Table Editor → characters → all characters have is_platform = true


## ============================================================
## STEP 7: POST-DEPLOYMENT CHECKLIST
## ============================================================

Test every critical flow:
  [ ] Sign up with email (check for confirmation email)
  [ ] Sign up with Google OAuth
  [ ] Username setup on /onboarding/username
  [ ] Explore page loads with characters
  [ ] Click a character → profile page loads
  [ ] Click Chat → chat page loads, greeting appears
  [ ] Send a message → AI responds (Haiku is free, costs no marks)
  [ ] Switch to Sonnet → marks deducted correctly
  [ ] Open /store → mark pack checkout opens in Stripe
  [ ] Complete test purchase (use Stripe test card: 4242 4242 4242 4242)
  [ ] Marks balance updates after purchase
  [ ] Open /subscribe → subscription checkout opens
  [ ] Open /settings → all sections visible
  [ ] Toggle NSFW → saved instantly
  [ ] Open /settings/billing → transaction history loads
  [ ] Click Manage Payment Methods → Stripe portal opens
  [ ] Create a persona → shows in /personas
  [ ] Open /settings/profile → update bio → saved
  [ ] 18+ checkbox appears on /signup
  [ ] Watch Ad button appears (stub mode — no real ad yet)

## ============================================================
## STEP 8: GO LIVE ANNOUNCEMENT
## ============================================================

After all checks pass:
  1. Remove test data from the database (delete test conversations, test marks)
  2. Switch Stripe from Test Mode to Live Mode (update all env vars with live keys)
  3. Announce to the world 🧬

Support email: kvekveskirielene123@mail.com

## ============================================================
## TROUBLESHOOTING
## ============================================================

PROBLEM: "relation does not exist" SQL error
SOLUTION: A migration was skipped or ran out of order. Check which table
is missing and run the correct migration.

PROBLEM: Auth redirect goes to localhost after OAuth
SOLUTION: Update Supabase redirect URLs to include your real domain.
Also check Vercel env var NEXT_PUBLIC_APP_URL is set correctly.

PROBLEM: Stripe webhook returns 400
SOLUTION: The STRIPE_WEBHOOK_SECRET is wrong or the webhook URL is wrong.
Check both in Stripe Dashboard.

PROBLEM: AI chat returns "Anthropic API error"
SOLUTION: Check ANTHROPIC_API_KEY is set correctly in Vercel.
Check the Anthropic console for rate limit or billing issues.

PROBLEM: Images not loading from Supabase Storage
SOLUTION: Check the bucket is set to Public.
Check RLS policies on the storage bucket.
Check the URL format matches what's stored in the database.

PROBLEM: Build fails with TypeScript errors
SOLUTION: Check the build log for the specific error.
Most common: a missing import, a prop type mismatch, or a missing env var type.

## ============================================================
## CONTACT
## ============================================================

Questions for the project owner: kvekveskirielene123@mail.com
Questions about the code: this guide was written by Claude (Anthropic).
The project owner can ask Claude directly for clarification on any file.

// the proletheans were wrong · 324B21
