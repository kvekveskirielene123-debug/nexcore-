import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
  name: string;
  subtitle?: string;
  description?: string;
  greeting?: string;
  long_term_memory?: string;
  gender_pronouns: string;
  avatar_url: string;
  visibility: "public" | "private";
  is_nsfw: boolean;
};

// Enforces server-side validation + RLS-via-auth.
// The `created_by` is always set to the current authenticated user.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    // ── Validation ───────────────────────────────────────
    const name = body.name?.trim();
    const gender = body.gender_pronouns?.trim();
    const avatar = body.avatar_url?.trim();

    if (!name || name.length < 1 || name.length > 60) {
      return NextResponse.json({ error: "Name must be 1-60 characters." }, { status: 400 });
    }
    if (!gender || gender.length > 60) {
      return NextResponse.json({ error: "Gender · pronouns required." }, { status: 400 });
    }
    if (!avatar) {
      return NextResponse.json({ error: "Avatar is required." }, { status: 400 });
    }
    if (body.subtitle && body.subtitle.length > 1500) {
      return NextResponse.json({ error: "Subtitle too long (max 1500)." }, { status: 400 });
    }
    if (body.description && body.description.length > 2000) {
      return NextResponse.json({ error: "Description too long (max 2000)." }, { status: 400 });
    }
    if (body.greeting && body.greeting.length > 500) {
      return NextResponse.json({ error: "Greeting too long (max 500)." }, { status: 400 });
    }
    if (body.long_term_memory && body.long_term_memory.length > 8000) {
      return NextResponse.json({ error: "Memory too long (max 8000)." }, { status: 400 });
    }
    if (body.visibility !== "public" && body.visibility !== "private") {
      return NextResponse.json({ error: "Invalid visibility." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert — `created_by` is set from the authenticated user, never from the client payload.
    // RLS will block anything else.
    const { data, error } = await supabase
      .from("characters")
      .insert({
        created_by: user.id,
        name,
        subtitle: body.subtitle?.trim() || null,
        description: body.description?.trim() || null,
        greeting: body.greeting?.trim() || null,
        long_term_memory: body.long_term_memory?.trim() || null,
        gender_pronouns: gender,
        avatar_url: avatar,
        visibility: body.visibility,
        is_nsfw: body.is_nsfw === true,
        is_platform: false,  // only Kurai's official account can set this to true via DB
        is_featured: false,
        tier: "standard",
      })
      .select("id, name, avatar_url, greeting")
      .single();

    if (error || !data) {
      console.error("Character insert failed:", error);
      return NextResponse.json(
        { error: error?.message ?? "Insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      greeting: data.greeting,
    });
  } catch (err: any) {
    console.error("Character create route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
