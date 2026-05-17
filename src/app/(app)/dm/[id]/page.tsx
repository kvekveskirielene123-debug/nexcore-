import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DmClient } from "./DmClient";

export const dynamic = "force-dynamic";

export default async function DmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    // Load conversation + verify participant
    const { data: conv, error: convErr } = await supabase
      .from("dm_conversations")
      .select("id, user1_id, user2_id, created_at")
      .eq("id", id)
      .single();

    if (convErr || !conv || (conv.user1_id !== user.id && conv.user2_id !== user.id)) {
      redirect("/chats");
    }

    const partnerId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

    // Load partner profile + current user profile + messages in parallel
    const [{ data: partner }, { data: profile }, { data: messages }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", partnerId)
        .single(),
      supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("dm_messages")
        .select("id, sender_id, content, image_url, created_at, read_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(100),
    ]);

    // Mark unread messages as read (fire and forget)
    supabase
      .from("dm_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null)
      .then(() => {});

    return (
      <DmClient
        conversationId={id}
        currentUser={{
          id: user.id,
          username: profile?.username ?? "You",
          avatar_url: profile?.avatar_url ?? null,
        }}
        partner={{
          id: partnerId,
          username: partner?.username ?? "Unknown",
          avatar_url: partner?.avatar_url ?? null,
        }}
        initialMessages={(messages ?? []).map((m) => {
          const row = m as {
            id: string;
            sender_id: string;
            content: string | null;
            image_url?: string | null;
            created_at: string;
            read_at: string | null;
          };
          return {
            id: row.id,
            sender_id: row.sender_id,
            content: row.content ?? "",
            image_url: row.image_url ?? null,
            created_at: row.created_at,
            read_at: row.read_at,
          };
        })}
      />
    );
  } catch (e) {
    // Re-throw Next.js redirect / notFound signals so they work correctly
    if (e && typeof e === "object" && "digest" in (e as object)) throw e;
    // For any unexpected DB/render error, fall back to chats
    redirect("/chats");
  }
}
