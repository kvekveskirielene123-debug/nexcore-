import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedClient } from "./FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [postsResult, profileResult] = await Promise.all([
    supabase
      .from("feed_posts")
      .select(`
        id, user_id, content, image_url, created_at,
        profiles ( username, avatar_url ),
        feed_post_likes ( user_id )
      `)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single(),
  ]);

  const initialPosts = (postsResult.data ?? []).map((p) => ({
    id:             p.id,
    user_id:        p.user_id,
    content:        p.content,
    image_url:      (p.image_url as string | null) ?? null,
    created_at:     p.created_at,
    username:       (p.profiles as unknown as { username: string; avatar_url: string | null } | null)?.username ?? "Unknown",
    user_avatar_url:(p.profiles as unknown as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
    likes_count:    (p.feed_post_likes as { user_id: string }[])?.length ?? 0,
    liked_by_me:    (p.feed_post_likes as { user_id: string }[])?.some((l) => l.user_id === user.id) ?? false,
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
    />
  );
}
