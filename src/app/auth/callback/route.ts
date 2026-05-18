import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SIGNUP_BONUS, MARKS_DAILY_BONUS } from "@/lib/ai/modelConfig";

function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/explore";
  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNext(requestUrl.searchParams.get("next"));

  // Determine the public-facing origin reliably across local dev, Vercel preview,
  // and production.  Priority:
  //   1. NEXT_PUBLIC_SITE_URL env var (set explicitly in Vercel dashboard)
  //   2. x-forwarded-host header (set by Vercel's edge network / any reverse proxy)
  //   3. Fallback to request.url origin (correct in local dev)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin);

  if (code) {
    // Build the default redirect response first so setAll can write cookies onto it.
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // ── Signup bonus (idempotent) ──────────────────────────────────────────
      try {
        const { count } = await supabase
          .from("mark_transactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("reason", "signup_bonus");

        if ((count ?? 0) === 0) {
          await supabase.rpc("credit_marks", {
            p_user_id: user.id,
            p_amount: SIGNUP_BONUS,
            p_reason: "signup_bonus",
            p_payment_session_id: null,
          });
        }
      } catch (e) {
        console.error("OAuth signup bonus error:", e);
      }

      // ── Daily bonus (once per 24 h) ────────────────────────────────────────
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("last_daily_bonus_at")
          .eq("id", user.id)
          .single();

        const now = new Date();
        const last = profile?.last_daily_bonus_at
          ? new Date(profile.last_daily_bonus_at)
          : null;

        if (!last || now.getTime() - last.getTime() >= 24 * 60 * 60 * 1000) {
          await supabase.rpc("credit_marks", {
            p_user_id: user.id,
            p_amount: MARKS_DAILY_BONUS,
            p_reason: "daily_bonus",
            p_payment_session_id: null,
          });
          await supabase
            .from("profiles")
            .update({ last_daily_bonus_at: now.toISOString() })
            .eq("id", user.id);
        }
      } catch (e) {
        console.error("OAuth daily bonus error:", e);
      }

      // ── Username check ─────────────────────────────────────────────────────
      // New Google users have no username yet. Route them to onboarding so they
      // can agree to terms + pick a handle. Returning users go straight to `next`.
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile?.username) {
          const onboardingUrl = `${origin}/onboarding/username?next=${encodeURIComponent(next)}`;
          const onboardingResponse = NextResponse.redirect(onboardingUrl);
          // Copy session cookies that setAll wrote to `response`
          response.cookies.getAll().forEach((c) => {
            onboardingResponse.cookies.set(c.name, c.value, c);
          });
          return onboardingResponse;
        }
      } catch (e) {
        console.error("OAuth username check error:", e);
        // Fall through to default redirect on error
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
