import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { validatePersonaDraft, type PersonaDraft } from "@/lib/personas/types";

export const runtime = "nodejs";

/**
 * GET /api/personas
 * Returns the current user's personas.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("personas")
    .select(
      "id, name, age, gender, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ personas: data ?? [] });
}

/**
 * POST /api/personas  body: PersonaDraft
 * Enforces the free-tier 1-persona cap.
 * Subscribers can create unlimited.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PersonaDraft;

    const validation = validatePersonaDraft(body);
    if (validation.ok === false) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Subscription check
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_expires_at, subscription_tier")
      .eq("id", user.id)
      .maybeSingle();
    const isSub =
      profile?.subscription_tier != null &&
      isSubscriptionActive(profile?.subscription_expires_at ?? null);

    // Count existing personas
    const { count } = await supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const existing = count ?? 0;
    const FREE_PERSONA_LIMIT = 5;

    if (!isSub && existing >= FREE_PERSONA_LIMIT) {
      return NextResponse.json(
        {
          error: "persona_limit_reached",
          message: `Free users can create up to ${FREE_PERSONA_LIMIT} personas. Subscribe to unlock unlimited.`,
        },
        { status: 402 }
      );
    }

    // Insert
    const { data, error } = await supabase
      .from("personas")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        age: body.age,
        gender: body.gender.trim(),
        bio: body.bio?.trim() || null,
        tone: body.tone,
        tags: body.tags ?? [],
        hobbies_text: body.hobbies_text?.trim() || null,
        avatar_url: body.avatar_url || null,
      })
      .select(
        "id, name, age, gender, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at"
      )
      .single();

    if (error || !data) {
      console.error("Persona create failed:", error);
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ persona: data });
  } catch (err: any) {
    console.error("Persona POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
