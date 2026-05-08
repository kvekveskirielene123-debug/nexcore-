import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";
import { PersonasClient } from "./PersonasClient";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import type { Persona } from "@/lib/personas/types";

export const metadata = {
  title: "Personas · Nexcor",
};

export default async function PersonasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/personas");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const isSubscriber = isSubscriptionActive(
    profile?.subscription_expires_at ?? null
  );

  const { data: personas } = await supabase
    .from("personas")
    .select(
      "id, user_id, name, age, gender_pronouns, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <main className="min-h-screen bg-[#05020d] pt-8 pb-20 px-4 md:px-8">
        <header className="text-center mb-10">
          <DnaLogo size={32} className="mx-auto mb-4 opacity-70" />
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ IDENTITY ARCHIVE · 324B21
          </div>
          <h1
            className="text-[32px] md:text-[44px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            PERSONAS
          </h1>
          <p
            className="text-sm text-[#a78bfa] italic mt-3 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Different facets of you. Pick one per chat — the AI will know who
            it&apos;s talking to.
          </p>
        </header>

        <PersonasClient
          initialPersonas={(personas ?? []) as Persona[]}
          isSubscriber={isSubscriber}
        />

        <p
          className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase pt-12"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
        </p>
      </main>
    </>
  );
}
