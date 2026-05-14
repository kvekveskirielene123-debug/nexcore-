import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const tagsParam = searchParams.get("tags");
  const limit = 20;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("feed_posts")
    .select(`
      id, user_id, content, image_url, nsfw, tags, created_at,
      profiles ( username, avatar_url ),
      feed_post_likes ( user_id ),
      feed_comments ( id )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  if (tagsParam) {
    const tagArr = tagsParam.split(",").map(t => t.trim()).filter(Boolean);
    if (tagArr.length > 0) {
      query = query.overlaps("tags", tagArr);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Profile = { username: string; avatar_url: string | null } | null;

  const posts = (data ?? []).map((p) => ({
    id:             p.id,
    user_id:        p.user_id,
    content:        p.content,
    image_url:      p.image_url ?? null,
    nsfw:           (p.nsfw as boolean) ?? false,
    tags:           (p.tags as string[]) ?? [],
    created_at:     p.created_at,
    username:       (p.profiles as unknown as Profile)?.username ?? "Unknown",
    user_avatar_url:(p.profiles as unknown as Profile)?.avatar_url ?? null,
    likes_count:    (p.feed_post_likes as { user_id: string }[])?.length ?? 0,
    liked_by_me:    user
      ? (p.feed_post_likes as { user_id: string }[])?.some(l => l.user_id === user.id) ?? false
      : false,
    comment_count:  (p.feed_comments as { id: string }[])?.length ?? 0,
  }));

  const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;
  return NextResponse.json({ posts, nextCursor });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    content?: string;
    image_url?: string;
    nsfw?: boolean;
    tags?: string[];
  };

  const content   = (body.content ?? "").trim();
  const image_url = body.image_url?.trim() || null;
  const nsfw      = body.nsfw === true;
  const tags      = Array.isArray(body.tags)
    ? body.tags.slice(0, 5).map(t => String(t).toUpperCase().slice(0, 20))
    : [];

  if (!content && !image_url) {
    return NextResponse.json({ error: "Post must have content or an image" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "Content must be under 500 characters" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_posts")
    .insert({ user_id: user.id, content: content || " ", image_url, nsfw, tags })
    .select(`
      id, user_id, content, image_url, nsfw, tags, created_at,
      profiles ( username, avatar_url )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Profile = { username: string; avatar_url: string | null } | null;

  return NextResponse.json({
    post: {
      id:             data.id,
      user_id:        data.user_id,
      content:        data.content,
      image_url:      data.image_url ?? null,
      nsfw:           (data.nsfw as boolean) ?? false,
      tags:           (data.tags as string[]) ?? [],
      created_at:     data.created_at,
      username:       (data.profiles as unknown as Profile)?.username ?? "Unknown",
      user_avatar_url:(data.profiles as unknown as Profile)?.avatar_url ?? null,
      likes_count:    0,
      liked_by_me:    false,
      comment_count:  0,
    },
  });
}
