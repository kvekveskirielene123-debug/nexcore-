import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* GET /api/dm — list all DM conversations for the current user */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("dm_conversations")
    .select(`
      id,
      created_at,
      last_message_at,
      user1_id,
      user2_id
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const convs = data ?? [];

  // Collect all partner IDs to batch-load profiles
  const partnerIds = convs.map((c) =>
    c.user1_id === user.id ? c.user2_id : c.user1_id
  );
  const uniquePartnerIds = Array.from(new Set(partnerIds));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", uniquePartnerIds.length > 0 ? uniquePartnerIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  // Batch-load last message per conversation
  const convIds = convs.map((c) => c.id);
  const { data: lastMsgs } = convIds.length > 0
    ? await supabase
        .from("dm_messages")
        .select("conversation_id, content, sender_id, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })
        .limit(convIds.length * 3)
    : { data: [] };

  const lastMsgMap: Record<string, { content: string; sender_id: string; created_at: string }> = {};
  for (const m of lastMsgs ?? []) {
    if (!lastMsgMap[m.conversation_id]) {
      lastMsgMap[m.conversation_id] = { content: m.content, sender_id: m.sender_id, created_at: m.created_at };
    }
  }

  const conversations = convs.map((c) => {
    const partnerId = c.user1_id === user.id ? c.user2_id : c.user1_id;
    const partner = profileMap[partnerId];
    const lastMsg = lastMsgMap[c.id];
    return {
      id: c.id,
      created_at: c.created_at,
      last_message_at: c.last_message_at,
      partner_id: partnerId,
      partner_username: partner?.username ?? "Unknown",
      partner_avatar_url: partner?.avatar_url ?? null,
      last_message_content: lastMsg?.content ?? null,
      last_message_is_mine: lastMsg ? lastMsg.sender_id === user.id : null,
    };
  });

  return NextResponse.json({ conversations });
}

/* POST /api/dm — create or retrieve a DM conversation with a partner */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { partnerId?: string };
  const partnerId = body.partnerId?.trim();
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });
  if (partnerId === user.id) return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });

  // Canonical ordering: smaller UUID = user1 (ensures consistent lookup)
  const [u1, u2] = user.id < partnerId ? [user.id, partnerId] : [partnerId, user.id];

  // Find existing conversation first — avoids needing a named unique constraint
  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("id")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .maybeSingle();

  if (existing?.id) return NextResponse.json({ conversationId: existing.id });

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from("dm_conversations")
    .insert({ user1_id: u1, user2_id: u2 })
    .select("id")
    .single();

  if (error) {
    // Concurrent insert may have beaten us — try to find it again
    const { data: retry } = await supabase
      .from("dm_conversations")
      .select("id")
      .eq("user1_id", u1)
      .eq("user2_id", u2)
      .maybeSingle();
    if (retry?.id) return NextResponse.json({ conversationId: retry.id });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversationId: newConv.id });
}
