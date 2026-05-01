import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RESERVED = [
  "admin","administrator","nexcor","support","help","mod","moderator",
  "staff","team","kurai","bigg","system","bot","api","root","null",
  "undefined","test","user","users","account","accounts","profile",
  "profiles","settings","explore","chat","store","legal","privacy",
  "terms","about","home","index","static","public","assets",
];

function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(u);
}

/**
 * GET /api/settings/username-check?username=foo
 * Returns { available: boolean, reason?: string }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username") ?? "";
  const username = raw.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, reason: "Empty username." });
  }
  if (!isValidUsername(username)) {
    return NextResponse.json({
      available: false,
      reason: "3-30 chars, letters/numbers/underscore only.",
    });
  }
  if (RESERVED.includes(username)) {
    return NextResponse.json({ available: false, reason: "That username is reserved." });
  }

  const supabase = await createClient();

  // Exclude the current user so they can "save" without changing username
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const query = supabase
    .from("profiles")
    .select("id")
    .ilike("username", username);

  if (user) {
    query.neq("id", user.id);
  }

  const { data } = await query.maybeSingle();

  if (data) {
    return NextResponse.json({ available: false, reason: "Username already taken." });
  }
  return NextResponse.json({ available: true });
}
