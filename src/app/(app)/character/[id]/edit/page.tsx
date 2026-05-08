import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CreateClient } from "@/app/(app)/create/CreateClient";
import type { CharacterDraft } from "@/lib/create/types";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Entity · Nexcor",
};

export default async function EditCharacterPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/character/${id}/edit`);

  // Load character
  const { data: character } = await supabase
    .from("characters")
    .select(
      "id, name, subtitle, description, greeting, long_term_memory, gender_pronouns, avatar_url, visibility, is_nsfw, created_by"
    )
    .eq("id", id)
    .maybeSingle();

  if (!character) notFound();
  if (character.created_by !== user.id) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const isBrilliant = isSubscriptionActive(profile?.subscription_expires_at ?? null);

  const initialDraft: CharacterDraft = {
    name: character.name ?? "",
    subtitle: character.subtitle ?? "",
    description: character.description ?? "",
    greeting: character.greeting ?? "",
    long_term_memory: character.long_term_memory ?? "",
    gender_pronouns: character.gender_pronouns ?? "",
    avatar_url: character.avatar_url ?? null,
    visibility: (character.visibility as "public" | "private") ?? "public",
    is_nsfw: !!character.is_nsfw,
  };

  return (
    <>
      <CreateClient mode="edit" characterId={character.id} initialDraft={initialDraft} isBrilliant={isBrilliant} />
    </>
  );
}
