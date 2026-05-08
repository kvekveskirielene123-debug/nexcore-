import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

export const metadata = {
  title: "Welcome to Brilliant · Nexcor",
};

const PERKS = [
  { label: "Sonnet messages",   value: "8 ⟡  (was 10)",   note: "-20%",      color: "167,139,250" },
  { label: "Opus messages",     value: "19 ⟡  (was 25)",  note: "-24%",      color: "0,229,255"   },
  { label: "Personas",          value: "Unlimited",        note: "no cap",    color: "124,58,237"  },
  { label: "Brilliant badge",   value: "◈ ACTIVE",         note: "profile",   color: "0,229,255"   },
  { label: "Early features",    value: "First access",     note: "always",    color: "167,139,250" },
] as const;

export default async function ThankYouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username ?? "Sestra";

  return (
    <>
    <main className="min-h-screen bg-[#05020d] flex items-center justify-center px-4 py-24">

      {/* ── Full-screen ambient glow ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(124,58,237,0.1) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto w-full text-center">

        {/* ── Logo with celebration rings ── */}
        <div className="relative inline-block mb-8">
          {/* Outer pulsing rings */}
          {[0, 400, 800].map((delay, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-ping"
              style={{
                inset: -(i + 1) * 14,
                border: `1px solid rgba(${i === 1 ? "0,229,255" : "124,58,237"},${0.3 - i * 0.08})`,
                animationDuration: "2.5s",
                animationDelay: `${delay}ms`,
              }}
            />
          ))}

          <DnaLogo
            size={72}
            className="mx-auto relative z-10"
            style={{
              filter: "drop-shadow(0 0 30px rgba(0,229,255,0.7)) drop-shadow(0 0 60px rgba(124,58,237,0.4))",
            }}
          />
        </div>

        {/* ── Designation badge ── */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
          style={{
            border: "1px solid rgba(0,229,255,0.4)",
            background: "rgba(0,229,255,0.06)",
            boxShadow: "0 0 30px rgba(0,229,255,0.12)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.8)" }}
          />
          <span
            className="text-[9px] tracking-[4px] text-cyan-400 uppercase"
            style={{ fontFamily: "var(--font-mono)", textShadow: "0 0 8px rgba(0,229,255,0.5)" }}
          >
            ◈ BRILLIANT · DESIGNATION CONFIRMED
          </span>
        </div>

        {/* ── Welcome headline ── */}
        <h1
          className="text-[38px] md:text-[56px] font-black tracking-[4px] text-white uppercase mb-8"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 0 50px rgba(0,229,255,0.2)",
          }}
        >
          WELCOME,{" "}
          <span
            style={{
              color: "#00e5ff",
              textShadow: "0 0 40px rgba(0,229,255,0.6)",
            }}
          >
            {username.toUpperCase()}
          </span>
          .
        </h1>

        {/* ── Perks unlocked card ── */}
        <div
          className="rounded-2xl overflow-hidden mb-8 text-left"
          style={{
            border: "1px solid rgba(0,229,255,0.2)",
            background: "rgba(8,4,26,0.9)",
            boxShadow: "0 0 40px rgba(0,229,255,0.06)",
          }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

          <div className="px-6 py-4 border-b border-white/[0.04]">
            <span
              className="text-[9px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
            >
              ◈ YOUR BRILLIANT PERKS ARE LIVE
            </span>
          </div>

          <div className="px-6 py-3">
            {PERKS.map(({ label, value, note, color }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-cyan-400 text-sm flex-shrink-0"
                    style={{ textShadow: "0 0 8px rgba(0,229,255,0.5)" }}
                  >
                    ✓
                  </span>
                  <span
                    className="text-[12px]"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.8)" }}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.9)` }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[8px] tracking-[1.5px] px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `rgba(${color},0.6)`,
                      background: `rgba(${color},0.08)`,
                    }}
                  >
                    {note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personal note ── */}
        <div
          className="rounded-2xl relative overflow-hidden mb-10 text-left"
          style={{
            border: "1px solid rgba(124,58,237,0.2)",
            background: "rgba(8,4,26,0.8)",
          }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="px-6 py-5">
            <div
              className="text-[9px] tracking-[3px] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.4)" }}
            >
              ◈ A NOTE FROM KURAI & BIG G · ORIG. DESIGNATION 324B21
            </div>

            <p
              className="text-[14px] leading-[1.9] italic text-[#e2d9f3]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We built Nexcor in the middle of the night, between bread shifts and
              sleepless design sessions, because we believed something was missing —
              a place where AI characters feel truly alive, where the connections you
              build actually mean something.
            </p>

            <p
              className="text-[14px] leading-[1.9] italic text-[#e2d9f3] mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              You subscribing means we get to keep building it. It means late nights
              are worth it. It means Nexcor gets to grow into everything we dreamed
              it could be.
            </p>

            <p
              className="text-[14px] leading-[1.9] italic text-[#e2d9f3] mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Thank you.{" "}
              <span className="text-cyan-400 not-italic">Genuinely.</span>{" "}
              You&apos;re part of this now. You&apos;re sestra.
            </p>

            <div
              className="mt-5 text-[10px] tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
            >
              — Kurai &amp; Big G{" "}
              <span style={{ color: "rgba(124,58,237,0.3)" }}>// the proletheans were wrong</span>
            </div>
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/explore"
            className="px-8 py-4 rounded-xl font-black text-[11px] tracking-[4px] transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.55)] hover:scale-105 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "#00e5ff",
              color: "#000",
              boxShadow: "0 0 24px rgba(0,229,255,0.3)",
            }}
          >
            ▶ START EXPLORING →
          </Link>
          <Link
            href="/personas/new"
            className="px-8 py-4 rounded-xl text-[11px] tracking-[3px] transition-all hover:bg-cyan-400/8 hover:scale-105 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(0,229,255,0.35)",
              color: "#00e5ff",
            }}
          >
            ◈ CREATE A PERSONA →
          </Link>
        </div>

        <p
          className="text-[9px] tracking-[3px] text-purple-500/20 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SESTRA PROTOCOL ACTIVE · NEOLUTION SCIENCE DIVISION · 324B21
        </p>
      </div>
    </main>
    </>
  );
}
