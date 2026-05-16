import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";
import type { FavCharacter } from "@/app/(app)/favorites/FavoritesClient";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} · Nexcor` };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();

  // Load target profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, marks, subscription_expires_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const isOwnProfile = viewer?.id === profile.id;

  let favorites: FavCharacter[] = [];
  if (isOwnProfile && viewer) {
    const { data: favData } = await supabase
      .from("character_favorites")
      .select(`created_at, character:characters!inner(id, name, subtitle, avatar_url, gender_pronouns, is_platform, is_nsfw, tier, visibility, created_by)`)
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false });

    const rawChars = (favData ?? []).filter((f: any) => f.character != null);
    const creatorIds = Array.from(new Set(rawChars.map((f: any) => f.character.created_by as string).filter(Boolean)));
    const { data: creatorProfiles } = creatorIds.length
      ? await supabase.from("profiles").select("id, username").in("id", creatorIds)
      : { data: [] };
    const creatorMap = new Map((creatorProfiles ?? []).map((p: any) => [p.id, p]));

    favorites = rawChars.map((f: any) => ({
      id: f.character.id,
      name: f.character.name,
      subtitle: f.character.subtitle ?? null,
      avatar_url: f.character.avatar_url ?? null,
      gender_pronouns: f.character.gender_pronouns,
      is_platform: f.character.is_platform,
      is_nsfw: f.character.is_nsfw,
      tier: f.character.tier,
      creator_id: f.character.created_by ?? null,
      creator_username: (creatorMap.get(f.character.created_by) as any)?.username ?? null,
    }));
  }

  // Owners see all their characters (public + private); others only see public
  let charQuery = supabase
    .from("characters")
    .select("id, name, subtitle, avatar_url, is_nsfw, is_platform, tier, chat_count, visibility")
    .eq("created_by", profile.id)
    .order("chat_count", { ascending: false })
    .limit(50);

  if (!isOwnProfile) {
    charQuery = charQuery.eq("visibility", "public");
  }

  const { data: characters } = await charQuery;

  // Follower + following counts
  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
  ]);

  // Is the viewer following this profile? Does the profile follow the viewer back?
  let viewerFollowing = false;
  let profileFollowsViewer = false;
  let viewerBalance = 0;
  if (viewer && viewer.id !== profile.id) {
    const [followCheck, reverseCheck, balanceCheck] = await Promise.all([
      supabase.from("user_follows").select("follower_id").eq("follower_id", viewer.id).eq("following_id", profile.id).maybeSingle(),
      supabase.from("user_follows").select("follower_id").eq("follower_id", profile.id).eq("following_id", viewer.id).maybeSingle(),
      supabase.from("profiles").select("marks").eq("id", viewer.id).maybeSingle(),
    ]);
    viewerFollowing = !!followCheck.data;
    profileFollowsViewer = !!reverseCheck.data;
    viewerBalance = balanceCheck.data?.marks ?? 0;
  }

  return (
    <ProfileClient
      profile={{
        id: profile.id,
        username: profile.username ?? username,
        bio: profile.bio ?? null,
        avatar_url: profile.avatar_url ?? null,
        subscription_expires_at: profile.subscription_expires_at ?? null,
      }}
      characters={characters ?? []}
      followerCount={followerCount ?? 0}
      followingCount={followingCount ?? 0}
      viewerId={viewer?.id ?? null}
      viewerFollowing={viewerFollowing}
      profileFollowsViewer={profileFollowsViewer}
      viewerBalance={viewerBalance}
      isOwnProfile={isOwnProfile}
      favorites={favorites}
    />
  );
}
