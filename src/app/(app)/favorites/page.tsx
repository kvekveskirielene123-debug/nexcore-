import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FavoritesClient, type FavCharacter, type SuggestionCharacter } from "./FavoritesClient";

export const metadata = {
  title: "Favorites · Nexcor",
  description: "Characters you've saved on Nexcor.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/favorites");

  // Favorites with character + creator profile
  const { data: favorites } = await supabase
    .from("character_favorites")
    .select(
      `created_at,
       character:characters!inner (
         id, name, subtitle, avatar_url, gender_pronouns,
         is_platform, is_nsfw, tier, visibility, created_by
       )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rawChars = (favorites ?? []).filter((f: any) => f.character);

  // Gather all unique creator IDs
  const creatorIds = [...new Set(rawChars.map((f: any) => f.character.created_by as string).filter(Boolean))];

  // Fetch creator usernames in one query
  const { data: creatorProfiles } = creatorIds.length
    ? await supabase.from("profiles").select("id, username, avatar_url").in("id", creatorIds)
    : { data: [] };

  const creatorMap = new Map((creatorProfiles ?? []).map((p: any) => [p.id, p]));

  const characters: FavCharacter[] = rawChars.map((f: any) => {
    const creator = creatorMap.get(f.character.created_by);
    return {
      id: f.character.id,
      name: f.character.name,
      subtitle: f.character.subtitle ?? null,
      avatar_url: f.character.avatar_url ?? null,
      gender_pronouns: f.character.gender_pronouns,
      is_platform: f.character.is_platform,
      is_nsfw: f.character.is_nsfw,
      tier: f.character.tier,
      creator_id: f.character.created_by ?? null,
      creator_username: creator?.username ?? null,
    };
  });

  // Followed creators' suggestions
  const favoritedIds = new Set(characters.map((c) => c.id));

  const { data: follows } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followedIds = (follows ?? []).map((f: any) => f.following_id as string);

  let suggestions: SuggestionCharacter[] = [];

  if (followedIds.length > 0) {
    const { data: sugChars } = await supabase
      .from("characters")
      .select("id, name, subtitle, avatar_url, is_nsfw, created_by")
      .in("created_by", followedIds)
      .eq("visibility", "public")
      .order("chat_count", { ascending: false })
      .limit(30);

    const sugCreatorIds = [...new Set((sugChars ?? []).map((c: any) => c.created_by as string))];
    const sugCreatorsMap = new Map(
      (creatorProfiles ?? []).filter((p: any) => sugCreatorIds.includes(p.id)).map((p: any) => [p.id, p])
    );
    // Fill in any creator profiles not already fetched
    if (sugCreatorIds.some((id) => !sugCreatorsMap.has(id))) {
      const missing = sugCreatorIds.filter((id) => !sugCreatorsMap.has(id));
      const { data: extra } = await supabase.from("profiles").select("id, username, avatar_url").in("id", missing);
      (extra ?? []).forEach((p: any) => sugCreatorsMap.set(p.id, p));
    }

    suggestions = (sugChars ?? [])
      .filter((c: any) => !favoritedIds.has(c.id))
      .slice(0, 20)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle ?? null,
        avatar_url: c.avatar_url ?? null,
        is_nsfw: c.is_nsfw,
        creator_username: sugCreatorsMap.get(c.created_by)?.username ?? null,
      }));
  }

  return <FavoritesClient characters={characters} suggestions={suggestions} />;
}
