import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/lib/settings/preferences";

export const metadata = {
  title: "Settings · Nexcor",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  // Profile: username, bio, avatar, marks, all preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      username,
      bio,
      avatar_url,
      marks,
      show_nsfw,
      show_creator_badge,
      default_model,
      chat_language,
      pref_italics_on,
      pref_gray_text_on,
      chat_font_size,
      chat_theme
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding/username");
  }

  // Build preferences with defaults filling in missing fields (older accounts)
  const preferences: UserPreferences = {
    show_nsfw: profile.show_nsfw ?? DEFAULT_PREFERENCES.show_nsfw,
    show_creator_badge: profile.show_creator_badge ?? DEFAULT_PREFERENCES.show_creator_badge,
    default_model: (profile.default_model as any) ?? DEFAULT_PREFERENCES.default_model,
    chat_language: profile.chat_language ?? DEFAULT_PREFERENCES.chat_language,
    pref_italics_on: profile.pref_italics_on ?? DEFAULT_PREFERENCES.pref_italics_on,
    pref_gray_text_on: profile.pref_gray_text_on ?? DEFAULT_PREFERENCES.pref_gray_text_on,
    chat_font_size: (profile.chat_font_size as any) ?? DEFAULT_PREFERENCES.chat_font_size,
    chat_theme: (profile.chat_theme as any) ?? DEFAULT_PREFERENCES.chat_theme,
  };

  // Stats for the delete-account dialog: live counts of what would be deleted.
  const [{ count: characterCount }, { count: conversationCount }, { count: messageCountRaw }] =
    await Promise.all([
      supabase
        .from("characters")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      // messages don't have user_id directly; count via JOIN through conversations
      supabase
        .from("messages")
        .select("id, conversations!inner(user_id)", { count: "exact", head: true })
        .eq("conversations.user_id", user.id),
    ]);

  const stats = {
    characterCount: characterCount ?? 0,
    conversationCount: conversationCount ?? 0,
    messageCount: messageCountRaw ?? 0,
    marksBalance: profile.marks ?? 0,
  };

  const bioPreview =
    profile.bio && profile.bio.trim().length > 0
      ? profile.bio.trim().length > 80
        ? profile.bio.trim().slice(0, 80) + "…"
        : profile.bio.trim()
      : null;

  return (
    <>
      <SettingsClient
        username={profile.username ?? "subject"}
        bioPreview={bioPreview}
        avatarUrl={profile.avatar_url ?? null}
        marksBalance={profile.marks ?? 0}
        preferences={preferences}
        stats={stats}
      />
    </>
  );
}
