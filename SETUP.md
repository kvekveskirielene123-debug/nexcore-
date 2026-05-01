# Nexcor Auth — Drop-in Bundle

This folder contains **10 files** that give you complete authentication for Nexcor.

## Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## File Placement

Drop these files into your Next.js project with the same folder structure:

```
nexcor/
├── middleware.ts                                    ← project root
└── src/
    ├── lib/
    │   └── supabase/
    │       ├── client.ts
    │       └── server.ts
    └── app/
        ├── (auth)/
        │   ├── login/page.tsx
        │   ├── signup/page.tsx
        │   ├── forgot-password/page.tsx
        │   └── reset-password/page.tsx
        ├── auth/
        │   └── callback/route.ts
        ├── onboarding/
        │   └── username/page.tsx
        └── api/
            └── auth/
                └── signout/route.ts
```

---

## Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Project Settings → API**

---

## Supabase Dashboard Settings

### 1. Run the schema
Open **SQL Editor** → paste `nexcor_schema_v3.sql` → **Run**.
Verify tables appear under **Table Editor**.

### 2. Auth → Providers → Email
- **Enabled**: ON
- **Confirm email**: **OFF** (we decided to log users in immediately)

### 3. Auth → Providers → Google
- **Enabled**: ON
- Create Google OAuth credentials at https://console.cloud.google.com
- Copy Client ID + Secret into Supabase
- Add authorized redirect URI in Google Cloud:
  `https://your-project.supabase.co/auth/v1/callback`

### 4. Auth → URL Configuration
- **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (prod)
  - `http://localhost:3000/reset-password`
  - `https://yourdomain.com/reset-password` (prod)

### 5. Auth → Email Templates → Reset Password
Customize if you want Nexcor branding. Default template works fine.

---

## How the Flow Works

### Email signup
1. User visits `/signup`, fills username + email + password
2. Form calls `supabase.auth.signUp()` — no email confirmation needed
3. DB trigger auto-creates a `profiles` row (without username)
4. Form immediately updates `profiles.username` with their chosen handle
5. Redirect to `next` param or `/explore`

### Google signup
1. User clicks Google button → OAuth redirect to Google → back to `/auth/callback?code=XXX&next=/explore`
2. Callback exchanges `code` for session, redirects to `/explore`
3. User browses freely. If they try `/create`, `/chat/*`, `/profile/*`, or `/settings`...
4. Middleware checks `profile.username` — it's NULL for new Google users
5. Redirect to `/onboarding/username?next=<wherever they were going>`
6. User picks handle → `/explore` or wherever they were going

### Protected routes
- `/create`, `/chat/*`, `/profile/*`, `/settings` → need login + username
- `/onboarding/username` → needs login only
- `/explore`, `/character/[id]`, `/` → public, no auth needed

### Password reset
1. User clicks "Forgot password?" on login → `/forgot-password`
2. Enters email → Supabase sends magic link
3. Link opens `/reset-password` (with auto-session from the link)
4. User sets new password → redirect to `/login`

### Open redirect protection
All `next` params validated — must start with `/`, must not start with `//`. Prevents attackers from redirecting users to evil sites.

### Reserved usernames
Blocked in both `signup` and `onboarding/username` validation:
`admin, nexcor, sistra, kurai, bigg, big_g, api, auth, login, signup, support, about, explore, create, chat, profile, settings, 324b21, onboarding, official, staff, help, contact, terms, privacy`

---

## Sign-out Button

Add this anywhere (navbar, settings):

```tsx
<form action="/api/auth/signout" method="POST">
  <button type="submit">Sign out</button>
</form>
```

---

## Testing Checklist

After setup, test each flow:

- [ ] Visit `/signup`, create account with email — should land on `/explore`
- [ ] Visit `/login`, sign back in — should land on `/explore`
- [ ] Sign out, visit `/create` — should redirect to `/login?next=/create`
- [ ] Sign in on that page — should land on `/create`
- [ ] Sign up with Google — should land on `/explore` (no username yet)
- [ ] Click "Create Character" while on Google account without username → redirects to `/onboarding/username?next=/create`
- [ ] Set username → lands on `/create`
- [ ] Try username `admin` — should be blocked
- [ ] Try username already taken — should show "taken"
- [ ] Forgot password flow end-to-end

---

## Files in this bundle

1. `src/lib/supabase/client.ts` — browser client
2. `src/lib/supabase/server.ts` — server client
3. `middleware.ts` — auth guard + username gate
4. `src/app/auth/callback/route.ts` — OAuth callback
5. `src/app/api/auth/signout/route.ts` — sign-out endpoint
6. `src/app/(auth)/login/page.tsx` — login with ?next= support
7. `src/app/(auth)/signup/page.tsx` — signup with inline username
8. `src/app/(auth)/forgot-password/page.tsx` — reset request
9. `src/app/(auth)/reset-password/page.tsx` — new password form
10. `src/app/onboarding/username/page.tsx` — Google user username picker

---

**BUILD 324B21 · SESTRA PROTOCOL ACTIVE**
