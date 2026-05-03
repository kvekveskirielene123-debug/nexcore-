// Server-only ratings helpers. Use from Server Components + API routes.

import { createClient } from "@/lib/supabase/server";
import { RATING_REVEAL_THRESHOLD } from "./constants";

/**
 * Returns true if the given user has sent at least one message to the
 * given character. Used to gate rating submission.
 */
export async function hasUserChattedWithCharacter(
  userId: string,
  characterId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, conversations!inner(character_id, user_id)")
    .eq("role", "user")
    .eq("conversations.user_id", userId)
    .eq("conversations.character_id", characterId)
    .limit(1)
    .maybeSingle();
  return !!data;
}

/**
 * Returns the current user's rating (1-5) for a character, or null.
 */
export async function getUserRating(
  userId: string,
  characterId: string
): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("character_ratings")
    .select("rating")
    .eq("user_id", userId)
    .eq("character_id", characterId)
    .maybeSingle();
  return data?.rating ?? null;
}

/**
 * Aggregate stats for a character's ratings. Reads from the cached columns
 * on character_stats so it's a cheap lookup.
 *
 * Public average is HIDDEN (null) until rating_count >= 5.
 */
export interface RatingAggregate {
  rating_count: number;
  average: number | null; // null when below reveal threshold (5)
  average_raw: number | null; // actual average regardless of threshold (for creators/admin)
}

export { RATING_REVEAL_THRESHOLD };

export async function getRatingAggregate(
  characterId: string
): Promise<RatingAggregate> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("character_stats")
    .select("rating_sum, rating_count")
    .eq("character_id", characterId)
    .maybeSingle();

  const count = data?.rating_count ?? 0;
  const sum = data?.rating_sum ?? 0;
  const raw = count > 0 ? sum / count : null;

  return {
    rating_count: count,
    average: count >= RATING_REVEAL_THRESHOLD ? raw : null,
    average_raw: raw,
  };
}
