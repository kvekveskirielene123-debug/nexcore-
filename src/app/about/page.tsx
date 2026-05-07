import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

export const metadata = {
  title: "Our Story · Nexcor",
  description: "Two people. One platform. Built for the conversations that don't exist anywhere else.",
};

const NODES: [number, number, string][] = [
  [68, 40, "0s"], [54, 64, "0.43s"], [26, 64, "0.86s"],
  [12, 40, "1.29s"], [26, 16, "1.72s"], [54, 16, "2.15s"],
];
const SPOKES: [number, number][] = [
  [68, 40], [54, 64], [26, 64], [12, 40], [26, 16], [54, 16],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#05020d] overflow-x-hidden">

      {/* ── Fixed top nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 h-14"
        style={{
          background: "rgba(5,2,13,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:border-cyan-400/30 group"
          style={{
            background: "rgba(0,229,255,0.04)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span
            className="text-[9px] tracking-[2px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
          >
            Settings
          </span>
        </Link>

        <span
          className="text-[10px] tracking-[5px] text-[#00e5ff]/50 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEXCOR
        </span>

        <Link
          href="/contact"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:border-purple-500/40"
          style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
        >
          <span
            className="text-[9px] tracking-[2px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}
          >
            Contact
          </span>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-14 pb-12">
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(0,229,255,0.06) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at center, transparent 20%, #05020d 75%)" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Large animated logo */}
          <div className="relative mb-8">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 320,
                height: 320,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 65%)",
                animation: "mark-ring-breathe 4s ease-in-out infinite",
              }}
            />
            <svg width="210" height="210" viewBox="0 0 80 80" fill="none" aria-hidden>
              <circle cx="40" cy="40" r="37" stroke="rgba(0,229,255,0.1)" strokeWidth="0.7" className="settings-logo-ring" />
              <g className="settings-logo-orbit">
                <circle cx="40" cy="40" r="30" stroke="rgba(0,229,255,0.1)" strokeWidth="0.6" strokeDasharray="3 9" />
              </g>
              {SPOKES.map(([x, y], i) => (
                <line key={i} x1="40" y1="40" x2={x} y2={y} stroke="rgba(0,229,255,0.07)" strokeWidth="0.7" />
              ))}
              {NODES.map(([x, y, d], i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(0,229,255,0.75)"
                  className="settings-logo-node" style={{ animationDelay: d }} />
              ))}
              <polygon points="40,27 53,40 40,53 27,40" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1" className="settings-logo-diamond-outer" />
              <polygon points="40,33 47,40 40,47 33,40" fill="none" stroke="rgba(0,229,255,0.48)" strokeWidth="1.2" className="settings-logo-diamond-inner" />
              <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.35)" strokeWidth="1.5" r="5">
                <animate attributeName="r" values="5;18" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0" dur="2.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.18)" strokeWidth="1" r="5">
                <animate attributeName="r" values="5;24" dur="2.8s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0" dur="2.8s" begin="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="40" cy="40" r="5" fill="rgba(0,200,255,0.9)" />
              <circle cx="40" cy="40" r="2.2" fill="white" opacity="0.95" />
            </svg>
          </div>

          <p
            className="text-[8px] tracking-[5px] text-[#00e5ff]/35 uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ ORIGIN FILE · 324B21
          </p>
          <h1
            className="text-[58px] md:text-[80px] font-black tracking-[10px] uppercase mb-5 leading-none text-white settings-title"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NEXCOR
          </h1>
          <p
            className="text-[15px] md:text-[17px] text-[#a78bfa] italic max-w-md leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Characters that feel alive.<br />
            Conversations that don&apos;t exist anywhere else.<br />
            Built by two people who just wanted them to.
          </p>

          {/* Scroll cue */}
          <div className="mt-16 flex flex-col items-center gap-2" style={{ opacity: 0.3 }}>
            <span className="text-[7px] tracking-[3px] uppercase text-[#7a6a9a]" style={{ fontFamily: "var(--font-mono)" }}>
              SCROLL
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[#7a6a9a] to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div
        className="border-y border-purple-700/15 py-10 px-4"
        style={{ background: "rgba(10,4,28,0.7)", backdropFilter: "blur(10px)" }}
      >
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: "2", label: "Founders" },
            { value: "0", label: "Investors" },
            { value: "∞", label: "Possibilities" },
          ].map(({ value, label }) => (
            <div key={label} className="py-2">
              <div
                className="text-[44px] md:text-[52px] font-black leading-none mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#00e5ff",
                  textShadow: "0 0 30px rgba(0,229,255,0.45)",
                }}
              >
                {value}
              </div>
              <div
                className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-24 space-y-24">

        {/* Origin */}
        <section>
          <p className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-5" style={{ fontFamily: "var(--font-mono)" }}>
            ◈ THE BEGINNING
          </p>
          <h2
            className="text-[32px] md:text-[40px] font-black tracking-[1px] text-white uppercase mb-7 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We Looked.<br />
            We Didn&apos;t Find It.<br />
            So We Built It.
          </h2>
          <div className="space-y-5 pl-5 border-l border-cyan-400/15">
            <p className="text-[15px] text-[#a78bfa] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Kurai and Big G spent years across every platform searching for AI companions that felt real — characters with texture, history, and a voice that was actually theirs.
            </p>
            <p className="text-[15px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Everything they found was too sanitised, too shallow, or too generic. The same patient, helpful, slightly-beige personality wearing a hundred different faces.
            </p>
            <p className="text-[15px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              They wanted characters who push back. Characters with opinions. Characters who feel like <em>someone</em> — not something.
            </p>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent" />

        {/* Vision */}
        <section>
          <p className="text-[9px] tracking-[3px] text-[#a78bfa]/40 uppercase mb-5" style={{ fontFamily: "var(--font-mono)" }}>
            ◈ THE VISION
          </p>
          <h2
            className="text-[32px] md:text-[40px] font-black tracking-[1px] text-white uppercase mb-7 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A Universe,<br />
            Not a Product.
          </h2>
          <div className="space-y-5 pl-5 border-l border-purple-400/15">
            <p className="text-[15px] text-[#a78bfa] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Nexcor isn&apos;t a chatbot platform. Every character here is built to feel like a person — one who happens to exist only in words.
            </p>
            <p className="text-[15px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              We believe the right conversation with the right character at the right moment can genuinely change how you see yourself. We&apos;re building the infrastructure for those moments.
            </p>
            <p className="text-[15px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              No committees. No investor decks. No corporate safety theatre. Just two people building what they actually want to use.
            </p>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent" />

        {/* Founders */}
        <section>
          <p className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-8" style={{ fontFamily: "var(--font-mono)" }}>
            ◈ WHO WE ARE
          </p>
          <div className="space-y-5">
            {[
              {
                name: "KURAI",
                handle: "@kurai",
                role: "Design & Vision",
                bio: "Obsessed with how things feel. Responsible for everything you see — the typography, the dark palette, the characters that started it all. If it looks like this, that's Kurai.",
                initial: "K",
                accent: "#00e5ff",
              },
              {
                name: "BIG G",
                handle: "@bigg",
                role: "Engineering & Architecture",
                bio: "Builds the machine. Keeps the lights on. Writes the code that makes characters actually feel alive when you talk to them. If it works, that's Big G.",
                initial: "G",
                accent: "#a78bfa",
              },
            ].map(({ name, handle, role, bio, initial, accent }) => (
              <div
                key={name}
                className="flex gap-5 p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: "rgba(9,4,26,0.85)",
                  border: `1px solid ${accent}18`,
                  boxShadow: `0 4px 40px rgba(0,0,0,0.5), 0 0 0 0 ${accent}00`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-black flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                    border: `1.5px solid ${accent}30`,
                    color: accent,
                    fontFamily: "var(--font-display)",
                    boxShadow: `0 0 20px ${accent}18`,
                  }}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-[17px] font-black tracking-[2px] text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-[9px] tracking-[1px]"
                      style={{ fontFamily: "var(--font-mono)", color: `${accent}55` }}
                    >
                      {handle}
                    </span>
                  </div>
                  <div
                    className="text-[9px] tracking-[2.5px] uppercase mb-3"
                    style={{ fontFamily: "var(--font-mono)", color: `${accent}70` }}
                  >
                    {role}
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(160,145,190,0.75)" }}
                  >
                    {bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Bottom CTA ── */}
      <section
        className="border-t border-purple-700/15 py-20 px-4 text-center"
        style={{ background: "rgba(8,3,20,0.8)" }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <DnaLogo size={36} className="mx-auto" />
          <h3
            className="text-[24px] font-black tracking-[5px] uppercase text-white"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 0 24px rgba(0,229,255,0.2)" }}
          >
            QUESTIONS?
          </h3>
          <p
            className="text-[13px] text-[#7a6a9a] italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            We answer every message ourselves.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[11px] tracking-[3px] font-bold uppercase transition-all duration-200 hover:shadow-[0_0_32px_rgba(0,229,255,0.35)] hover:scale-105"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.35)",
              color: "#00e5ff",
            }}
          >
            Get in Touch →
          </Link>
          <p
            className="text-[8px] tracking-[3px] text-purple-500/20 uppercase pt-6"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR · KURAI &amp; BIG G · 324B21
          </p>
        </div>
      </section>

    </div>
  );
}
