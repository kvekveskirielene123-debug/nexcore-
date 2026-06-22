import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
    const { fromUserId, toUserId, postId, awardType } = await request.json();

    if (!fromUserId || !toUserId || !postId || !awardType) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const cost = AWARD_COSTS[awardType];
    if (cost === undefined) {
      return NextResponse.json({ error: "Invalid award type" }, { status: 400 });
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot award your own post" }, { status: 400 });
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
    const newSenderBalance = senderMarks - cost;
    const newRecipientBalance = ((recipientRes.data as any).marks ?? 0) + cost;
    const glyph = AWARD_GLYPHS[awardType];
    const name = AWARD_NAMES[awardType];

    const [senderUpd, recipientUpd, awardInsert] = await Promise.all([
      supabaseAdmin.from("profiles").update({ marks: newSenderBalance }).eq("id", fromUserId),
      supabaseAdmin.from("profiles").update({ marks: newRecipientBalance }).eq("id", toUserId),
      supabaseAdmin.from("feed_post_awards").insert({
        post_id: postId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        award_type: awardType,
        marks_spent: cost,
      }),
    ]);

    if (senderUpd.error) throw new Error(senderUpd.error.message);
    if (recipientUpd.error) throw new Error(recipientUpd.error.message);
    if (awardInsert.error) throw new Error(awardInsert.error.message);

    // Transaction log (best-effort)
    await Promise.allSettled([
      supabaseAdmin.from("mark_transactions").insert({
        user_id: fromUserId,
        amount: -cost,
        reason: `${name} award given to @${recipientUsername}'s post`,
        balance_after: newSenderBalance,
      }),
      supabaseAdmin.from("mark_transactions").insert({
        user_id: toUserId,
        amount: cost,
        reason: `${name} award received from @${senderUsername}`,
        balance_after: newRecipientBalance,
      }),
    ]);

    // Push notification for Surge and Nexus only (Signal is too common)
    if (awardType === "surge" || awardType === "nexus") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.nexcor.app";
      fetch(`${baseUrl}/api/mobile/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: toUserId,
          title: `${glyph} Award received!`,
          body: `Your post received a ${name} award from @${senderUsername}!`,
          data: { type: "award", postId, awardType },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, new_balance: newSenderBalance });
  } catch (err: any) {
    console.error("[mobile/give-award]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
