"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Toggle favorite state for a character.
 * Returns the new favorite state (true if now favorited, false if removed).
 * Upserts on (user_id, character_id) — see schema UNIQUE constraint.
 */
export async function toggleFavorite(
  characterId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const newState = !currentlyFavorited;

  // Upsert via ON CONFLICT (user_id, character_id)
  const { error } = await supabase
    .from("character_stats")
    .upsert(
      {
        user_id: user.id,
        character_id: characterId,
        is_favorite: newState,
      },
      { onConflict: "user_id,character_id" }
    );

  if (error) throw error;
  return newState;
}
