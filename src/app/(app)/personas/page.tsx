import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PersonasClient } from "./PersonasClient";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import type { Persona } from "@/lib/personas/types";

export const metadata = {
  title: "Personas · Nexcor",
};

export default async function PersonasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/personas");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const isSubscriber = isSubscriptionActive(profile?.subscription_expires_at ?? null);

  const { data: personas } = await supabase
    .from("personas")
    .select("id, user_id, name, age, gender_pronouns, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#05020d] pb-20">
      <PersonasClient
        initialPersonas={(personas ?? []) as Persona[]}
        isSubscriber={isSubscriber}
      />
    </main>
  );
}
