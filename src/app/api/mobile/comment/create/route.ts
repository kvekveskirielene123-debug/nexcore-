import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isUserBanned } from "@/lib/checkBanned";
import { pushToUser } from "@/lib/pushNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (await isUserBanned(authUser.id, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (!checkRateLimit(`comment:${authUser.id}`, 30, 60_000)) {
      return NextResponse.json({ error: "Slow down" }, { status: 429 });
    }

    const { postId, content, parentId, imageUrl } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }
    if (!content?.trim() && !imageUrl) {
      return NextResponse.json({ error: "Comment is empty" }, { status: 400 });
    }

    // Get post owner + commenter username in parallel
    const [{ data: post }, { data: commenterProfile }] = await Promise.all([
      supabaseAdmin.from("feed_posts").select("user_id").eq("id", postId).single(),
      supabaseAdmin.from("profiles").select("username").eq("id", authUser.id).single(),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { data: comment, error: insertErr } = await supabaseAdmin
      .from("feed_comments")
      .insert({
        post_id: postId,
        user_id: authUser.id,
        content: content?.trim() || null,
        parent_id: parentId ?? null,
        image_url: imageUrl ?? null,
      })
      .select("id, created_at")
      .single();

    if (insertErr || !comment) {
      return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
    }

    // Notify post owner — skip if commenting on own post
    const postOwnerId: string = (post as any).user_id;
    if (postOwnerId && postOwnerId !== authUser.id) {
      const commenterName: string = (commenterProfile as any)?.username ?? "";
      pushToUser(supabaseAdmin, postOwnerId, "comment", { commenterName }, { screen: "Feed" });
    }

    return NextResponse.json({ id: (comment as any).id, created_at: (comment as any).created_at });
  } catch (err: any) {
    console.error("[comment/create]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
