import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { hasUserChattedWithCharacter } from "@/lib/ratings/helpers";

export const runtime = "nodejs";

/**
 * POST /api/ratings  { characterId, rating: 1-5 }
 * Submit or update the current user's rating for a character.
 *
 * Server-side gatekeeping:
 *   - User must be authenticated
 *   - User must have sent at least 1 message to the character
 *   - User cannot rate their own character
 *   - Rating must be integer 1-5
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      characterId: string;
      rating: number;
    };
    const { characterId, rating } = body;

    if (!characterId) {
      return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
    }
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json({ error: "Rating must be an integer 1-5" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify character exists & is accessible
    const { data: character } = await supabase
      .from("characters")
      .select("id, created_by, visibility")
      .eq("id", characterId)
      .maybeSingle();
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    if (character.visibility !== "public" && character.created_by !== user.id) {
      return NextResponse.json({ error: "Character not available" }, { status: 404 });
    }

    // Creators cannot rate their own characters
    if (character.created_by === user.id) {
      return NextResponse.json(
        { error: "Creators cannot rate their own characters" },
        { status: 403 }
      );
    }

    // Must have sent at least one message
    const hasChatted = await hasUserChattedWithCharacter(user.id, characterId);
    if (!hasChatted) {
      return NextResponse.json(
        { error: "You must chat with the character before rating" },
        { status: 403 }
      );
    }

    // Upsert rating (this will fire the trigger that updates stats)
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("character_ratings")
      .upsert(
        {
          user_id: user.id,
          character_id: characterId,
          rating,
          updated_at: now,
        },
        { onConflict: "user_id,character_id" }
      );

    if (error) {
      console.error("Rating upsert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, rating });
  } catch (err: any) {
    console.error("Ratings POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/ratings?characterId=xxx
 * Remove the current user's rating for a character.
 */
export async function DELETE(request: Request) {
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("character_ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("character_id", characterId);

  if (error) {
    console.error("Rating delete failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
