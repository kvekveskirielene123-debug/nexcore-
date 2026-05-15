import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PersonaForm } from "@/components/personas/PersonaForm";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { DnaLogo } from "@/components/DnaLogo";

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
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: "#04010a" }}>

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.022) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,229,255,0.022) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Cyan top glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "1000px",
          height: "520px",
          background:
            "radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, rgba(124,58,237,0.05) 35%, transparent 70%)",
        }}
      />

      {/* ── Purple bottom glow ── */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: "640px",
          height: "640px",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 65%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 px-4 md:px-6 pt-10 pb-32">

        {/* ── Epic Header ── */}
        <header className="text-center mb-14 max-w-2xl mx-auto">

          {/* DnaLogo with pulsing rings */}
          <div
            className="relative mx-auto flex items-center justify-center mb-7"
            style={{ width: 80, height: 80 }}
          >
            <div
              className="nx-persona-ring-1 absolute inset-0 rounded-full"
              style={{ border: "1.5px solid rgba(0,229,255,0.22)" }}
            />
            <div
              className="nx-persona-ring-2 absolute inset-0 rounded-full"
              style={{ border: "1.5px solid rgba(0,229,255,0.15)" }}
            />
            <div
              className="nx-persona-ring-3 absolute inset-0 rounded-full"
              style={{ border: "1.5px solid rgba(0,229,255,0.08)" }}
            />
            <DnaLogo
              size={42}
              style={{ filter: "drop-shadow(0 0 22px rgba(0,229,255,0.65))" }}
            />
          </div>

          {/* System label */}
          <div
            className="text-[8px] tracking-[5px] uppercase mb-5"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
          >
            ◈ IDENTITY SYNTHESIS PROTOCOL · SEQUENCE 324B21
          </div>

          {/* Main title */}
          <h1
            className="text-[40px] sm:text-[68px] font-black uppercase leading-none mb-6"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.06em",
              color: "#ffffff",
              textShadow:
                "0 0 80px rgba(0,229,255,0.15), 0 0 160px rgba(124,58,237,0.1)",
            }}
          >
            INITIALIZE{" "}
            <span
              className="nx-encoded block sm:inline"
              style={{
                color: "#00e5ff",
                textShadow:
                  "0 0 50px rgba(0,229,255,0.6), 0 0 100px rgba(0,229,255,0.28)",
              }}
            >
              PERSONA
            </span>
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-4 justify-center mb-6">
            <div
              className="h-px flex-1 max-w-[100px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(0,229,255,0.35))",
              }}
            />
            <span
              className="text-[10px] tracking-[5px]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
            >
              ◈◈◈
            </span>
            <div
              className="h-px flex-1 max-w-[100px]"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(0,229,255,0.35))",
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            className="text-[13px] sm:text-[15px] italic leading-relaxed max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.75)" }}
          >
            Encode who you are. The more you share, the more precisely the AI
            can mirror your world back to you.
          </p>
        </header>

        <PersonaForm />
      </div>
    </main>
  );
}
