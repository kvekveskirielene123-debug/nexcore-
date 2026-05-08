import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FadeInSection } from "@/components/home/FadeInSection";
import { CharacterHero } from "@/components/character/CharacterHero";
import { CharacterDossier } from "@/components/character/CharacterDossier";
import { GreetingPreview } from "@/components/character/GreetingPreview";
import { CharacterActions } from "@/components/character/CharacterActions";
import { RatingSection } from "@/components/character/RatingSection";
import {
  getRatingAggregate,
  getUserRating,
  hasUserChattedWithCharacter,
} from "@/lib/ratings/helpers";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatSubjectId(id: string, name: string): string {
  const slug = id.replace(/-/g, "").slice(-4).toUpperCase();
  const letter = (name.charAt(0) || "X").toUpperCase();
  return `SUBJECT #${slug}-${letter}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: character } = await supabase
    .from("characters")
    .select("name, subtitle, description, greeting, avatar_url, visibility")
    .eq("id", id)
    .maybeSingle();

  if (!character || character.visibility !== "public") {
    return { title: "Nexcor" };
  }

  const title = `${character.name}${character.subtitle ? ` · ${character.subtitle}` : ""} · Nexcor`;
  const rawDescription =
    character.description?.trim() ||
    character.greeting?.trim() ||
    "Meet this character on Nexcor. AI companions that feel truly alive.";
  const description = rawDescription.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: character.avatar_url
        ? [
            {
              url: character.avatar_url,
              width: 512,
              height: 512,
              alt: character.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: character.avatar_url ? [character.avatar_url] : undefined,
    },
  };
}

export default async function CharacterProfilePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: character } = await supabase
    .from("characters")
    .select(
      "id, name, subtitle, description, greeting, avatar_url, gender_pronouns, visibility, is_nsfw, is_platform, tier, created_by, created_at, link_access"
    )
    .eq("id", id)
    .maybeSingle();

  if (!character) notFound();
  if (
    character.visibility !== "public" &&
    !character.link_access &&
    character.created_by !== user?.id
  ) {
    notFound();
  }

  // Creator info
  let creatorUsername: string | null = null;
  let showCreatorBadge = false;
  if (character.created_by) {
    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select("username, show_creator_badge")
      .eq("id", character.created_by)
      .maybeSingle();
    creatorUsername = creatorProfile?.username ?? null;
    showCreatorBadge = !!creatorProfile?.show_creator_badge;
  }

  // Stats: chat count + rating aggregate
  const { data: stats } = await supabase
    .from("character_stats")
    .select("chat_count")
    .eq("character_id", character.id)
    .maybeSingle();
  const chatCount = stats?.chat_count ?? 0;

  const ratingAggregate = await getRatingAggregate(character.id);

  // Per-user state
  let initialFavorited = false;
  let userRating: number | null = null;
  let userHasChatted = false;
  let isOwner = false;

  if (user) {
    isOwner = user.id === character.created_by;

    const { data: favRow } = await supabase
      .from("character_favorites")
      .select("character_id")
      .eq("user_id", user.id)
      .eq("character_id", character.id)
      .maybeSingle();
    initialFavorited = !!favRow;

    if (!isOwner) {
      userRating = await getUserRating(user.id, character.id);
      userHasChatted = await hasUserChattedWithCharacter(user.id, character.id);
    }
  }

  // Determine rating mode for the section
  let ratingMode:
    | { kind: "loggedOut" }
    | { kind: "creator" }
    | { kind: "needsChat"; characterId: string }
    | { kind: "ratable"; characterId: string; initialRating: number | null };

  if (!user) {
    ratingMode = { kind: "loggedOut" };
  } else if (isOwner) {
    ratingMode = { kind: "creator" };
  } else if (!userHasChatted) {
    ratingMode = { kind: "needsChat", characterId: character.id };
  } else {
    ratingMode = {
      kind: "ratable",
      characterId: character.id,
      initialRating: userRating,
    };
  }

  const subjectId = formatSubjectId(character.id, character.name);
  const isLoggedIn = !!user;

  return (
    <>
      <main className="min-h-screen bg-[#05020d]">
        <CharacterHero
          name={character.name}
          subtitle={character.subtitle}
          avatarUrl={character.avatar_url}
          genderPronouns={character.gender_pronouns}
          subjectId={subjectId}
          isPlatform={!!character.is_platform}
          tier={(character.tier as "standard" | "brilliant") ?? "standard"}
          isNsfw={!!character.is_nsfw}
          showCreatorBadge={showCreatorBadge}
        >
          <CharacterActions
            characterId={character.id}
            characterName={character.name}
            isLoggedIn={isLoggedIn}
            isOwner={isOwner}
            initialFavorited={initialFavorited}
          />
        </CharacterHero>

        <div className="max-w-3xl mx-auto px-4 md:px-6 pb-24 space-y-10">
          <FadeInSection>
            <CharacterDossier
              subjectId={subjectId}
              creatorUsername={creatorUsername}
              creatorId={character.created_by}
              isPlatformCreator={!!character.is_platform}
              genderPronouns={character.gender_pronouns}
              tier={(character.tier as "standard" | "brilliant") ?? "standard"}
              isNsfw={!!character.is_nsfw}
              chatCount={chatCount}
              createdAt={character.created_at}
            />
          </FadeInSection>

          {character.description?.trim() && (
            <FadeInSection>
              <section className="rounded-xl border border-purple-700/15 bg-[#0c0520]/50 p-6 relative overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent absolute top-0 left-0 right-0" />
                <div
                  className="text-[10px] tracking-[3px] text-[#00e5ff]/50 uppercase mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ◈ About
                </div>
                <p
                  className="text-[15px] leading-[1.85] text-[#c0b8d8] whitespace-pre-wrap"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {character.description}
                </p>
              </section>
            </FadeInSection>
          )}

          {character.greeting?.trim() && (
            <FadeInSection>
              <GreetingPreview
                greeting={character.greeting}
                characterName={character.name}
                characterAvatarUrl={character.avatar_url}
                showSignupGate={!isLoggedIn}
                characterId={character.id}
              />
            </FadeInSection>
          )}

          {/* Ratings section */}
          <FadeInSection>
            <RatingSection
              characterId={character.id}
              characterName={character.name}
              ratingCount={ratingAggregate.rating_count}
              average={ratingAggregate.average}
              averageRaw={ratingAggregate.average_raw}
              mode={ratingMode}
            />
          </FadeInSection>

          <div
            className="text-center text-[9px] tracking-[3px] text-purple-500/20 uppercase pt-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEOLUTION SCIENCE DIVISION · SESTRA PROTOCOL ACTIVE · 324B21
          </div>
        </div>
      </main>
    </>
  );
}
