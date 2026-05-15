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
    if ((count ?? 0) >= 5) redirect("/personas?limit=1");
  }

  return (
    <main className="min-h-screen relative px-4 md:px-6 pt-8 pb-28" style={{ background: "#05020d" }}>
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(124,58,237,0.04) 40%, transparent 70%)" }}
      />

      <header className="relative text-center mb-12 max-w-2xl mx-auto">
        {/* System label */}
        <div
          className="text-[9px] tracking-[4px] mb-4 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
        >
          ◈ IDENTITY MATRIX · SEQUENCE 324B21
        </div>

        {/* Title */}
        <h1
          className="text-[30px] sm:text-[44px] font-black tracking-[6px] uppercase mb-4 leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 0 50px rgba(0,229,255,0.12), 0 0 100px rgba(124,58,237,0.08)",
          }}
        >
          INITIALIZE<br className="sm:hidden" />{" "}
          <span style={{ color: "#00e5ff", textShadow: "0 0 40px rgba(0,229,255,0.4)" }}>
            PERSONA
          </span>
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-5">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25))" }} />
          <span className="text-[8px] tracking-[4px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.3)" }}>◈</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.25))" }} />
        </div>

        <p
          className="text-[13px] sm:text-[14px] italic leading-relaxed max-w-md mx-auto"
          style={{ fontFamily: "var(--font-body)", color: "#a78bfa" }}
        >
          Encode who you are. The more you share, the more precisely
          the AI can mirror your world back to you.
        </p>
      </header>

      <PersonaForm />
    </main>
  );
}
