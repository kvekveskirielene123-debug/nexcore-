import { SupabaseClient } from "@supabase/supabase-js";

const PREF_MAP: Record<string, string> = {
  dm:              "notif_dms",
  comment:         "notif_comments",
  follow_request:  "notif_follows",
  follow_accepted: "notif_follows",
  post_reaction:   "notif_reactions",
  gift_marks:      "notif_gifts",
  group_message:   "notif_groups",
  group_voice:     "notif_groups",
  group_invite:    "notif_groups",
};

// Sanitise a param value: strip control chars, cap length
const s = (v: unknown, max: number) =>
  String(v ?? "").replace(/[\x00-\x1f]/g, "").slice(0, max);

function buildPayload(type: string, params: Record<string, unknown>): { title: string; body: string } | null {
  switch (type) {
    case "dm":
      return { title: s(params.senderName, 50), body: s(params.preview, 200) };
    case "comment":
      return {
        title: `@${s(params.commenterName, 50) || "someone"}`,
        body: "commented on your broadcast",
      };
    case "post_reaction":
      return {
        title: `@${s(params.reactorName, 50) || "someone"}`,
        body: `reacted ${s(params.glyph, 4)} to your broadcast`,
      };
    case "gift_marks":
      return {
        title: `@${s(params.senderName, 50) || "someone"}`,
        body: `sent you ${s(params.amount, 20)} ⟡`,
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
    case "group_message":
      return {
        title: `${s(params.groupName, 50)} — ${s(params.senderName, 50)}`,
        body: s(params.preview, 200),
      };
    case "group_invite":
      return {
        title: "Group chat invite",
        body: params.inviterName
          ? `${s(params.inviterName, 50)} invited you to join "${s(params.groupName, 100)}"`
          : `You've been invited to join "${s(params.groupName, 100)}"`,
      };
    default:
      return null;
  }
}

/**
 * Server-side push notification — uses service-role client, no auth rate limit.
 * Silently no-ops if recipient has no token or has disabled this notification type.
 */
export async function pushToUser(
  supabase: SupabaseClient,
  recipientId: string,
  type: string,
  params: Record<string, unknown>,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const prefKey = PREF_MAP[type];
    const columns = ["push_token", prefKey].filter(Boolean).join(", ");

    const { data: profile } = await supabase
      .from("profiles")
      .select(columns)
      .eq("id", recipientId)
      .single();

    const token: string | null = (profile as any)?.push_token ?? null;
    if (!token) return;

    if (prefKey && (profile as any)[prefKey] === false) return;

    const payload = buildPayload(type, params);
    if (!payload || !payload.title || !payload.body) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: data ?? {},
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
    });
  } catch {
    // Best-effort — never block the action for a push failure
  }
}
