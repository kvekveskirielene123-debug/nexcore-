"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Toggle favorite state for a character.
 * Returns the new favorite state (true if now favorited, false if removed).
 * Writes to character_favorites (user_id, character_id, created_at).
 */
export async function toggleFavorite(
  characterId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (currentlyFavorited) {
    const { error } = await supabase
      .from("character_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("character_id", characterId);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from("character_favorites")
      .insert({ user_id: user.id, character_id: characterId });
    if (error) throw error;
    return true;
  }
}
