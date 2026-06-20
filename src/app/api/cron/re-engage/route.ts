import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MESSAGES: ((name: string) => { title: string; body: string })[] = [
  (name) => ({ title: `${name} misses you`, body: "Come back and continue your story in Nexcor." }),
  (name) => ({ title: "Your character is waiting…", body: `${name} has been wondering where you've been.` }),
  (name) => ({ title: "Pick up where you left off", body: `${name} is ready to continue your adventure.` }),
  (name) => ({ title: "Someone in Nexcor is thinking of you", body: `${name} left something unsaid. Come back.` }),
];

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Conversations active between 23–25h ago — the "missed you" window
  const cutoffLow = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
  const cutoffHigh = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString();

  // Fetch all conversations active in the last 25h so we can compute the per-user maximum
  const { data: recentConvs, error } = await supabaseAdmin
    .from("conversations")
    .select("user_id, character_id, last_message_at")
    .gte("last_message_at", cutoffLow)
    .not("last_message_at", "is", null)
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Per user: keep only the most recent conversation
  const latestByUser = new Map<string, { character_id: string; last_message_at: string }>();
  for (const c of recentConvs ?? []) {
    const existing = latestByUser.get(c.user_id);
    if (!existing || c.last_message_at > existing.last_message_at) {
      latestByUser.set(c.user_id, { character_id: c.character_id, last_message_at: c.last_message_at });
    }
  }

  // Keep only users whose latest activity falls in the 23–25h window (haven't chatted since)
  const eligible = Array.from(latestByUser.entries()).filter(
    ([, v]) => v.last_message_at >= cutoffLow && v.last_message_at <= cutoffHigh
  );

  if (eligible.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const userIds = eligible.map(([uid]) => uid);
  const charIds = Array.from(new Set(eligible.map(([, v]) => v.character_id)));

  const [{ data: profiles }, { data: characters }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, push_token").in("id", userIds),
    supabaseAdmin.from("characters").select("id, name").in("id", charIds),
  ]);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.push_token as string | null]));
  const charMap = new Map((characters ?? []).map((c: any) => [c.id, c.name as string]));

  const notifications: object[] = [];
  for (const [userId, { character_id }] of eligible) {
    const token = profileMap.get(userId);
    if (!token) continue;
    const charName = charMap.get(character_id) ?? "Your character";
    const pick = MESSAGES[Math.floor(Math.random() * MESSAGES.length)](charName);
    notifications.push({
      to: token,
      title: pick.title,
      body: pick.body,
      sound: "default",
      priority: "high",
      channelId: "default",
      data: { screen: "Chat", characterId: character_id },
    });
  }

  if (notifications.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // Expo Push API accepts up to 100 per request
  let sent = 0;
  for (let i = 0; i < notifications.length; i += 100) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Encoding": "gzip, deflate" },
      body: JSON.stringify(notifications.slice(i, i + 100)),
    });
    sent += Math.min(100, notifications.length - i);
  }

  return NextResponse.json({ ok: true, sent });
}
