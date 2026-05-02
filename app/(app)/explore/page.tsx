import { createClient } from "@/lib/supabase/server";
import {
  fetchFeatured,
  fetchTrending,
  fetchNew,
  fetchFavorites,
  fetchFavoriteIds,
} from "@/lib/queries/exploreQueries";
import { ExploreClient } from "./ExploreClient";
import { Navbar } from "@/components/Navbar";

export const revalidate = 60; // Regenerate page every 60 seconds (ISR)

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let userCanSeeNsfw = false;
  let favorites: any[] = [];
  let favoriteIds: Set<string> = new Set();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, show_nsfw")
      .eq("id", user.id)
      .single();

    username = profile?.username ?? null;
    userCanSeeNsfw = profile?.show_nsfw ?? false;
    favorites = await fetchFavorites(user.id, userCanSeeNsfw);
    favoriteIds = await fetchFavoriteIds(user.id);
  }

  const [featured, trending, fresh] = await Promise.all([
    fetchFeatured(userCanSeeNsfw),
    fetchTrending(userCanSeeNsfw),
    fetchNew(userCanSeeNsfw),
  ]);

  return (
    <>
      <Navbar />
      <ExploreClient
        initialFeatured={featured}
        initialTrending={trending}
        initialNew={fresh}
        initialFavorites={favorites}
        favoriteIds={Array.from(favoriteIds)}
        isLoggedIn={!!user}
        userCanSeeNsfw={userCanSeeNsfw}
        username={username}
      />
    </>
  );
}
