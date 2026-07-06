import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All valid notification types — any type not in this list is rejected.
// Clients send type + params; the server builds the final title/body so
// no user can craft arbitrary push notification content.
const VALID_TYPES = new Set([
  "dm",
  "comment",
  "follow_request",
  "follow_accepted",
  "post_reaction",
  "gift_marks",
  "group_message",
  "group_voice",
  "group_invite",
  "admin_warn",
  "admin_ban_temp",
  "admin_ban_7day",
  "admin_ban_permanent",
  "admin_false_report_warn",
  "admin_false_report_ban",
  "admin_new_report",
  "report_received",
  "content_deleted",
  "report_cleared",
]);

function buildNotification(
  type: string,
  params: Record<string, unknown>,
): { title: string; body: string } {
  // Sanitise a param: strip control chars and cap length
  const s = (v: unknown, max: number) =>
    String(v ?? "").replace(/[\x00-\x1f]/g, "").slice(0, max);
  const n = (v: unknown, min: number, max: number) =>
    Math.max(min, Math.min(max, Number(v) || min));

  switch (type) {
    case "dm":
      return { title: s(params.senderName, 50), body: s(params.preview, 200) };
    case "comment":
      return {
        title: `@${s(params.commenterName, 50) || "someone"}`,
        body: "commented on your post",
      };
    case "follow_request":
      return {
        title: `@${s(params.followerName, 50) || "someone"}`,
        body: "wants to follow you",
      };
    case "follow_accepted":
      return {
        title: params.acceptorName ? `@${s(params.acceptorName, 50)}` : "Follow request accepted",
        body: "accepted your follow request",
      };
    case "post_reaction":
      return {
        title: `@${s(params.reactorName, 50) || "someone"}`,
        body: `reacted ${s(params.glyph, 4)} to your post`,
      };
    case "gift_marks":
      return {
        title: `@${s(params.senderName, 50)}`,
        body: `sent you ${s(params.amount, 20)} ⟡`,
      };
    case "group_message":
      return {
        title: `${s(params.groupName, 50)} — ${s(params.senderName, 50)}`,
        body: s(params.preview, 200),
      };
    case "group_voice":
      return {
        title: `${s(params.groupName, 50)} — ${s(params.senderName, 50)}`,
        body: "🎤 Voice message",
      };
    case "group_invite":
      return {
        title: "Group chat invite",
        body: params.inviterName
          ? `${s(params.inviterName, 50)} invited you to join "${s(params.groupName, 100)}". Open Notifications to accept.`
          : `You've been invited to join "${s(params.groupName, 100)}". Open Notifications to accept.`,
      };
    case "admin_warn": {
      const strike = n(params.strike, 1, 5);
      return {
        title: `⚠ Community Warning (${strike}/5)`,
        body: `Your ${s(params.contentType, 30)} was reported for: ${s(params.reason, 100)}. ${5 - strike} warning(s) left before suspension.`,
      };
    }
    case "admin_ban_temp": {
      const days = n(params.days, 1, 365);
      return {
        title: `⦸ Suspended ${days}d`,
        body: `Your account is suspended for ${days} day${days > 1 ? "s" : ""} — ${s(params.reason, 100)}. Returns ${s(params.until, 50)}.`,
      };
    }
    case "admin_ban_7day":
      return {
        title: "⦸ Account Suspended (7 days)",
        body: `You reached 5 warnings. Account suspended until ${s(params.until, 50)}.`,
      };
    case "admin_ban_permanent":
      return {
        title: "⦸ Account Permanently Suspended",
        body: "Your account has been permanently suspended for serious violations of community guidelines.",
      };
    case "admin_false_report_warn": {
      const strike = n(params.strike, 1, 5);
      return {
        title: `⚠ False Report Warning (${strike}/5)`,
        body: `Your report was reviewed and dismissed as false. ${5 - strike} more false report(s) will result in a suspension.`,
      };
    }
    case "admin_false_report_ban":
      return {
        title: "⦸ Suspended for false reports",
        body: "You have submitted 5 false reports. Your account has been suspended for 24 hours.",
      };
    case "admin_new_report":
      return {
        title: "⚑ New Report",
        body: `${s(params.contentType, 50)} reported: ${s(params.reason, 100)}`,
      };
    case "report_received":
      return {
        title: "⚠ Your content was reported",
        body: `Your ${s(params.contentType, 30)} has been reported and is currently under review by our moderation team.`,
      };
    case "content_deleted":
      return {
        title: "⦸ Content Removed",
        body: `Your ${s(params.contentType, 30)} was removed for violating community guidelines: ${s(params.reason, 100)}.`,
      };
    case "report_cleared":
      return {
        title: "✓ You are cleared",
        body: `Your ${s(params.contentType, 30)} was reviewed and no violation was found. You are all clear.`,
      };
    default:
      return { title: "", body: "" };
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const authToken = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(authToken);
    if (authError || !authUser) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(`notify:${authUser.id}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json({ ok: false, error: "Too many notifications. Slow down." }, { status: 429 });
    }

    const { recipientId, type, params, data } = await req.json();
    if (!recipientId || !type) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ ok: false, error: "Invalid notification type" }, { status: 400 });
    }

    const { title, body } = buildNotification(type, (params as Record<string, unknown>) ?? {});
    if (!title || !body) {
      return NextResponse.json({ ok: false, error: "Could not build notification" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("push_token")
      .eq("id", recipientId)
      .single();

    const token = (profile as any)?.push_token;
    if (!token) return NextResponse.json({ ok: false, error: "No push token" });

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data: data ?? {},
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
    });

    const result = await res.json();
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
