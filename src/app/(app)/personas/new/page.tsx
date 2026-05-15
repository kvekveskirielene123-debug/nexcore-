import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PersonaForm } from "@/components/personas/PersonaForm";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const metadata = {
  title: "New Persona · Nexcor",
};

/** Rotating hexagonal reticle — unique to the create-persona page */
function HexCoreLogo({ size = 110 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      {/* ── Ambient radial glow behind everything ── */}
      <defs>
        <radialGradient id="hcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,229,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,229,255,0)" />
        </radialGradient>
        <radialGradient id="hcGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.1)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#hcGlow)" />

      {/* ── Outer rotating hexagon ring + 6 vertex diamonds ── */}
      <g className="pf-outer-ring">
        {/* Hexagon: vertices at radius 44 */}
        <polygon
          points="94,50 72,88.1 28,88.1 6,50 28,11.9 72,11.9"
          stroke="rgba(0,229,255,0.28)"
          strokeWidth="1"
          fill="none"
        />
        {/* 6 small diamonds at vertices */}
        <polygon points="94,50 97,50 94,53 91,50 94,47" fill="rgba(0,229,255,0.9)" className="pf-node-1" />
        <polygon points="72,88 75,89 72,92 69,89 72,86" fill="rgba(167,139,250,0.9)" className="pf-node-2" />
        <polygon points="28,88 31,89 28,92 25,89 28,86" fill="rgba(0,229,255,0.9)" className="pf-node-3" />
        <polygon points="6,50 9,50 6,53 3,50 6,47" fill="rgba(167,139,250,0.9)" className="pf-node-4" />
        <polygon points="28,12 31,11 28,8 25,11 28,14" fill="rgba(0,229,255,0.9)" className="pf-node-5" />
        <polygon points="72,12 75,11 72,8 69,11 72,14" fill="rgba(167,139,250,0.9)" className="pf-node-6" />
      </g>

      {/* ── Static rings ── */}
      <circle cx="50" cy="50" r="33" stroke="rgba(0,229,255,0.055)" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="22" stroke="rgba(167,139,250,0.07)" strokeWidth="0.8" />

      {/* ── Inner counter-rotating hexagon (smaller) ── */}
      <g className="pf-inner-hex">
        {/* radius 18 */}
        <polygon
          points="68,50 59,65.6 41,65.6 32,50 41,34.4 59,34.4"
          stroke="rgba(167,139,250,0.22)"
          strokeWidth="0.9"
          fill="rgba(167,139,250,0.015)"
        />
      </g>

      {/* ── Rotating scan arm ── */}
      <g className="pf-scan-arm">
        {/* Glow trail (wide, faint) */}
        <line x1="50" y1="50" x2="50" y2="7"
          stroke="rgba(0,229,255,0.04)" strokeWidth="14" strokeLinecap="butt" />
        <line x1="50" y1="50" x2="50" y2="7"
          stroke="rgba(0,229,255,0.09)" strokeWidth="6" strokeLinecap="butt"
          transform="rotate(-8 50 50)" />
        {/* Arm line */}
        <line x1="50" y1="50" x2="50" y2="7"
          stroke="rgba(0,229,255,0.75)" strokeWidth="1.2" strokeLinecap="round" />
        {/* Tip dot */}
        <circle cx="50" cy="9" r="2.4"
          fill="rgba(0,229,255,0.95)"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,229,255,1))" }} />
      </g>

      {/* ── Expanding SMIL rings ── */}
      <circle cx="50" cy="50" fill="none" stroke="rgba(0,229,255,0.45)" strokeWidth="1.4" r="5">
        <animate attributeName="r" values="5;44" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="1" r="5">
        <animate attributeName="r" values="5;44" dur="3.2s" begin="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0" dur="3.2s" begin="1.6s" repeatCount="indefinite" />
      </circle>

      {/* ── Cardinal crosshair ticks ── */}
      <line x1="44" y1="50" x2="40" y2="50" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="56" y1="50" x2="60" y2="50" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="44" x2="50" y2="40" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="56" x2="50" y2="60" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Pulsing center core ── */}
      <circle cx="50" cy="50" r="4.5" fill="#00e5ff"
        style={{ filter: "drop-shadow(0 0 6px rgba(0,229,255,0.9))" }}>
        <animate attributeName="r" values="4.5;6.5;4.5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* ── Purple inner glow ── */}
      <circle cx="50" cy="50" r="46" fill="url(#hcGlow2)" />
    </svg>
  );
}

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
    if ((count ?? 0) >= 1) redirect("/personas?limit=1");
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#020009" }}
    >
      {/* ── Dot-grid background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,229,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 100% 60% at 50% 0%, black 20%, transparent 100%)",
        }}
      />

      {/* ── Large faint hex watermark behind header ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          opacity: 0.025,
        }}
      >
        <svg viewBox="0 0 100 100" width="600" height="600" fill="none">
          <polygon
            points="94,50 72,88.1 28,88.1 6,50 28,11.9 72,11.9"
            stroke="#00e5ff"
            strokeWidth="0.6"
          />
          <polygon
            points="82,50 66,78 34,78 18,50 34,22 66,22"
            stroke="#00e5ff"
            strokeWidth="0.4"
          />
          <polygon
            points="68,50 59,65.6 41,65.6 32,50 41,34.4 59,34.4"
            stroke="#a78bfa"
            strokeWidth="0.4"
          />
        </svg>
      </div>

      {/* ── Top cyan radial glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "460px",
          background:
            "radial-gradient(ellipse, rgba(0,229,255,0.09) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)",
        }}
      />

      {/* ── Accent glow top-right ── */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "350px",
          height: "350px",
          background:
            "radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 65%)",
        }}
      />

      {/* ── Purple bottom glow ── */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 65%)",
        }}
      />

      {/* ── Page content ── */}
      <div className="relative z-10 px-4 md:px-6 pt-8 pb-32">
        {/* ── HEADER ── */}
        <header className="text-center mb-12 max-w-2xl mx-auto">

          {/* System chip */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
            style={{
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.12)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00e5ff",
                boxShadow: "0 0 6px rgba(0,229,255,0.9)",
              }}
            />
            <span
              className="text-[8px] tracking-[4px] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(0,229,255,0.6)",
              }}
            >
              IDENTITY CONSTRUCT · SYS-324B21
            </span>
          </div>

          {/* HexCore logo */}
          <div className="flex justify-center mb-6">
            <HexCoreLogo size={120} />
          </div>

          {/* Title block */}
          <div className="mb-5">
            <div
              className="text-[11px] tracking-[6px] uppercase mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(167,139,250,0.45)",
              }}
            >
              ◈ NEW
            </div>
            <h1
              className="font-black uppercase leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 12vw, 88px)",
                letterSpacing: "-0.01em",
                color: "#ffffff",
                textShadow:
                  "0 0 80px rgba(0,229,255,0.15), 0 0 160px rgba(124,58,237,0.08)",
              }}
            >
              <span
                style={{
                  color: "#00e5ff",
                  textShadow:
                    "0 0 50px rgba(0,229,255,0.55), 0 0 100px rgba(0,229,255,0.25)",
                }}
              >
                PERSONA
              </span>
            </h1>
            <div
              className="text-[10px] tracking-[6px] uppercase mt-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(167,139,250,0.35)",
              }}
            >
              SEQUENCE INITIALIZING ▸
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 justify-center mb-5">
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(0,229,255,0.3))",
              }}
            />
            <span
              className="text-[9px] tracking-[4px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(0,229,255,0.35)",
              }}
            >
              ◈ ◈ ◈
            </span>
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(0,229,255,0.3))",
              }}
            />
          </div>

          <p
            className="text-[13px] sm:text-[14px] italic leading-relaxed max-w-md mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(167,139,250,0.65)",
            }}
          >
            Encode who you are. The more you share, the more precisely
            the AI can mirror your world back to you.
          </p>
        </header>

        <PersonaForm />
      </div>
    </main>
  );
}
