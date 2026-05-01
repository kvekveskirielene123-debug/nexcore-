import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validatePersonaDraft, type PersonaDraft } from "@/lib/personas/types";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/personas/[id]  body: PersonaDraft
 * Updates a persona. Only the owner can edit.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = (await request.json()) as PersonaDraft;

    const validation = validatePersonaDraft(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ownership check (RLS enforces too, but explicit gives clearer errors)
    const { data: existing } = await supabase
      .from("personas")
      .select("id, user_id, avatar_url")
      .eq("id", id)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("personas")
      .update({
        name: body.name.trim(),
        age: body.age,
        gender_pronouns: body.gender_pronouns.trim(),
        bio: body.bio?.trim() || null,
        tone: body.tone,
        tags: body.tags ?? [],
        hobbies_text: body.hobbies_text?.trim() || null,
        avatar_url: body.avatar_url || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Persona update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Persona PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/personas/[id]
 * Removes the persona. Old conversations that referenced it now have
 * conversations.persona_id = NULL (set by the FK ON DELETE SET NULL).
 * Avatar file is best-effort cleaned from storage.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: existing } = await supabase
      .from("personas")
      .select("id, user_id, avatar_url")
      .eq("id", id)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("personas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Persona delete failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Best-effort avatar cleanup
    if (existing.avatar_url) {
      try {
        const marker = "/persona-avatars/";
        const idx = existing.avatar_url.indexOf(marker);
        if (idx !== -1) {
          const path = existing.avatar_url.slice(idx + marker.length);
          await supabase.storage.from("persona-avatars").remove([path]);
        }
      } catch (storageErr) {
        console.warn("Persona avatar cleanup failed (non-fatal):", storageErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Persona DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
