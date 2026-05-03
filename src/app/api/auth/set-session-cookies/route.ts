import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/auth/set-session-cookies
// Re-sets all Supabase auth cookies as session cookies (no maxAge / expires).
// Called after login when the user unchecks "Stay logged in".  Session cookies
// are automatically deleted by the browser when the window closes, so the user
// is logged out without any JS unload tricks.
export async function POST() {
  const cookieStore = await cookies();
  const authCookies = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  const response = NextResponse.json({ ok: true });

  authCookies.forEach((c) => {
    // Setting the same name+path without Max-Age/Expires replaces the
    // persistent cookie with a session cookie.
    response.cookies.set(c.name, c.value, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      // Deliberately omit maxAge so this becomes a session cookie
    });
  });

  return response;
}
