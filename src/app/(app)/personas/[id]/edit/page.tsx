import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PersonaForm } from "@/components/personas/PersonaForm";
import type { PersonaDraft, PersonaTone } from "@/lib/personas/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Persona · Nexcor",
};

export default async function EditPersonaPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/personas/${id}/edit`);

  const { data: persona } = await supabase
    .from("personas")
    .select(
      "id, user_id, name, age, gender_pronouns, bio, tone, tags, hobbies_text, avatar_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!persona) notFound();
  if (persona.user_id !== user.id) notFound();

  const initialDraft: PersonaDraft = {
    name: persona.name,
    age: persona.age,
    gender_pronouns: persona.gender_pronouns,
    bio: persona.bio ?? "",
    tone: persona.tone as PersonaTone,
    tags: persona.tags ?? [],
    hobbies_text: persona.hobbies_text ?? "",
    avatar_url: persona.avatar_url ?? null,
  };

  return (
    <>
      <main className="min-h-screen bg-[#05020d] pt-8 pb-20 px-4 md:px-8">
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ PERSONA EDIT · {persona.id.slice(-6).toUpperCase()}
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            EDIT {persona.name.toUpperCase()}
          </h1>
        </header>

        <PersonaForm personaId={persona.id} initialDraft={initialDraft} />
      </main>
    </>
  );
}
