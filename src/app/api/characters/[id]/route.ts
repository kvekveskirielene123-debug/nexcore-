import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface PatchBody {
  name?: string;
  subtitle?: string | null;
  description?: string | null;
  greeting?: string | null;
  long_term_memory?: string | null;
  gender_pronouns?: string;
  avatar_url?: string;
  visibility?: "public" | "private";
  is_nsfw?: boolean;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/characters/[id]
 * Update a character. Only the creator can do this. RLS enforces it,
 * but we also explicitly check here for clearer error messages.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = (await request.json()) as PatchBody;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership before patching
    const { data: existing } = await supabase
      .from("characters")
      .select("id, created_by, avatar_url")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate lengths (defense in depth, same as create route)
    const updates: Record<string, any> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name.length < 1 || name.length > 60) {
        return NextResponse.json({ error: "Name must be 1-60 characters." }, { status: 400 });
      }
      updates.name = name;
    }
    if (body.gender_pronouns !== undefined) {
      const g = body.gender_pronouns.trim();
      if (!g || g.length > 60) {
        return NextResponse.json({ error: "Gender · pronouns required." }, { status: 400 });
      }
      updates.gender_pronouns = g;
    }
    if (body.avatar_url !== undefined) {
      if (!body.avatar_url.trim()) {
        return NextResponse.json({ error: "Avatar is required." }, { status: 400 });
      }
      updates.avatar_url = body.avatar_url.trim();
    }
    if (body.subtitle !== undefined) {
      const s = body.subtitle?.trim() ?? "";
      if (s.length > 1500) return NextResponse.json({ error: "Subtitle too long." }, { status: 400 });
      updates.subtitle = s || null;
    }
    if (body.description !== undefined) {
      const d = body.description?.trim() ?? "";
      if (d.length > 2000) return NextResponse.json({ error: "Description too long." }, { status: 400 });
      updates.description = d || null;
    }
    if (body.greeting !== undefined) {
      const g = body.greeting?.trim() ?? "";
      if (g.length > 500) return NextResponse.json({ error: "Greeting too long." }, { status: 400 });
      updates.greeting = g || null;
    }
    if (body.long_term_memory !== undefined) {
      const m = body.long_term_memory?.trim() ?? "";
      if (m.length > 8000) return NextResponse.json({ error: "Memory too long." }, { status: 400 });
      updates.long_term_memory = m || null;
    }
    if (body.visibility !== undefined) {
      if (body.visibility !== "public" && body.visibility !== "private") {
        return NextResponse.json({ error: "Invalid visibility." }, { status: 400 });
      }
      updates.visibility = body.visibility;
    }
    if (body.is_nsfw !== undefined) {
      updates.is_nsfw = !!body.is_nsfw;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", id)
      .eq("created_by", user.id); // redundant but explicit

    if (error) {
      console.error("Character update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Character PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/characters/[id]
 * Hard delete the character. Conversations are preserved (character_id → NULL
 * via ON DELETE SET NULL from migration v4.1). Avatar file is removed from storage.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership + grab avatar URL so we can clean up storage after
    const { data: existing } = await supabase
      .from("characters")
      .select("id, created_by, avatar_url")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the character row. conversations.character_id becomes NULL.
    const { error: deleteErr } = await supabase
      .from("characters")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (deleteErr) {
      console.error("Character delete failed:", deleteErr);
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    // Try to clean up the avatar file (best-effort — don't fail the
    // whole request if this doesn't work)
    if (existing.avatar_url) {
      try {
        // Extract path from public URL.
        // Supabase public URL format:
        //   https://<project>.supabase.co/storage/v1/object/public/character-avatars/<path>
        const marker = "/character-avatars/";
        const idx = existing.avatar_url.indexOf(marker);
        if (idx !== -1) {
          const path = existing.avatar_url.slice(idx + marker.length);
          await supabase.storage.from("character-avatars").remove([path]);
        }
      } catch (storageErr) {
        console.warn("Avatar cleanup failed (non-fatal):", storageErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Character DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
