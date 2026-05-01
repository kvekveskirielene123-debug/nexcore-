import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DnaLogo } from "@/components/DnaLogo";

export const metadata = {
  title: "Welcome to Brilliant · Nexcor",
};

export default async function ThankYouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be logged in to see this page
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username ?? "Sestra";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] flex items-center justify-center px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">

          {/* DNA logo with glow */}
          <div className="relative mb-8 inline-block">
            <DnaLogo
              size={64}
              className="mx-auto"
              style={{ filter: "drop-shadow(0 0 30px rgba(0,229,255,0.5))" }}
            />
            {/* Pulsing ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border: "2px solid rgba(0,229,255,0.3)",
                animationDuration: "2s",
              }}
            />
          </div>

          {/* Designation badge */}
          <div
            className="inline-block px-4 py-2 rounded-full border border-cyan-400/40 bg-cyan-400/8 mb-6"
            style={{
              boxShadow: "0 0 30px rgba(0,229,255,0.15)",
            }}
          >
            <span
              className="text-[10px] tracking-[4px] text-cyan-400 uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                textShadow: "0 0 8px rgba(0,229,255,0.5)",
              }}
            >
              ◈ BRILLIANT · DESIGNATION CONFIRMED
            </span>
          </div>

          {/* Main message */}
          <h1
            className="text-[36px] md:text-[52px] font-black tracking-[4px] text-white uppercase mb-6"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 40px rgba(0,229,255,0.2)",
            }}
          >
            WELCOME,{" "}
            <span
              style={{
                color: "#00e5ff",
                textShadow: "0 0 30px rgba(0,229,255,0.5)",
              }}
            >
              {username.toUpperCase()}
            </span>
            .
          </h1>

          {/* Personal note from Kurai & Big G */}
          <div className="rounded-2xl border border-cyan-400/20 bg-[#0c0520]/70 p-8 mb-10 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div
              className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ A NOTE FROM KURAI & BIG G · ORIG. DESIGNATION 324B21
            </div>

            <p
              className="text-[15px] text-[#e2d9f3] leading-[1.9] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We built Nexcor in the middle of the night, between bread shifts and
              sleepless design sessions, because we believed something was missing
              from the world — a place where AI characters feel truly alive, where
              the connections you build actually mean something.
            </p>

            <p
              className="text-[15px] text-[#e2d9f3] leading-[1.9] italic mt-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              You subscribing means we get to keep building it. It means late nights
              are worth it. It means Nexcor gets to grow into everything we dreamed
              it could be.
            </p>

            <p
              className="text-[15px] text-[#e2d9f3] leading-[1.9] italic mt-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Thank you.{" "}
              <span className="text-cyan-400 not-italic">Genuinely.</span> You&apos;re
              part of this now. You&apos;re sestra.
            </p>

            <div
              className="mt-6 text-[11px] tracking-[2px] text-[#7a6a9a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — Kurai &amp; Big G
              <span className="text-purple-500/40 ml-3">// the proletheans were wrong</span>
            </div>
          </div>

          {/* What's unlocked */}
          <div className="rounded-xl border border-purple-700/20 bg-[#0c0520]/50 p-6 mb-10 text-left">
            <div
              className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ YOUR BRILLIANT PERKS ARE LIVE
            </div>
            <ul className="space-y-2.5">
              {[
                "Sonnet messages: 8 ⟡ (was 10)",
                "Opus messages: 19 ⟡ (was 25)",
                "Unlimited personas — create as many as you want",
                "◈ BRILLIANT badge on your profile",
                "Priority access to new features",
              ].map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span
                    className="text-cyan-400 mt-0.5 flex-shrink-0"
                    style={{ textShadow: "0 0 6px rgba(0,229,255,0.4)" }}
                  >
                    ✓
                  </span>
                  <span
                    className="text-[13px] text-[#c0b8d8]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="px-8 py-4 rounded-lg bg-cyan-400 text-black font-black text-[11px] tracking-[4px] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ▶ START EXPLORING →
            </Link>
            <Link
              href="/personas/new"
              className="px-8 py-4 rounded-lg border border-cyan-400/40 text-[11px] tracking-[3px] text-cyan-400 hover:bg-cyan-400/8 transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ CREATE A PERSONA →
            </Link>
          </div>

          <p
            className="text-[9px] tracking-[3px] text-purple-500/20 uppercase mt-12"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SESTRA PROTOCOL ACTIVE · NEOLUTION SCIENCE DIVISION · 324B21
          </p>
        </div>
      </main>
    </>
  );
}
