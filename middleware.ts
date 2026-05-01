import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication + username
const PROTECTED_ROUTES = ["/create", "/chat", "/profile", "/settings"];

// Routes that require authentication but NOT a username (onboarding itself)
const AUTH_ONLY_ROUTES = ["/onboarding"];

// Public routes — no auth required at all
// (Everything not in PROTECTED_ROUTES or AUTH_ONLY_ROUTES is public by default)

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

// Safe redirect validation — prevents open-redirect attacks
function sanitizeNextParam(next: string | null): string {
  if (!next) return "/explore";
  if (!next.startsWith("/")) return "/explore";
  if (next.startsWith("//")) return "/explore";
  return next;
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

  // This refreshes the session automatically
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);
  const authOnlyPath = isAuthOnlyPath(pathname);

  // Not logged in + hitting protected route → send to login with next param
  if (!user && (protectedPath || authOnlyPath)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in + hitting protected route → check username exists
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
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // Logged in + on login/signup page → push them into the app
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const next = sanitizeNextParam(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
