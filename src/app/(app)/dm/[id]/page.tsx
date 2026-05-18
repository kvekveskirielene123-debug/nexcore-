import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DmClient } from "./DmClient";

export const dynamic = "force-dynamic";

export default async function DmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // maybeSingle() returns null (not an error) when row doesn't exist —
  // avoids calling redirect() inside a try block which creates a
  // catch-re-throw chain that can hit the error boundary instead of redirecting.
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user1_id, user2_id")
    .eq("id", id)
    .maybeSingle();

  if (!conv || (conv.user1_id !== user.id && conv.user2_id !== user.id)) {
    redirect("/chats");
  }

  const partnerId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

  const [{ data: partner }, { data: profile }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("id, username, avatar_url").eq("id", partnerId).maybeSingle(),
    supabase.from("profiles").select("username, avatar_url").eq("id", user.id).maybeSingle(),
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
        username: profile?.username || "You",
        avatar_url: profile?.avatar_url ?? null,
      }}
      partner={{
        id: partnerId,
        username: partner?.username || "Unknown",
        avatar_url: partner?.avatar_url ?? null,
      }}
      initialMessages={(messages ?? []).map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        content: m.content ?? "",
        image_url: m.image_url ?? null,
        created_at: m.created_at,
        read_at: m.read_at ?? null,
      }))}
    />
  );
}
