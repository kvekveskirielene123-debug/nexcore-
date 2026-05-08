import { createClient } from "@/lib/supabase/client";
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
  }
}

export async function fetchFilteredClient(filters: ExploreFilters, showNsfwDefault: boolean) {
  const supabase = createClient();
  let query = supabase
    .from("characters")
    .select(BASE_SELECT)
    .eq("visibility", "public");

  const effectiveShowNsfw = filters.showNsfw && showNsfwDefault;
  if (!effectiveShowNsfw) query = query.eq("is_nsfw", false);

  if (filters.search.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${s},subtitle.ilike.${s},description.ilike.${s}`);
  }

  if (filters.genders.length > 0) {
    query = query.in("gender_pronouns", filters.genders);
  }

  if (filters.creator === "platform") query = query.eq("is_platform", true);
  if (filters.creator === "community") query = query.eq("is_platform", false);

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  query = applySort(query, filters.sort);

  const { data, error } = await query.limit(60);
  if (error) {
    console.error("fetchFilteredClient error:", error);
    return [] as Character[];
  }
  return (data ?? []) as Character[];
}
