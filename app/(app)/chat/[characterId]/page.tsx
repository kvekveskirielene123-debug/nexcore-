import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ChatClient } from "./ChatClient";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import type { Message } from "@/components/chat/MessageList";

interface PageProps {
  params: Promise<{ characterId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { characterId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware should have caught this, but belt-and-suspenders
  if (!user) redirect(`/login?next=/chat/${characterId}`);

  // Load character (must be public or owned by user)
  const { data: character } = await supabase
    .from("characters")
    .select("id, name, subtitle, avatar_url, gender_pronouns, greeting, visibility, created_by")
    .eq("id", characterId)
    .single();

  if (!character) notFound();
  if (character.visibility !== "public" && character.created_by !== user.id) {
    notFound();
  }

  // Load user profile for marks + subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("marks, subscription_expires_at")
    .eq("id", user.id)
    .single();

  // Find most recent conversation for (user, character)
  const { data: latestConv } = await supabase
    .from("conversations")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("character_id", characterId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  let initialMessages: Message[] = [];
  let initialConversationId: string | null = null;
  let initialTitle = "New Chat";

  if (latestConv) {
    initialConversationId = latestConv.id;
    initialTitle = latestConv.title;
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", latestConv.id)
      .order("created_at", { ascending: true });
    initialMessages = (msgs ?? []) as Message[];
  } else if (character.greeting?.trim()) {
    // Show greeting preview even before a conversation exists
    initialMessages = [
      {
        id: "greeting-preview",
        role: "assistant" as const,
        content: character.greeting,
      },
    ];
  }

  return (
    <ChatClient
      character={character}
      initialConversationId={initialConversationId}
      initialMessages={initialMessages}
      initialTitle={initialTitle}
      initialMarksBalance={profile?.marks ?? 0}
      isSubscriber={isSubscriptionActive(profile?.subscription_expires_at ?? null)}
    />
  );
}
