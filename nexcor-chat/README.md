# Nexcor Chat + Marks — Phase 1 File Package

This package adds the chat interface, Marks economy, and Mark pack store to your Nexcor project.

---

## What's in this package

```
nexcor-chat/
├── nexcor_schema_v4_chat.sql            ← DB migration (run FIRST)
├── .env.example                          ← Environment variables template
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── chat/[characterId]/
│   │   │   │   ├── page.tsx              ← Server Component
│   │   │   │   └── ChatClient.tsx        ← Main client orchestrator
│   │   │   └── store/
│   │   │       └── page.tsx              ← Mark pack store
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── stream/route.ts       ← SSE streaming endpoint
│   │       │   ├── conversations/route.ts← CRUD
│   │       │   └── title/route.ts        ← Auto-gen chat titles
│   │       └── marks/
│   │           ├── claim-daily/route.ts
│   │           ├── purchase/route.ts     ← Stripe checkout
│   │           └── webhook/route.ts      ← Stripe webhook
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ModelPicker.tsx
│   │   │   ├── VoiceInputButton.tsx
│   │   │   ├── PastChatsDrawer.tsx
│   │   │   └── InsufficientMarksModal.tsx
│   │   └── store/
│   │       ├── MarkPackCard.tsx
│   │       └── PurchaseSuccessModal.tsx
│   └── lib/
│       ├── ai/
│       │   ├── modelConfig.ts            ← Central source of truth for models
│       │   └── buildSystemPrompt.ts
│       ├── marks/
│       │   ├── balance.ts                ← deduct/credit/refund
│       │   └── dailyBonus.ts
│       └── stripe.ts
```

**Total: 27 files** (plus README + .env.example)

---

## Setup order for your freelancer

### 1. Install dependencies

```bash
npm install @anthropic-ai/sdk stripe @stripe/stripe-js
```

### 2. Run the SQL migration

Open Supabase Dashboard → SQL Editor → paste `nexcor_schema_v4_chat.sql` → Run.

This adds:
- New columns to `profiles` (marks, subscription_*, stripe_customer_id, cosmetics)
- `mark_transactions` table (audit log)
- `subscriptions` table (Phase 2 ready, unused for now)
- Two RPC functions: `deduct_marks` and `credit_marks` (atomic)
- RLS policies

### 3. Set up Stripe

- Sign up at https://stripe.com (free account, can start in test mode immediately)
- Dashboard → Products → Create 3 products:

| Product Name | Type | Price |
|---|---|---|
| Nexcor Marks — Small | One-time | $2.99 |
| Nexcor Marks — Medium | One-time | $4.99 |
| Nexcor Marks — Large | One-time | $11.99 |

- Copy each **Price ID** (starts with `price_`) into the corresponding env var

- Dashboard → Developers → API keys: copy Secret Key + Publishable Key

- Dashboard → Developers → Webhooks → Add endpoint:
  - URL: `https://your-domain.com/api/marks/webhook` (or Stripe CLI for local)
  - Event to listen for: `checkout.session.completed`
  - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

### 4. Get Anthropic API key

- Sign up at https://console.anthropic.com
- Add payment method
- Create API key: https://console.anthropic.com/settings/keys
- Paste into `ANTHROPIC_API_KEY`

### 5. Set environment variables

Copy `.env.example` to `.env.local` and fill in real values.

### 6. Test locally

```bash
npm run dev
```

Test flow:
1. Sign up → should have 100 Marks
2. Visit a character's chat page
3. Default model is Haiku — should chat freely, no Marks deducted
4. Switch to Sonnet → message deducts 10 Marks
5. Try to send 3000+ Marks worth of messages → paywall shows
6. Click "Buy Mark Pack" → Stripe checkout opens
7. Use test card `4242 4242 4242 4242`, any future date, any CVC
8. Return to `/store` — balance updated

---

## Monetization model (for reference)

### Mark costs per message

| Model | Free user | Subscriber | Notes |
|---|---|---|---|
| Haiku | 0 | 0 | Always free, unlimited |
| Sonnet | 10 | 8 | -20% for subs |
| Opus | 25 | 19 | -24% for subs |

### Mark Packs

| Pack | Marks | Price | Value |
|---|---|---|---|
| Small | 500 | $2.99 | 167/$ |
| Medium | 1,200 | $4.99 | 240/$ |
| Large | 3,000 | $11.99 | 250/$ (best) |

### Signup & rewards (Phase 1)

- Signup bonus: **100 Marks**
- Daily login bonus: **50 Marks** (once per 24h)

### Phase 2 (future, NOT in this package)

- Rewarded ads: +50 Marks each, max 5 per 30 min
- Subscriptions: $2.99/2wk, $5.99/month, $9.99/2mo
- Cosmetics: 20 bubble styles + 20 profile frames (subscriber-only)
- Model picker already supports subscriber discounts automatically via `modelConfig.ts`

---

## Architecture notes

### Streaming
- `/api/chat/stream` returns a `ReadableStream` of Server-Sent Events
- Client consumes via `fetch` + `getReader()` + decoder
- Text arrives in `content_block_delta` events, appended to the streaming message

### Atomic Mark deduction
- Supabase RPC function `deduct_marks` uses `SELECT FOR UPDATE` to prevent race conditions
- If the Anthropic API call fails after deduction, the route refunds via `credit_marks("refund_api_error")`
- Every transaction is audited in `mark_transactions`

### Title auto-generation
- After the first user message, `/api/chat/title` fires once (fire-and-forget)
- Uses Haiku for cheap title generation (saves Opus costs)
- Only updates title if `title_auto_generated = true` (user hasn't renamed)

### Voice input
- Uses browser-native `SpeechRecognition` API
- Works in Chrome, Edge, Safari (iOS 14.5+)
- Hidden automatically in Firefox/other unsupported browsers

---

## Easter eggs included

- `324B21` on search bar + modals
- `NEOLUTION SCIENCE DIVISION` in store footer
- `SESTRA PROTOCOL` references
- `KURAI & BIG G THANK YOU` in purchase success
- `TRANSMISSION COMPLETE` language throughout
- `◈` symbol as section marker
- `⟡` symbol for Marks currency

---

## Kurai & Big G — good luck. 🥖🧬
