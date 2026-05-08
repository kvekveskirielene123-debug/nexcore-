import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PersonaForm } from "@/components/personas/PersonaForm";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const metadata = {
  title: "New Persona · Nexcor",
};

export default async function NewPersonaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/personas/new");

  // Server-side gate: free users capped at 5 personas
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const isSub = isSubscriptionActive(profile?.subscription_expires_at ?? null);

  if (!isSub) {
    const { count } = await supabase
      .from("personas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) >= 5) {
      redirect("/personas?limit=1");
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#05020d] pt-8 pb-20 px-4 md:px-8">
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ NEW PERSONA · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            CREATE PERSONA
          </h1>
          <p
            className="text-[13px] text-[#a78bfa] italic mt-3 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tell the AI who <em>you</em> are. The more you share, the more it
            can show up for you.
          </p>
        </header>

        <PersonaForm />
      </main>
    </>
  );
}
