import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FavoritesClient, type FavCharacter } from "./FavoritesClient";

export const metadata = {
  title: "Favorites · Nexcor",
  description: "Characters you've saved on Nexcor.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/favorites");

  const { data: favorites } = await supabase
    .from("character_favorites")
    .select(
      `created_at,
       character:characters!inner (
         id, name, subtitle, avatar_url, gender_pronouns,
         is_platform, is_nsfw, tier, visibility
       )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const characters: FavCharacter[] = (favorites ?? [])
    .filter((f: any) => f.character)
    .map((f: any) => ({
      id: f.character.id,
      name: f.character.name,
      subtitle: f.character.subtitle ?? null,
      avatar_url: f.character.avatar_url ?? null,
      gender_pronouns: f.character.gender_pronouns,
      is_platform: f.character.is_platform,
      is_nsfw: f.character.is_nsfw,
      tier: f.character.tier,
    }));

  return <FavoritesClient characters={characters} />;
}
