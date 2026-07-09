import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export async function POST(request: Request) {
  try {
    const { userId, username } = await request.json() as { userId: string; username: string };

    if (!userId || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const clean = username.trim().toLowerCase();

    if (!USERNAME_REGEX.test(clean)) {
      return NextResponse.json(
        { error: "Username must be 3–20 characters and only contain letters, numbers, or underscores." },
        { status: 400 }
      );
    }

    // Check uniqueness
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", clean)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    // Try UPDATE first — works if the DB trigger has already created the profile row
    const { error: updateErr, count } = await supabaseAdmin
      .from("profiles")
      .update({ username: clean })
      .eq("id", userId)
      .select("id", { count: "exact", head: true });

    if (!updateErr && (count ?? 0) > 0) {
      return NextResponse.json({ ok: true });
    }

    // Profile row doesn't exist yet (race with DB trigger) — upsert creates it
    const { error: upsertErr } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, username: clean, marks: 0, show_nsfw: false }, { onConflict: "id" });

    if (upsertErr) {
      console.error("[set-username] upsert error:", upsertErr.message);
      return NextResponse.json({ error: "Could not set username." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[set-username] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
