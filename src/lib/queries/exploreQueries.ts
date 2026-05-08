import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Character, ExploreFilters, SortOption } from "./exploreTypes";

const BASE_SELECT = `
  id, name, subtitle, avatar_url, gender_pronouns,
  visibility, is_platform, is_featured, is_nsfw, tier,
  chat_count, created_at, created_by, tags
`;

function applySort(query: any, sort: SortOption) {
  switch (sort) {
    case "popular":
      return query.order("chat_count", { ascending: false });
    case "alphabetical":
      return query.order("name", { ascending: true });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
    // rating handled separately (needs join) — default to popular for now
  }
}

/**
 * Fetch Featured characters (is_featured = true, public, NSFW filtered)
 */
export async function fetchFeatured(showNsfw: boolean, limit = 6) {
  const supabase = await createServerClient();
  let query = supabase
    .from("characters")
    .select(BASE_SELECT)
    .eq("visibility", "public")
    .eq("is_featured", true)
    .order("chat_count", { ascending: false })
    .limit(limit);

  if (!showNsfw) query = query.eq("is_nsfw", false);

  const { data, error } = await query;
  if (error) {
    console.error("fetchFeatured error:", error);
    return [] as Character[];
  }
  return (data ?? []) as Character[];
}

/**
 * Fetch Trending — top by chat_count
 * (Later: filter by recent activity, for now global popularity)
 */
export async function fetchTrending(showNsfw: boolean, limit = 10) {
  const supabase = await createServerClient();
  let query = supabase
    .from("characters")
    .select(BASE_SELECT)
    .eq("visibility", "public")
    .order("chat_count", { ascending: false })
    .limit(limit);

  if (!showNsfw) query = query.eq("is_nsfw", false);

  const { data, error } = await query;
  if (error) {
    console.error("fetchTrending error:", error);
    return [] as Character[];
  }
  return (data ?? []) as Character[];
}

/**
 * Fetch New — most recently created public characters
 */
export async function fetchNew(showNsfw: boolean, limit = 10) {
  const supabase = await createServerClient();
  let query = supabase
    .from("characters")
    .select(BASE_SELECT)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!showNsfw) query = query.eq("is_nsfw", false);

  const { data, error } = await query;
  if (error) {
    console.error("fetchNew error:", error);
    return [] as Character[];
  }
  return (data ?? []) as Character[];
}

/**
 * Fetch Your Favorites — per-user saved characters
 */
export async function fetchFavorites(userId: string, showNsfw: boolean, limit = 10) {
  const supabase = await createServerClient();
  let query = supabase
    .from("character_stats")
    .select(`character:characters(${BASE_SELECT})`)
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("fetchFavorites error:", error);
    return [] as Character[];
  }
  const chars = (data ?? [])
    .map((row: any) => row.character)
    .filter((c: any) => c && (showNsfw || !c.is_nsfw));

  return chars as Character[];
}

/**
 * Fetch filtered/searched characters (for search + filter mode)
 * Client-side callable version.
 */
export async function fetchFilteredClient(filters: ExploreFilters, showNsfwDefault: boolean) {
  const supabase = createClient();
  let query = supabase
    .from("characters")
    .select(BASE_SELECT)
    .eq("visibility", "public");

  // NSFW
  const effectiveShowNsfw = filters.showNsfw && showNsfwDefault;
  if (!effectiveShowNsfw) query = query.eq("is_nsfw", false);

  // Search
  if (filters.search.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${s},subtitle.ilike.${s},description.ilike.${s}`);
  }

  // Gender filter
  if (filters.genders.length > 0) {
    query = query.in("gender_pronouns", filters.genders);
  }

  // Creator filter
  if (filters.creator === "platform") query = query.eq("is_platform", true);
  if (filters.creator === "community") query = query.eq("is_platform", false);

  // Sort
  query = applySort(query, filters.sort);

  const { data, error } = await query.limit(60);
  if (error) {
    console.error("fetchFilteredClient error:", error);
    return [] as Character[];
  }
  return (data ?? []) as Character[];
}

/**
 * Fetch IDs of characters the current user has favorited (for heart state on cards)
 */
export async function fetchFavoriteIds(userId: string): Promise<Set<string>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("character_stats")
    .select("character_id")
    .eq("user_id", userId)
    .eq("is_favorite", true);

  if (error) {
    console.error("fetchFavoriteIds error:", error);
    return new Set();
  }
  return new Set((data ?? []).map((r: any) => r.character_id));
}
