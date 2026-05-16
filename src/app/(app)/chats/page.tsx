import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatsClient } from "./ChatsClient";

export const metadata = { title: "Chats · Nexcor" };

export interface ConversationRow {
  id: string;
  title: string | null;
  last_message_at: string | null;
  character_id: string;
  character_name: string;
  character_subtitle: string | null;
  character_avatar: string | null;
  last_message_preview: string | null;
  last_message_role: string | null;
  is_pinned: boolean;
}

export default async function ChatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chats");

  const { data: rows } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      last_message_at,
      is_pinned,
      character_id,
      characters (
        name,
        subtitle,
        avatar_url
      )
    `)
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("last_message_at", { ascending: false })
    .limit(200);

  const conversations: ConversationRow[] = (rows ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    last_message_at: r.last_message_at,
    character_id: r.character_id,
    character_name: r.characters?.name ?? "Unknown",
    character_subtitle: r.characters?.subtitle ?? null,
    character_avatar: r.characters?.avatar_url ?? null,
    last_message_preview: null,
    last_message_role: null,
    is_pinned: r.is_pinned ?? false,
  }));

  // Fetch last message per conversation (one batch query)
  const convIds = conversations.map((c) => c.id);
  if (convIds.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, content, role")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false })
      .limit(convIds.length * 4);

    const lastMsgMap: Record<string, { content: string; role: string }> = {};
    for (const msg of msgs ?? []) {
      if (!lastMsgMap[msg.conversation_id]) {
        lastMsgMap[msg.conversation_id] = { content: msg.content, role: msg.role };
      }
    }

    for (const conv of conversations) {
      const m = lastMsgMap[conv.id];
      if (m) {
        conv.last_message_preview = m.content;
        conv.last_message_role = m.role;
      }
    }
  }

  return <ChatsClient conversations={conversations} userId={user.id} />;
}
