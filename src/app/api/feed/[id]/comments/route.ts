import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

type Profile = { username: string; avatar_url: string | null } | null;

export async function GET(_req: Request, { params }: RouteCtx) {
  const { id: postId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feed_comments")
    .select(`
      id, post_id, user_id, parent_id, content, created_at,
      profiles ( username, avatar_url )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const comments = (data ?? []).map(c => ({
    id:             c.id,
    post_id:        c.post_id,
    user_id:        c.user_id,
    parent_id:      c.parent_id ?? null,
    content:        c.content,
    created_at:     c.created_at,
    username:       (c.profiles as unknown as Profile)?.username ?? "Unknown",
    user_avatar_url:(c.profiles as unknown as Profile)?.avatar_url ?? null,
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: RouteCtx) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { content?: string; parent_id?: string };
  const content   = (body.content ?? "").trim();
  const parent_id = body.parent_id ?? null;

  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Comment must be 1–500 characters" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_comments")
    .insert({ post_id: postId, user_id: user.id, content, parent_id })
    .select(`
      id, post_id, user_id, parent_id, content, created_at,
      profiles ( username, avatar_url )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    comment: {
      id:             data.id,
      post_id:        data.post_id,
      user_id:        data.user_id,
      parent_id:      data.parent_id ?? null,
      content:        data.content,
      created_at:     data.created_at,
      username:       (data.profiles as unknown as Profile)?.username ?? "Unknown",
      user_avatar_url:(data.profiles as unknown as Profile)?.avatar_url ?? null,
    },
  });
}

export async function DELETE(request: Request, { params }: RouteCtx) {
  const { id: postId } = await params;
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("feed_comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
