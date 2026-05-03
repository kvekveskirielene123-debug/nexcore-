import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication + username
const PROTECTED_ROUTES = ["/create", "/chat", "/profile", "/settings"];

// Routes that require authentication but NOT a username (onboarding itself)
const AUTH_ONLY_ROUTES = ["/onboarding"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function sanitizeNextParam(next: string | null): string {
  if (!next) return "/explore";
  if (!next.startsWith("/")) return "/explore";
  if (next.startsWith("//")) return "/explore";
  return next;
}

// Always copy the refreshed session cookies onto any response we return,
// including redirects. Without this, the browser never receives the
// rotated tokens and the session disappears on the next request.
function withSessionCookies(
  response: NextResponse,
  supabaseResponse: NextResponse
): NextResponse {
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session and writes new tokens into
  // supabaseResponse. We must return supabaseResponse (or copy its cookies
  // onto whatever we return) so the browser receives the updated tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);
  const authOnlyPath = isAuthOnlyPath(pathname);

  // Not logged in + hitting protected/onboarding route → send to login
  if (!user && (protectedPath || authOnlyPath)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return withSessionCookies(NextResponse.redirect(loginUrl), supabaseResponse);
  }

  // Logged in + hitting protected route → ensure username exists
  if (user && protectedPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (!profile?.username) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding/username";
      onboardingUrl.searchParams.set("next", pathname + request.nextUrl.search);
      return withSessionCookies(
        NextResponse.redirect(onboardingUrl),
        supabaseResponse
      );
    }
  }

  // Logged in + on login/signup → redirect into the app
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const next = sanitizeNextParam(request.nextUrl.searchParams.get("next"));
    return withSessionCookies(
      NextResponse.redirect(new URL(next, request.url)),
      supabaseResponse
    );
  }

  // Default: return supabaseResponse so session cookies are always forwarded
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
