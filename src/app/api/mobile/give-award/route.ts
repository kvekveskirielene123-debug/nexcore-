import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { deductMarks, creditMarks } from "@/lib/marks/balance";
import { isUserBanned } from "@/lib/checkBanned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AWARD_COSTS: Record<string, number> = {
  signal: 50,
  surge: 100,
  nexus: 500,
};

const AWARD_GLYPHS: Record<string, string> = {
  signal: "✦",
  surge: "◈",
  nexus: "⬡",
};

const AWARD_NAMES: Record<string, string> = {
  signal: "Signal",
  surge: "Surge",
  nexus: "Nexus",
};

export async function POST(request: Request) {
  try {
    // JWT auth — fromUserId is derived from the verified token, never trusted from the body
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (await isUserBanned(authUser.id, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const { toUserId, postId, awardType } = await request.json();
    const fromUserId = authUser.id;

    if (!toUserId || !postId || !awardType) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const cost = AWARD_COSTS[awardType];
    if (cost === undefined) {
      return NextResponse.json({ error: "Invalid award type" }, { status: 400 });
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot award your own post" }, { status: 400 });
    }

    // Verify the post exists and toUserId is its owner — prevents redirecting marks to an arbitrary account
    const { data: post } = await supabaseAdmin
      .from("feed_posts")
      .select("user_id")
      .eq("id", postId)
      .single();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.user_id !== toUserId) {
      return NextResponse.json({ error: "Recipient does not own this post" }, { status: 400 });
    }

    // Duplicate guard — same user + post + tier
    const { data: existing } = await supabaseAdmin
      .from("feed_post_awards")
      .select("id")
      .eq("post_id", postId)
      .eq("from_user_id", fromUserId)
      .eq("award_type", awardType)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "already_awarded", message: "You already gave this award to this post" },
        { status: 409 }
      );
    }

    const [senderRes, recipientRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, marks, username").eq("id", fromUserId).single(),
      supabaseAdmin.from("profiles").select("id, marks, username").eq("id", toUserId).single(),
    ]);

    if (!senderRes.data)
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (!recipientRes.data)
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

    const senderMarks = (senderRes.data as any).marks ?? 0;
    if (senderMarks < cost) {
      return NextResponse.json(
        { error: "insufficient_marks", balance: senderMarks },
        { status: 402 }
      );
    }

    const senderUsername = (senderRes.data as any).username ?? "someone";
    const recipientUsername = (recipientRes.data as any).username ?? "someone";
    const glyph = AWARD_GLYPHS[awardType];
    const name = AWARD_NAMES[awardType];

    // Atomic deduction — RPC throws "insufficient_marks" if balance is too low.
    // Uses marks = marks - cost inside Postgres, so concurrent awards can't corrupt the balance.
    let newSenderBalance: number;
    try {
      newSenderBalance = await deductMarks(
        fromUserId,
        cost,
        `${name} award given to @${recipientUsername}'s post`,
        undefined,
        supabaseAdmin,
      );
    } catch (err: any) {
      if (err.message?.includes("insufficient_marks")) {
        return NextResponse.json({ error: "insufficient_marks", balance: senderMarks }, { status: 402 });
      }
      throw err;
    }

    // Atomic credit for recipient — uses marks = marks + cost inside Postgres.
    await creditMarks(
      toUserId,
      cost,
      `${name} award received from @${senderUsername}`,
      undefined,
      supabaseAdmin,
    );

    const { error: awardInsertError } = await supabaseAdmin.from("feed_post_awards").insert({
      post_id: postId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      award_type: awardType,
      marks_spent: cost,
    });
    if (awardInsertError) throw new Error(awardInsertError.message);

    // Push notification for Surge and Nexus only (Signal is too common).
    // Called inline rather than via HTTP so no auth token handoff is needed.
    if (awardType === "surge" || awardType === "nexus") {
      Promise.resolve(supabaseAdmin
        .from("profiles").select("push_token").eq("id", toUserId).single()
      ).then(({ data: recipientProfile }) => {
          const pushToken = (recipientProfile as any)?.push_token;
          if (!pushToken) return Promise.resolve();
          return fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              to: pushToken,
              title: `@${senderUsername}`,
              body: `gave your post a ${name} award ${glyph}`,
              data: { type: "award", postId, awardType },
              sound: "default",
              priority: "high",
              channelId: "default",
            }),
          }).then(() => {});
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, new_balance: newSenderBalance });
  } catch (err: any) {
    console.error("[mobile/give-award]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
