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
      character_id,
      characters (
        name,
        subtitle,
        avatar_url
      )
    `)
    .eq("user_id", user.id)
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
  }));

  return <ChatsClient conversations={conversations} userId={user.id} />;
}
