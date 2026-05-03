import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/auth/signout-silent
// Signs the user out and returns 200 JSON — no redirect.
// Used by SessionWatcher's beforeunload beacon so the browser doesn't
// need to follow a 303 while the page is being closed.
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
