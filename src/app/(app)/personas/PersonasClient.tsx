"use client";

import { useState } from "react";
import Link from "next/link";
import { PersonaCard } from "@/components/personas/PersonaCard";
import type { Persona } from "@/lib/personas/types";

interface PersonasClientProps {
  initialPersonas: Persona[];
  isSubscriber: boolean;
}

function PersonasLogo() {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <div
        className="absolute rounded-full pointer-events-none ps-breathe"
        style={{
          inset: -24,
          background: "radial-gradient(circle,rgba(167,139,250,0.16) 0%,rgba(167,139,250,0.04) 45%,transparent 70%)",
        }}
      />
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden>
        {/* Outer orbital ring + 4 nodes */}
        <g className="ps-orbit">
          <circle cx="50" cy="50" r="46" stroke="rgba(167,139,250,0.2)" strokeWidth="1" strokeDasharray="5 9"/>
          <circle cx="50" cy="4"  r="2.5" fill="#a78bfa" className="ps-node"/>
          <circle cx="96" cy="50" r="2.5" fill="#00e5ff" className="ps-node" style={{ animationDelay: ".7s" }}/>
          <circle cx="50" cy="96" r="2.5" fill="#a78bfa" className="ps-node" style={{ animationDelay: "1.4s" }}/>
          <circle cx="4"  cy="50" r="2.5" fill="#00e5ff" className="ps-node" style={{ animationDelay: "2.1s" }}/>
        </g>
        {/* Concentric rings */}
        <circle cx="50" cy="50" r="35" stroke="rgba(167,139,250,0.08)" strokeWidth="0.8"/>
        <circle cx="50" cy="50" r="23" stroke="rgba(167,139,250,0.11)" strokeWidth="0.8"/>
        <circle cx="50" cy="50" r="13" stroke="rgba(167,139,250,0.15)" strokeWidth="0.8"/>
        {/* Cardinal spokes */}
        <line x1="50" y1="4"  x2="50" y2="37"  stroke="rgba(167,139,250,0.1)" strokeWidth="0.8"/>
        <line x1="96" y1="50" x2="63" y2="50"  stroke="rgba(167,139,250,0.1)" strokeWidth="0.8"/>
        <line x1="50" y1="96" x2="50" y2="63"  stroke="rgba(167,139,250,0.1)" strokeWidth="0.8"/>
        <line x1="4"  y1="50" x2="37" y2="50"  stroke="rgba(167,139,250,0.1)" strokeWidth="0.8"/>
        {/* Sweep arm */}
        <g className="ps-sweep">
          <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(167,139,250,0.04)" strokeWidth="20" strokeLinecap="butt" transform="rotate(-42 50 50)"/>
          <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(167,139,250,0.08)" strokeWidth="12" strokeLinecap="butt" transform="rotate(-26 50 50)"/>
          <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(167,139,250,0.14)" strokeWidth="6"  strokeLinecap="butt" transform="rotate(-13 50 50)"/>
          <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="50" cy="7" r="2.2" fill="rgba(167,139,250,0.95)" style={{ filter: "drop-shadow(0 0 5px rgba(167,139,250,1))" }}/>
        </g>
        {/* Ping dots */}
        <circle cx="71" cy="22" r="1.8" fill="#a78bfa" className="ps-ping"/>
        <circle cx="76" cy="64" r="1.5" fill="#00e5ff" className="ps-ping" style={{ animationDelay: "1.1s" }}/>
        <circle cx="18" cy="40" r="1.6" fill="#a78bfa" className="ps-ping" style={{ animationDelay: "2.0s" }}/>
        <circle cx="38" cy="78" r="1.4" fill="#00e5ff" className="ps-ping" style={{ animationDelay: "0.6s" }}/>
        <circle cx="28" cy="27" r="1.3" fill="#a78bfa" className="ps-ping" style={{ animationDelay: "1.7s" }}/>
        {/* Expanding ripples */}
        <circle cx="50" cy="50" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" r="5">
          <animate attributeName="r" values="5;44" dur="3.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".5;0" dur="3.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="1" r="5">
          <animate attributeName="r" values="5;44" dur="3.2s" begin="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".22;0" dur="3.2s" begin="1.6s" repeatCount="indefinite"/>
        </circle>
        {/* Center crosshair ticks */}
        <line x1="46" y1="50" x2="42" y2="50" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="54" y1="50" x2="58" y2="50" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="50" y1="46" x2="50" y2="42" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="50" y1="54" x2="50" y2="58" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Center: profile icon (head + shoulders) */}
        <circle cx="50" cy="46" r="5.5" fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.85)" strokeWidth="1.4"/>
        <circle cx="50" cy="46" r="2.2" fill="rgba(167,139,250,0.75)"/>
        <path d="M41 58 C41 53 45.5 51 50 51 C54.5 51 59 53 59 58"
              stroke="rgba(167,139,250,0.85)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function PersonasClient({ initialPersonas, isSubscriber }: PersonasClientProps) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const canCreate = isSubscriber || personas.length < 1;

  return (
    <>
      <div className="min-h-screen bg-[#05020d]">

        {/* ── Page header ── */}
        <div className="relative pt-6 pb-4 px-4 md:px-8">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{ backgroundImage: "linear-gradient(rgba(167,139,250,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 90% at 50% -10%,rgba(167,139,250,.07) 0%,transparent 65%)" }}
          />

          <div className="flex flex-col items-center mb-5">
            {/* Logo */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <PersonasLogo />
            </div>

            {/* Label */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(167,139,250,.4))" }} />
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }} />
                <span className="text-[8px] tracking-[5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,.4)" }}>
                  IDENTITY ARCHIVE · 324B21
                </span>
              </div>
              <div className="w-8 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(167,139,250,.4))" }} />
            </div>

            {/* Title */}
            <h1
              className="font-black tracking-[6px] uppercase mb-1"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,42px)", color: "#fff" }}
            >
              {"PERSONAS".split("").map((letter, i) => (
                <span key={i} className="ps-title-letter" style={{ animationDelay: `${i * 0.1}s` }}>
                  {letter}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              className="text-[13px] italic text-center max-w-sm leading-relaxed mt-1"
              style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,.6)" }}
            >
              Different facets of you. Tell the AI who it&apos;s really talking to.
            </p>

            {/* Tier info */}
            <div className="flex items-center gap-2 mt-4">
              <span
                className="px-3 py-1 rounded-full text-[9px] tracking-[2px] uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: isSubscriber ? "rgba(167,139,250,0.1)" : "rgba(0,229,255,0.06)",
                  border: `1px solid ${isSubscriber ? "rgba(167,139,250,0.3)" : "rgba(0,229,255,0.2)"}`,
                  color: isSubscriber ? "#a78bfa" : "#00e5ff",
                }}
              >
                {isSubscriber ? "◈ BRILLIANT · UNLIMITED" : `${personas.length} / 5 · FREE TIER`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div
          className="sticky top-14 z-30 flex items-center justify-between px-4 md:px-8 py-3"
          style={{
            background: "rgba(5,2,13,.95)",
            borderBottom: "1px solid rgba(124,58,237,.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          <span
            className="text-[10px] tracking-[2.5px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.5)" }}
          >
            {personas.length} persona{personas.length !== 1 ? "s" : ""}
          </span>

          {canCreate ? (
            <Link
              href="/personas/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "2.5px",
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.4)",
                color: "#a78bfa",
                boxShadow: "0 0 18px rgba(167,139,250,0.12)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.2)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(167,139,250,0.25)";
                (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(167,139,250,0.12)";
                (e.currentTarget as HTMLElement).style.color = "#a78bfa";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              + NEW PERSONA
            </Link>
          ) : (
            <Link
              href="/subscribe"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] tracking-[2px] font-bold transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.25)",
                color: "rgba(251,191,36,0.8)",
              }}
            >
              ◈ BRILLIANT FOR UNLIMITED →
            </Link>
          )}
        </div>

        {/* ── Content ── */}
        <div className="px-4 md:px-8 pt-8 pb-24">

          {personas.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "rgba(167,139,250,0.06)",
                  border: "1px solid rgba(167,139,250,0.2)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M5 21c0-4 3.13-7 7-7s7 3 7 7"/>
                </svg>
              </div>
              <div
                className="text-[9px] tracking-[4px] uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,.35)" }}
              >
                ◈ NO IDENTITIES ON RECORD
              </div>
              <p
                className="text-[14px] italic mb-8 max-w-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,.55)" }}
              >
                A persona tells the AI who <em>you</em> are — your name, age, tone, the things that make you distinctly you. Pick one per chat.
              </p>
              <Link
                href="/personas/new"
                className="px-7 py-3 rounded-xl font-bold text-[11px] tracking-[3px] uppercase transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(167,139,250,0.14)",
                  border: "1px solid rgba(167,139,250,0.4)",
                  color: "#a78bfa",
                  boxShadow: "0 0 24px rgba(167,139,250,0.15)",
                }}
              >
                ◈ CREATE FIRST PERSONA →
              </Link>
            </div>

          ) : (
            /* Persona grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {personas.map((p) => (
                <PersonaCard
                  key={p.id}
                  persona={p}
                  onDeleted={(id) => setPersonas((arr) => arr.filter((x) => x.id !== id))}
                />
              ))}

              {/* Create new card */}
              {canCreate && (
                <Link
                  href="/personas/new"
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 transition-all group min-h-[140px]"
                  style={{ borderColor: "rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.02)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.05)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.2)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.02)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                      <line x1="6" y1="2" x2="6" y2="10" stroke="rgba(167,139,250,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="2" y1="6" x2="10" y2="6" stroke="rgba(167,139,250,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span
                    className="text-[10px] tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.4)" }}
                  >
                    NEW PERSONA
                  </span>
                </Link>
              )}
            </div>
          )}

          {!isSubscriber && personas.length >= 1 && (
            <div
              className="mt-10 max-w-md mx-auto rounded-xl p-5 text-center"
              style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.18)" }}
            >
              <p className="text-[13px] italic mb-3" style={{ fontFamily: "var(--font-body)", color: "rgba(251,191,36,0.7)" }}>
                ◈ Nexcor Brilliant gives you <strong style={{ color: "rgba(251,191,36,0.9)" }}>unlimited</strong> personas.
              </p>
              <Link
                href="/subscribe"
                className="text-[9px] tracking-[2px] uppercase hover:opacity-100 transition-opacity"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(251,191,36,0.55)" }}
              >
                VIEW PLANS →
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes psOrbit   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes psSweep   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes psNode    { 0%,100% { opacity:.35; } 50% { opacity:1; } }
        @keyframes psPing    { 0%,100% { opacity:.15; transform:scale(1); } 50% { opacity:1; transform:scale(1.6); } }
        @keyframes psBreathe { 0%,100% { transform:scale(1); opacity:.55; } 50% { transform:scale(1.08); opacity:1; } }
        @keyframes psTitleIn { from { opacity:0; transform:translateY(12px) scaleY(0.85); } to { opacity:1; transform:translateY(0) scaleY(1); } }
        @keyframes psTitleGlow { 0%,100% { text-shadow:0 0 30px rgba(167,139,250,.15); } 50% { text-shadow:0 0 50px rgba(167,139,250,.65),0 0 20px rgba(167,139,250,.4); } }
        .ps-orbit       { animation: psOrbit   44s linear      infinite; transform-origin: 50px 50px; }
        .ps-sweep       { animation: psSweep   5.5s linear     infinite; transform-origin: 50px 50px; }
        .ps-node        { animation: psNode    2.8s ease-in-out infinite; }
        .ps-ping        { animation: psPing    3.2s ease-in-out infinite; }
        .ps-breathe     { animation: psBreathe 4s   ease-in-out infinite; }
        .ps-title-letter { animation: psTitleIn 0.5s cubic-bezier(0.16,1,0.3,1) both, psTitleGlow 2.8s ease-in-out infinite; }
      `}</style>
    </>
  );
}
