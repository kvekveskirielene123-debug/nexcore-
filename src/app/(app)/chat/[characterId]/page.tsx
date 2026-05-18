// UPDATED (E4) · Loads user preferences (theme, font size, default model)
// and passes them into the chat UI.
//
// Replace your existing src/app/(app)/chat/[characterId]/page.tsx with this.
// The structure is the same — we just add a prefs fetch and wrap the page
// in <ChatThemeWrapper> + pass fontSize + defaultModel down.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ChatThemeWrapper } from "./ChatThemeWrapper";
import { ChatClient } from "./ChatClient";
import { DEFAULT_PREFERENCES } from "@/lib/settings/preferences";
import type { ChatThemeKey, ChatFontSize, DefaultModel } from "@/lib/settings/preferences";

interface PageProps {
  params: Promise<{ characterId: string }>;
  searchParams: Promise<{ conv?: string }>;
}

export default async function ChatPage({ params, searchParams }: PageProps) {
  const { characterId } = await params;
  const { conv: convId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/chat/${characterId}`);

  // ── Load character ────────────────────────────────────────────
  const { data: character } = await supabase
    .from("characters")
    .select(
      "id, name, subtitle, description, greeting, long_term_memory, gender_pronouns, avatar_url, visibility, is_nsfw, created_by, tier, is_platform"
    )
    .eq("id", characterId)
    .maybeSingle();

  if (!character) notFound();
  if (
    character.visibility !== "public" &&
    character.created_by !== user.id
  ) {
    notFound();
  }

  // ── Load creator profile (for sidebar display) ───────────────
  const { data: creatorProfile } = character.created_by
    ? await supabase.from("profiles").select("username").eq("id", character.created_by).maybeSingle()
    : { data: null };

  // ── Load user profile + preferences ──────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, marks, chat_theme, chat_font_size, default_model, chat_language, pref_italics_on, subscription_expires_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  const chatTheme = (profile?.chat_theme as ChatThemeKey) ?? DEFAULT_PREFERENCES.chat_theme;
  const chatFontSize = (profile?.chat_font_size as ChatFontSize) ?? DEFAULT_PREFERENCES.chat_font_size;
  const defaultModel = (profile?.default_model as DefaultModel) ?? DEFAULT_PREFERENCES.default_model;
  const marksBalance = profile?.marks ?? 0;

  // ── Load or create the active conversation ────────────────────
  let conversation: { id: string; title: string | null; persona_id: string | null } | null = null;

  if (convId) {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, persona_id")
      .eq("id", convId)
      .eq("user_id", user.id)
      .maybeSingle();
    conversation = data ?? null;
  }

  // If no conv specified (or specified conv not found), load the latest one
  if (!conversation) {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, persona_id")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    conversation = data ?? null;
  }

  // If still no conversation, create one
  if (!conversation) {
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        character_id: characterId,
        title: "New Chat",
        title_auto_generated: true,
      })
      .select("id, title, persona_id")
      .single();
    conversation = newConv ?? null;
  }

  if (!conversation) notFound();

  // ── Load persona for this conversation ───────────────────────
  let activePersona = null;
  if (conversation.persona_id) {
    const { data: p } = await supabase
      .from("personas")
      .select(
        "id, user_id, name, age, gender_pronouns, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at"
      )
      .eq("id", conversation.persona_id)
      .maybeSingle();
    activePersona = p ?? null;
  }

  // ── Load existing messages ────────────────────────────────────
  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  // ── Load user's conversations list for PastChatsDrawer ───────
  const { data: allConversations } = await supabase
    .from("conversations")
    .select("id, title, last_message_at, persona_id")
    .eq("user_id", user.id)
    .eq("character_id", characterId)
    .order("last_message_at", { ascending: false })
    .limit(50);

  return (
    // ChatThemeWrapper injects all CSS vars for the active theme.
    // Every child that uses var(--chat-*) will automatically theme correctly.
    <ChatThemeWrapper themeKey={chatTheme}>
      <ChatClient
        character={{ ...character, creator_username: creatorProfile?.username ?? null }}
        conversation={conversation}
        initialMessages={messages ?? []}
        allConversations={allConversations ?? []}
        marksBalance={marksBalance}
        username={profile?.username ?? "you"}
        activePersona={activePersona}
        // E4 additions:
        defaultModel={defaultModel}
        chatFontSize={chatFontSize}
        subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
      />
    </ChatThemeWrapper>
  );
}
