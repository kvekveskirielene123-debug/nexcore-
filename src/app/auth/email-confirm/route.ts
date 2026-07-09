import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dedicated handler for mobile email confirmation links.
// Always lands on /auth/confirmed — never on /explore or onboarding.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${url.protocol}//${url.host}`;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/confirmed`);
  }

  const response = NextResponse.redirect(`${origin}/auth/confirmed`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

  // After confirmation the DB trigger may have just created the profile row.
  // Read the username the mobile app stored in user metadata and write it now.
  if (user) {
    const username = (user.user_metadata?.username ?? "").trim().toLowerCase();
    if (/^[a-z0-9_]{3,20}$/.test(username)) {
      // Try UPDATE first; fall back to upsert if the row doesn't exist yet
      const { error: updateErr, count } = await supabaseAdmin
        .from("profiles")
        .update({ username }, { count: "exact" })
        .eq("id", user.id);

      if (updateErr || (count ?? 0) === 0) {
        await supabaseAdmin
          .from("profiles")
          .upsert({ id: user.id, username, marks: 0, show_nsfw: false }, { onConflict: "id" });
      }
    }
  }

  return response;
}
