import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

// Broadcast creation with enforced daily limits.
// Free users: 5 per day. Brilliant subscribers: 25 per day.
// "Day" = rolling 24 hours from now, not calendar midnight.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_DAILY_LIMIT = 5;
const BRILLIANT_DAILY_LIMIT = 25;
const FREE_COOLDOWN_SECONDS = 60;
const BRILLIANT_COOLDOWN_SECONDS = 30;

type RequestBody = {
  postType: "standard" | "poll";
  // Standard
  content: string | null;
  imageUrl: string | null;
  mediaType: "video" | null;
  mediaUrl: string | null;
  nsfw: boolean;
  allowVault: boolean;
  audience: "everyone" | "mutuals";
  quotedPostId: string | null;
  vaultMyPost: boolean;
  // Poll
  pollQuestion: string | null;
  pollOptions: string[] | null;
  pollEndsAt: string | null;
};

export async function POST(request: Request) {
  try {
    // Auth
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Burst rate limit — prevents rapid-fire submissions
    if (!checkRateLimit(`post-create:${authUser.id}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }

    const body = (await request.json()) as RequestBody;
    const { postType, content, imageUrl, mediaType, mediaUrl, nsfw, allowVault,
            audience, quotedPostId, vaultMyPost, pollQuestion, pollOptions, pollEndsAt } = body;

    // Basic validation
    if (!postType || !["standard", "poll"].includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }
    if (postType === "standard" && !content?.trim() && !imageUrl && !mediaUrl) {
      return NextResponse.json({ error: "Broadcast has no content" }, { status: 400 });
    }
    if (postType === "poll" && (!pollQuestion?.trim() || !pollOptions || pollOptions.length < 2)) {
      return NextResponse.json({ error: "Poll requires a question and at least 2 options" }, { status: 400 });
    }

    // Load profile for subscription check
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", authUser.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSub = isSubscriptionActive((profile as any).subscription_expires_at ?? null);
    const dailyLimit = isSub ? BRILLIANT_DAILY_LIMIT : FREE_DAILY_LIMIT;

    // Count posts in last 24h AND fetch most recent post timestamp in one query
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [{ count, error: countErr }, { data: lastPostRow }] = await Promise.all([
      supabaseAdmin
        .from("feed_posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .gte("created_at", since),
      supabaseAdmin
        .from("feed_posts")
        .select("created_at")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (countErr) {
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    // Cooldown check — prevents back-to-back spam
    if (lastPostRow?.created_at) {
      const cooldown = isSub ? BRILLIANT_COOLDOWN_SECONDS : FREE_COOLDOWN_SECONDS;
      const secondsSinceLast = (Date.now() - new Date(lastPostRow.created_at).getTime()) / 1000;
      if (secondsSinceLast < cooldown) {
        const waitSeconds = Math.ceil(cooldown - secondsSinceLast);
        return NextResponse.json({ error: "cooldown", waitSeconds }, { status: 429 });
      }
    }

    if ((count ?? 0) >= dailyLimit) {
      return NextResponse.json({
        error: "daily_limit_exceeded",
        limit: dailyLimit,
        used: count,
        brilliant: isSub,
      }, { status: 429 });
    }

    // Insert the post
    let insertPayload: Record<string, unknown>;
    if (postType === "poll") {
      insertPayload = {
        user_id: authUser.id,
        content: pollQuestion!.trim(),
        post_type: "poll",
        poll_question: pollQuestion!.trim(),
        poll_options: pollOptions!.map(o => o.trim()).filter(Boolean),
        poll_ends_at: pollEndsAt,
        nsfw: false,
        tags: [],
        audience: audience ?? "everyone",
      };
    } else {
      insertPayload = {
        user_id: authUser.id,
        content: content?.trim() || null,
        image_url: imageUrl ?? null,
        media_type: mediaType ?? null,
        media_url: mediaUrl ?? null,
        post_type: "standard",
        nsfw: nsfw ?? false,
        tags: [],
        allow_vault: allowVault ?? true,
        audience: audience ?? "everyone",
        ...(quotedPostId ? { quoted_post_id: quotedPostId } : {}),
      };
    }

    const { data: insertedPost, error: insertErr } = await supabaseAdmin
      .from("feed_posts")
      .insert(insertPayload)
      .select("id, created_at")
      .single();

    if (insertErr || !insertedPost) {
      return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
    }

    // Vault self-save (standard posts only) — non-fatal if it fails
    if (vaultMyPost && postType === "standard") {
      try {
        await supabaseAdmin.from("vault_items").insert({
          user_id: authUser.id,
          post_id: insertedPost.id,
          post_snapshot: {
            id: insertedPost.id,
            user_id: authUser.id,
            content: content?.trim() || null,
            image_url: imageUrl ?? null,
            media_type: mediaType ?? null,
            media_url: mediaUrl ?? null,
            nsfw: nsfw ?? false,
            tags: [],
            allow_vault: allowVault ?? true,
            created_at: insertedPost.created_at,
          },
          saved_at: new Date().toISOString(),
        });
      } catch {
        // Post is already created — vault save failure doesn't block the response
      }
    }

    return NextResponse.json({
      postId: insertedPost.id,
      postsToday: (count ?? 0) + 1,
      dailyLimit,
    });
  } catch (err: any) {
    console.error("[post/create] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
