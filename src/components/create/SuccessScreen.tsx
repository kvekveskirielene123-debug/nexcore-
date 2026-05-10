"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SuccessScreenProps {
  characterId: string;
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string;
}

function formatDesignation(id: string, name: string): string {
  const slug   = id.replace(/-/g, "").slice(-4).toUpperCase();
  const letter = (name.charAt(0) || "X").toUpperCase();
  return `SUBJECT #${slug}-${letter}`;
}

export function SuccessScreen({
  characterId,
  characterName,
  characterAvatarUrl,
  greeting,
}: SuccessScreenProps) {
  const [phase,         setPhase]         = useState(0);   // 0=logo, 1=typewrite, 2=content
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "SUBJECT SYNTHESIZED";

  // Sequence: logo 800ms → typewriter → show content
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase < 1) return;
    let i = 0;
    const tick = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) { clearInterval(tick); setTimeout(() => setPhase(2), 300); }
    }, 38);
    return () => clearInterval(tick);
  }, [phase]);

  const designation = formatDesignation(characterId, characterName);

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* ── Background ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.016,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%,rgba(0,229,255,0.1) 0%,rgba(167,139,250,0.06) 45%,transparent 70%)" }}
      />

      {/* Scan sweep */}
      <div
        className="fixed left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(to right,transparent,rgba(0,229,255,0.6),transparent)",
          animation: "ss-scan 5s ease-in-out infinite",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-md w-full text-center">

        {/* Logo + system label */}
        <div className="flex flex-col items-center mb-6">
          {/* Synthesis logo (reused from create page) */}
          <div className="relative inline-flex items-center justify-center mb-4 ss-logo-enter"
            style={{ width: 80, height: 80 }}>
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -18, background: "radial-gradient(circle,rgba(0,229,255,0.22) 0%,rgba(167,139,250,0.08) 50%,transparent 70%)", animation: "ss-breathe 3.5s ease-in-out infinite" }}
            />
            <svg width="80" height="80" viewBox="0 0 90 90" fill="none" aria-hidden="true">
              <g style={{ animation: "ss-orbit 55s linear infinite", transformOrigin: "45px 45px" }}>
                <circle cx="45" cy="45" r="42" stroke="rgba(0,229,255,0.18)" strokeWidth="1" strokeDasharray="5 9"/>
                <circle cx="45" cy="3"  r="2.8" fill="#00e5ff"  style={{ animation: "ss-node 2.8s ease-in-out infinite" }}/>
                <circle cx="87" cy="45" r="2.8" fill="#a78bfa"  style={{ animation: "ss-node 2.8s ease-in-out infinite", animationDelay: "0.7s" }}/>
                <circle cx="45" cy="87" r="2.8" fill="#00e5ff"  style={{ animation: "ss-node 2.8s ease-in-out infinite", animationDelay: "1.4s" }}/>
                <circle cx="3"  cy="45" r="2.8" fill="#a78bfa"  style={{ animation: "ss-node 2.8s ease-in-out infinite", animationDelay: "2.1s" }}/>
              </g>
              <path d="M45 14 C38 19.5 52 25 45 30.5 C38 36 52 41.5 45 47 C38 52.5 52 58 45 63.5 C38 69 52 74.5 45 80"
                    stroke="rgba(0,229,255,0.6)" strokeWidth="1.4" fill="none" style={{ animation: "ss-helix 3s ease-in-out infinite" }}/>
              <path d="M45 14 C52 19.5 38 25 45 30.5 C52 36 38 41.5 45 47 C52 52.5 38 58 45 63.5 C52 69 38 74.5 45 80"
                    stroke="rgba(167,139,250,0.6)" strokeWidth="1.4" fill="none" style={{ animation: "ss-helix 3s ease-in-out infinite", animationDelay: "0.5s" }}/>
              <circle cx="45" cy="45" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" r="5">
                <animate attributeName="r" values="5;38" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.55;0" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <polygon points="45,38 52,45 45,52 38,45" fill="rgba(0,229,255,0.92)" stroke="white" strokeWidth="0.5"/>
              <circle cx="45" cy="45" r="1.8" fill="white" opacity="0.95"/>
            </svg>
          </div>

          {/* System label */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,.4))" }}/>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", animation: "ss-node 2s ease-in-out infinite" }}/>
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,.4)" }}>
                NEOLUTION PROTOCOL
              </span>
            </div>
            <div className="w-6 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,.4))" }}/>
          </div>
        </div>

        {/* ── Typewriter title ── */}
        {phase >= 1 && (
          <div className="mb-8 ss-fade-up" style={{ animationDelay: "0s" }}>
            <h1
              className="font-black tracking-[5px] uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px,6vw,40px)",
                color: "#fff",
                textShadow: "0 0 50px rgba(0,229,255,0.5), 0 0 100px rgba(0,229,255,0.2)",
                minHeight: "1.2em",
              }}
            >
              {displayedText}
              <span
                className="inline-block w-[3px] bg-cyan-400 align-text-bottom ml-1"
                style={{ height: "0.85em", animation: "ss-cursor 0.7s step-end infinite" }}
              />
            </h1>
          </div>
        )}

        {/* ── Avatar + name ── */}
        {phase >= 2 && (
          <div className="space-y-5 ss-fade-up" style={{ animationDelay: "0.1s" }}>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Pulsing rings */}
                <div
                  className="absolute rounded-full border"
                  style={{ inset: -10, borderColor: "rgba(0,229,255,0.4)", animation: "ss-ring 3s ease-in-out infinite" }}
                />
                <div
                  className="absolute rounded-full border"
                  style={{ inset: -20, borderColor: "rgba(167,139,250,0.2)", animation: "ss-ring 3s ease-in-out 1s infinite" }}
                />
                <div
                  className="w-28 h-28 rounded-full overflow-hidden"
                  style={{ border: "2px solid rgba(0,229,255,0.45)", background: "#100030", boxShadow: "0 0 40px rgba(0,229,255,0.3)" }}
                >
                  {characterAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={characterAvatarUrl} alt={characterName} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-black" style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.8)" }}>
                        {characterName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name + designation */}
            <div>
              <h2
                className="text-2xl font-black tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.55)" }}
              >
                {characterName}
              </h2>
              <p className="text-[10px] tracking-[3px] uppercase mt-1" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.55)" }}>
                {designation}
              </p>
            </div>

            {/* Greeting teaser */}
            {greeting && (
              <div
                className="rounded-2xl px-5 py-4 text-left"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <p className="text-[9px] tracking-[2.5px] uppercase mb-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}>◈ FIRST TRANSMISSION</p>
                <p className="text-[13px] italic leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "#c0b8d8" }}>
                  &ldquo;{greeting.slice(0, 160)}{greeting.length > 160 && "…"}&rdquo;
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={`/chat/${characterId}`}
                className="cr-btn-primary block w-full py-3.5 rounded-xl font-bold text-[11px] tracking-[4px] uppercase text-center transition-all active:scale-95"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)",
                  color: "#05020d",
                  boxShadow: "0 0 40px rgba(0,229,255,0.5), 0 8px 28px rgba(0,0,0,0.4)",
                }}
              >
                <span className="relative z-10">▶ INITIATE CONTACT</span>
              </Link>
              <Link
                href={`/character/${characterId}`}
                className="block w-full py-3 rounded-xl text-[11px] tracking-[2px] uppercase text-center transition-all duration-200 active:scale-95"
                style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(167,139,250,0.7)", background: "rgba(124,58,237,0.04)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.5)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.7)"; }}
              >
                VIEW ENTITY FILE
              </Link>
              <Link
                href="/create"
                className="block w-full py-2.5 text-[9px] tracking-[2.5px] uppercase text-center transition-all duration-200"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.5)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.7)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.5)"; }}
              >
                + SYNTHESIZE ANOTHER
              </Link>
            </div>

          </div>
        )}

        <p className="text-[8px] tracking-[3px] uppercase mt-8" style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.2)" }}>
          SESTRA PROTOCOL ACTIVE · 324B21
        </p>
      </div>

      <style>{`
        @keyframes ss-scan    { 0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:0.35} 100%{top:100%;opacity:0} }
        @keyframes ss-orbit   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ss-node    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes ss-helix   { 0%,100%{opacity:.3} 50%{opacity:.85} }
        @keyframes ss-breathe { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.1);opacity:1} }
        @keyframes ss-ring    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.9;transform:scale(1.04)} }
        @keyframes ss-cursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ss-fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ss-logo-enter { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }

        .ss-logo-enter { animation: ss-logo-enter 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .ss-fade-up    { animation: ss-fade-up    0.55s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes crShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cr-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: crShimmer 2.8s ease-in-out infinite;
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>
    </div>
  );
}
