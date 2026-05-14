import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // ISO timestamp for pagination
  const limit  = 20;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("feed_posts")
    .select(`
      id, user_id, content, image_url, created_at,
      profiles ( username, avatar_url ),
      feed_post_likes ( user_id )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = (data ?? []).map((p) => ({
    id:             p.id,
    user_id:        p.user_id,
    content:        p.content,
    image_url:      p.image_url ?? null,
    created_at:     p.created_at,
    username:       (p.profiles as unknown as { username: string; avatar_url: string | null } | null)?.username ?? "Unknown",
    user_avatar_url:(p.profiles as unknown as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
    likes_count:    (p.feed_post_likes as { user_id: string }[])?.length ?? 0,
    liked_by_me:    user ? (p.feed_post_likes as { user_id: string }[])?.some((l) => l.user_id === user.id) ?? false : false,
  }));

  const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;

  return NextResponse.json({ posts, nextCursor });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { content?: string; image_url?: string };
  const content   = (body.content ?? "").trim();
  const image_url = body.image_url?.trim() || null;

  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Content must be 1–500 characters" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_posts")
    .insert({ user_id: user.id, content, image_url })
    .select(`
      id, user_id, content, image_url, created_at,
      profiles ( username, avatar_url )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    post: {
      id:             data.id,
      user_id:        data.user_id,
      content:        data.content,
      image_url:      data.image_url ?? null,
      created_at:     data.created_at,
      username:       (data.profiles as unknown as { username: string; avatar_url: string | null } | null)?.username ?? "Unknown",
      user_avatar_url:(data.profiles as unknown as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
      likes_count:    0,
      liked_by_me:    false,
    },
  });
}
