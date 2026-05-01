# Nexcor Support Chat — File Package

Lightweight in-app support form. Users fill it out, click Send, and their default email app opens with everything prefilled to **kvekveskirielene123@mail.com**.

---

## What's in this package

```
src/
├── components/support/
│   ├── SupportContactButton.tsx   ← Drop into Settings page
│   └── SupportContactDialog.tsx   ← Modal dialog with the form
└── lib/support/
    ├── buildSupportEmail.ts        ← Assembles the mailto URL
    └── browserInfo.ts              ← Detects user's browser + OS
```

**4 files total. No API routes. No database tables. No env vars needed.**

---

## How to add it to your project

On your Settings page (when you build it — or wherever you want the button), import the button:

```tsx
import { SupportContactButton } from "@/components/support/SupportContactButton";

export default function SettingsPage() {
  return (
    <section>
      <h2>Help</h2>
      <SupportContactButton />
    </section>
  );
}
```

That's it. Button renders, dialog opens on click, form handles the rest.

---

## What you receive (example email)

```
To:      kvekveskirielene123@mail.com
Subject: [Nexcor Support] Payment — kurai_bakes

USER INFO
─────────
Username: kurai_bakes
User ID:  a3f4b2c1-8b9d-4a2c-9e7f-1234567890ab
Email:    kurai@example.com
Page:     /store
Browser:  Chrome 127 on macOS
Time:     Apr 23, 2026, 3:42 PM

MESSAGE — Subject: Bought Marks but didn't get them
─────────
I bought the Medium pack for $4.99 but my balance still shows 50.
My Stripe receipt says payment successful. Please help!

—
Sent from Nexcor · 324B21
```

---

## How the form behaves

- **Required:** Topic + Message (≥10 chars, ≤2000 chars)
- **Optional:** Subject line
- **Topic options:** Bug · Payment · Feature Request · Character Issue · NSFW Report · Other
- **Auto-captured:** Username, User ID, Email, current page URL, browser + OS, timestamp
- **Fallback:** If the email app doesn't open, users can copy your email address with one click
- **Validation:** Errors shown inline, disabled Send button until message is ≥10 chars
- **Character count:** Live counter, turns amber at 1800+, red at 2000

---

## Known limitations

- Mailto links can fail silently on desktop browsers without a configured email client. The "copy email" fallback handles this.
- No file attachments (mailto limitation).
- No delivery confirmation — once the email opens in the user's client, we trust them to hit send.

---

## Upgrading later (optional)

When Nexcor grows, you'll likely want to upgrade this to a real server-backed support system with:
- Resend.com integration (auto-emails you without needing user's email client)
- Screenshot attachments
- A `support_tickets` table in Supabase for history
- Status tracking (open/resolved)

For now, mailto is fine and costs nothing.

---

## 🥖🧬 Direct line to Kurai & Big G
