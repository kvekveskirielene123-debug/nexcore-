import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendLikeNotification } from "@/lib/email/resend";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if already liked
  const { data: existing } = await supabase
    .from("feed_post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("feed_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    return NextResponse.json({ liked: false });
  }

  await supabase.from("feed_post_likes").insert({ post_id: postId, user_id: user.id });

  // Fire-and-forget: notify post author (not the liker themselves)
  supabase
    .from("feed_posts")
    .select("user_id, profiles!user_id(username, email:auth_email)")
    .eq("id", postId)
    .maybeSingle()
    .then(async ({ data: post }) => {
      if (!post || post.user_id === user.id) return; // don't notify self-like
      const { data: liker } = await supabase
        .from("profiles").select("username").eq("id", user.id).maybeSingle();
      const { data: author } = await supabase
        .from("profiles").select("username").eq("id", post.user_id).maybeSingle();
      // Get author email from auth.users via admin API (server-side only)
      const { data: authUser } = await supabase.auth.admin.getUserById(post.user_id).catch(() => ({ data: null }));
      const email = authUser?.user?.email;
      if (email && liker?.username && author?.username) {
        sendLikeNotification({
          toEmail: email,
          toUsername: author.username,
          likerUsername: liker.username,
          postId,
        });
      }
    });

  return NextResponse.json({ liked: true });
}
