import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedClient } from "./FeedClient";
import { DEFAULT_PREFERENCES } from "@/lib/settings/preferences";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  type Profile = { username: string; avatar_url: string | null } | null;

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [postsResult, profileResult] = await Promise.all([
    supabase
      .from("feed_posts")
      .select(`
        id, user_id, content, image_url, nsfw, tags, created_at,
        profiles ( username, avatar_url ),
        feed_post_likes ( user_id ),
        feed_comments ( id )
      `)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("username, avatar_url, show_nsfw")
      .eq("id", user.id)
      .single(),
  ]);

  const initialPosts = (postsResult.data ?? []).map((p) => ({
    id:             p.id,
    user_id:        p.user_id,
    content:        p.content,
    image_url:      (p.image_url as string | null) ?? null,
    nsfw:           (p.nsfw as boolean) ?? false,
    tags:           (p.tags as string[]) ?? [],
    created_at:     p.created_at,
    username:       (p.profiles as unknown as Profile)?.username ?? "Unknown",
    user_avatar_url:(p.profiles as unknown as Profile)?.avatar_url ?? null,
    likes_count:    (p.feed_post_likes as { user_id: string }[])?.length ?? 0,
    liked_by_me:    (p.feed_post_likes as { user_id: string }[])?.some(l => l.user_id === user.id) ?? false,
    comment_count:  (p.feed_comments as { id: string }[])?.length ?? 0,
  }));

  const nextCursor = initialPosts.length === 20 ? initialPosts[initialPosts.length - 1].created_at : null;

  return (
    <FeedClient
      initialPosts={initialPosts}
      nextCursor={nextCursor}
      currentUser={{
        id:         user.id,
        username:   profileResult.data?.username ?? "You",
        avatar_url: profileResult.data?.avatar_url ?? null,
      }}
      viewerShowsNsfw={profileResult.data?.show_nsfw ?? DEFAULT_PREFERENCES.show_nsfw}
    />
  );
}
