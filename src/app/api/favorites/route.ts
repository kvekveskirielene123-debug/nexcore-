import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/favorites  { characterId, action: 'add' | 'remove' }
 * Adds or removes a favorite for the current user.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    characterId: string;
    action: "add" | "remove";
  };
  const { characterId, action } = body;

  if (!characterId || (action !== "add" && action !== "remove")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action === "add") {
    // Confirm the character exists + is visible to the user
    const { data: char } = await supabase
      .from("characters")
      .select("id, visibility, created_by")
      .eq("id", characterId)
      .maybeSingle();

    if (!char) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    if (char.visibility !== "public" && char.created_by !== user.id) {
      return NextResponse.json({ error: "Character not available" }, { status: 404 });
    }

    const { error } = await supabase
      .from("character_favorites")
      .upsert(
        { user_id: user.id, character_id: characterId },
        { onConflict: "user_id,character_id", ignoreDuplicates: true }
      );
    if (error) {
      console.error("Favorite insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, favorited: true });
  }

  // action === "remove"
  const { error } = await supabase
    .from("character_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("character_id", characterId);

  if (error) {
    console.error("Favorite delete failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, favorited: false });
}

/**
 * GET /api/favorites?characterId=xxx
 * Check if a specific character is favorited by the current user.
 * Used by the profile page + actions row on mount.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ favorited: false });
  }

  const { data } = await supabase
    .from("character_favorites")
    .select("character_id")
    .eq("user_id", user.id)
    .eq("character_id", characterId)
    .maybeSingle();

  return NextResponse.json({ favorited: !!data });
}
