import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RESERVED = [
  "admin","nexcor","sistra","bigg","api","auth","login","signup",
  "support","about","explore","create","chat","profile","settings",
  "onboarding","324b21",
];

function isValid(u: string) {
  return /^[a-z0-9_]{3,30}$/.test(u) && !RESERVED.includes(u);
}

// POST /api/auth/set-username  body: { username }
// Sets the username on the profile, creating the row if it doesn't exist yet.
// Called from both the signup page and the onboarding page.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const username = (body.username ?? "").trim().toLowerCase();

  if (!isValid(username)) {
    return NextResponse.json(
      { error: "Username must be 3-30 chars, letters/numbers/underscore only, not reserved." },
      { status: 400 }
    );
  }

  // Uniqueness check (case-insensitive)
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (taken) {
    return NextResponse.json({ error: "That username is taken." }, { status: 409 });
  }

  // Try UPDATE first (normal case — profile row already exists)
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (!updateErr) {
    // Verify the row was actually updated (update silently no-ops if 0 rows matched)
    const { data: check } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (check?.username === username) {
      return NextResponse.json({ ok: true });
    }
  }

  // Profile row doesn't exist yet — upsert creates it.
  // Include safe defaults so NOT NULL columns are satisfied.
  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, username, marks: 0, show_nsfw: false },
      { onConflict: "id" }
    );

  if (upsertErr) {
    console.error("set-username upsert failed:", upsertErr);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
