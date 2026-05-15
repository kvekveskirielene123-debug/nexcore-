"use client";

import { HexRating } from "./HexRating";
import { useEffect, useState } from "react";

interface CharacterHeroProps {
  name: string;
  subtitle: string | null;
  avatarUrl: string;
  genderPronouns: string;
  subjectId: string;
  isPlatform: boolean;
  tier: "standard" | "brilliant";
  isNsfw: boolean;
  showCreatorBadge?: boolean;
  children?: React.ReactNode;
}

function hashId(str: string): string {
  let h = 0x5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

function DnaHelix({ side }: { side: "L" | "R" }) {
  const gid = `chDnaFade${side}`;
  const mid = `chDnaMask${side}`;
  const STRAND1 =
    "M 50,0 C 100,0 100,50 50,50 C 0,50 0,100 50,100 C 100,100 100,150 50,150 C 0,150 0,200 50,200 C 100,200 100,250 50,250 C 0,250 0,300 50,300 C 100,300 100,350 50,350 C 0,350 0,400 50,400 C 100,400 100,450 50,450 C 0,450 0,500 50,500 C 100,500 100,550 50,550 C 0,550 0,600 50,600";
  const STRAND2 =
    "M 50,0 C 0,0 0,50 50,50 C 100,50 100,100 50,100 C 0,100 0,150 50,150 C 100,150 100,200 50,200 C 0,200 0,250 50,250 C 100,250 100,300 50,300 C 0,300 0,350 50,350 C 100,350 100,400 50,400 C 0,400 0,450 50,450 C 100,450 100,500 50,500 C 0,500 0,550 50,550 C 100,550 100,600 50,600";
  const RUNGS = [25, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575];
  return (
    <svg width="100" height="600" viewBox="0 0 100 600" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="black" />
          <stop offset="18%" stopColor="white" />
          <stop offset="82%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <mask id={mid}>
          <rect width="100" height="600" fill={`url(#${gid})`} />
        </mask>
      </defs>
      <g mask={`url(#${mid})`}>
        <path d={STRAND1} fill="none" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5" />
        <path d={STRAND2} fill="none" stroke="rgba(124,58,237,0.55)" strokeWidth="1.5" />
        {RUNGS.map((y) => (
          <line key={y} x1="16" y1={y} x2="84" y2={y} stroke="rgba(0,212,255,0.22)" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}

function TargetAvatar({ src, name }: { src: string; name: string }) {
  const ticks: React.ReactNode[] = [];
  for (let deg = 0; deg < 360; deg += 45) {
    const rad = (deg * Math.PI) / 180;
    const cardinal = deg % 90 === 0;
    const r1 = cardinal ? 108 : 112;
    const r2 = cardinal ? 122 : 116;
    ticks.push(
      <line
        key={deg}
        x1={120 + r1 * Math.sin(rad)}
        y1={120 - r1 * Math.cos(rad)}
        x2={120 + r2 * Math.sin(rad)}
        y2={120 - r2 * Math.cos(rad)}
        stroke={cardinal ? "rgba(0,229,255,0.7)" : "rgba(0,229,255,0.32)"}
        strokeWidth={cardinal ? 1.5 : 1}
      />
    );
  }
  const labels = [
    { label: "000°", dx: 0, dy: -136 },
    { label: "090°", dx: 136, dy: 4 },
    { label: "180°", dx: 0, dy: 148 },
    { label: "270°", dx: -136, dy: 4 },
  ];
  return (
    <div className="relative" style={{ width: 240, height: 240 }}>
      <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0" aria-hidden>
        {/* outer dashed rotating ring */}
        <circle
          cx="120" cy="120" r="112" fill="none"
          stroke="rgba(0,229,255,0.22)" strokeWidth="1" strokeDasharray="4 8"
          style={{ animation: "chTgtSpin 28s linear infinite", transformOrigin: "120px 120px" }}
        />
        {/* inner static ring */}
        <circle cx="120" cy="120" r="96" fill="none" stroke="rgba(124,58,237,0.28)" strokeWidth="1" />
        {/* radar sweep arm */}
        <line x1="120" y1="120" x2="120" y2="12" stroke="rgba(0,229,255,0.45)" strokeWidth="1.5"
          style={{ animation: "chTgtSweep 4s linear infinite", transformOrigin: "120px 120px" }} />
        {/* sweep sector fill */}
        <path d="M120,120 L120,12 A108,108 0 0,1 156,30 Z" fill="rgba(0,229,255,0.04)"
          style={{ animation: "chTgtSweep 4s linear infinite", transformOrigin: "120px 120px" }} />
        {/* corner brackets */}
        <path d="M48,48 L48,36 L60,36" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" />
        <path d="M192,48 L192,36 L180,36" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" />
        <path d="M48,192 L48,204 L60,204" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" />
        <path d="M192,192 L192,204 L180,204" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" />
        {/* ticks */}
        {ticks}
        {/* degree labels */}
        {labels.map(({ label, dx, dy }) => (
          <text key={label} x={120 + dx} y={120 + dy}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(0,229,255,0.32)" fontSize="7"
            style={{ fontFamily: "monospace", letterSpacing: 1 }}>
            {label}
          </text>
        ))}
      </svg>
      {/* avatar circle */}
      <div
        className="absolute"
        style={{
          top: 24, left: 24, width: 192, height: 192, borderRadius: "50%", overflow: "hidden",
          border: "2px solid rgba(0,229,255,0.35)",
          boxShadow: "0 0 60px rgba(0,229,255,0.22), inset 0 0 24px rgba(0,229,255,0.05)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

function TypeLabel({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {displayed}
      <span style={{ animation: "chBlink 1s step-end infinite" }}>_</span>
    </span>
  );
}

function HudBrackets() {
  return (
    <>
      {(
        [
          ["top-0 left-0", "border-t border-l"],
          ["top-0 right-0", "border-t border-r"],
          ["bottom-0 left-0", "border-b border-l"],
          ["bottom-0 right-0", "border-b border-r"],
        ] as const
      ).map(([pos, border], i) => (
        <div
          key={i}
          className={`absolute ${pos} w-7 h-7 ${border} border-cyan-400/25 pointer-events-none`}
        />
      ))}
    </>
  );
}

export function CharacterHero({
  name, subtitle, avatarUrl, genderPronouns, subjectId,
  isPlatform, tier, isNsfw, showCreatorBadge, children,
}: CharacterHeroProps) {
  const hexId = hashId(subjectId);
  const labelText = `ACCESSING SUBJECT FILE · ${hexId}`;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 540 }}>
      {/* ── Background stack (identical to explore + profile) ── */}
      <div className="absolute inset-0 -z-10 bg-[#000814]" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.8) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 90% 55% at 50% -5%,rgba(0,212,255,.11) 0%,transparent 65%)" }} />
      <div className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 55% 45% at 15% 65%,rgba(124,58,237,.08) 0%,transparent 60%)" }} />
      <div className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 45% 40% at 85% 55%,rgba(244,114,182,.06) 0%,transparent 55%)" }} />
      <div
        className="absolute bottom-0 left-0 right-0 h-36 -z-10"
        style={{ background: "linear-gradient(to bottom,transparent,rgba(5,2,13,1))" }}
      />

      {/* ── Floating orbs ── */}
      <div className="absolute pointer-events-none" style={{
        top: "8%", left: "4%", width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(0,212,255,.12),transparent 70%)",
        animation: "chOrb 9s ease-in-out infinite",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "38%", right: "6%", width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(124,58,237,.10),transparent 70%)",
        animation: "chOrb 9s ease-in-out 2.5s infinite",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "18%", left: "14%", width: 160, height: 160, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(244,114,182,.08),transparent 70%)",
        animation: "chOrb 9s ease-in-out 5s infinite",
      }} />

      {/* ── DNA helices ── */}
      <div className="absolute top-0 left-2 h-full opacity-[0.07] pointer-events-none hidden lg:block">
        <DnaHelix side="L" />
      </div>
      <div className="absolute top-0 right-2 h-full opacity-[0.07] pointer-events-none hidden lg:block"
        style={{ transform: "scaleX(-1)" }}>
        <DnaHelix side="R" />
      </div>

      {/* ── Scanlines ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.045) 3px,rgba(0,0,0,0.045) 4px)",
      }} />
      {/* scan sweep */}
      <div className="absolute left-0 right-0 h-px pointer-events-none" style={{
        background: "linear-gradient(to right,transparent,rgba(0,229,255,0.28),transparent)",
        animation: "chScan 7s ease-in-out infinite",
      }} />

      {/* HUD brackets */}
      <HudBrackets />

      {/* ── Content ── */}
      <div className="relative pt-24 pb-16 px-6 flex flex-col items-center text-center">
        {/* typewriter subject label */}
        <div
          className="mb-7 h-4"
          style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "4px",
            color: "rgba(0,229,255,0.42)", textTransform: "uppercase",
          }}
        >
          <TypeLabel text={labelText} />
        </div>

        {/* targeting reticle avatar */}
        <div className="mb-8">
          <TargetAvatar src={avatarUrl} name={name} />
        </div>

        {/* glitch name */}
        <h1
          className="font-black leading-[1.05] mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 6vw, 70px)",
            letterSpacing: "6px",
            color: "#00e5ff",
            textTransform: "uppercase",
            animation: "chGlitch 6s ease-in-out infinite",
          }}
        >
          {name}
        </h1>

        {subtitle && (
          <p
            className="italic max-w-xl mt-1"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(14px, 2vw, 19px)",
              color: "rgba(167,139,250,0.85)",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* badge pills */}
        <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
          <span
            className="text-[10px] tracking-[2px] text-[#a78bfa] uppercase px-3 py-1 rounded-full border border-purple-700/30 bg-purple-900/15"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {genderPronouns}
          </span>

          {isPlatform && (
            <span
              className="text-[10px] tracking-[2px] uppercase px-3 py-1 rounded-full border"
              style={{
                fontFamily: "var(--font-mono)", color: "#00e5ff",
                borderColor: "rgba(0,229,255,0.4)", background: "rgba(0,229,255,0.08)",
                textShadow: "0 0 6px rgba(0,229,255,0.3)",
              }}
            >
              ◈ NEXCOR VERIFIED
            </span>
          )}

          {tier === "brilliant" && (
            <span
              className="text-[10px] tracking-[2px] uppercase px-3 py-1 rounded-full border"
              style={{
                fontFamily: "var(--font-mono)", color: "#fcd34d",
                borderColor: "rgba(250,204,21,0.4)", background: "rgba(250,204,21,0.08)",
                textShadow: "0 0 8px rgba(250,204,21,0.35)",
              }}
            >
              ◈ BRILLIANT
            </span>
          )}

          {isNsfw && (
            <span
              className="text-[10px] tracking-[2px] uppercase px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              NSFW · 18+
            </span>
          )}

          {showCreatorBadge && (
            <span
              className="text-[10px] tracking-[2px] uppercase px-3 py-1 rounded-full border"
              style={{
                fontFamily: "var(--font-mono)", color: "#a78bfa",
                borderColor: "rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.08)",
                textShadow: "0 0 6px rgba(167,139,250,0.3)",
              }}
            >
              ◈ CREATOR
            </span>
          )}

          <HexRating value={null} disabled size="md" />
        </div>

        {/* action buttons */}
        {children && <div className="mt-8">{children}</div>}
      </div>

      <style>{`
        @keyframes chOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(14px,20px) scale(1.05); }
        }
        @keyframes chScan {
          0%   { top: 0;    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.28; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes chTgtSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes chTgtSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes chGlitch {
          0%,78%,100% { text-shadow: 0 0 48px rgba(0,229,255,.45); transform: none; }
          79%  { text-shadow:  3px 0 0 rgba(255,0,128,.8), -3px 0 0 rgba(0,229,255,.8); transform: skewX(-2deg); }
          80%  { text-shadow: -3px 0 0 rgba(255,0,128,.8),  3px 0 0 rgba(0,229,255,.8); transform: skewX(2deg) translateX(2px); }
          81%  { text-shadow: 0 0 48px rgba(0,229,255,.45); transform: none; }
          82%  { text-shadow: 2px 0 0 rgba(255,128,0,.7), -2px 0 0 rgba(0,229,255,.7); transform: translateY(-1px); }
          83%  { text-shadow: 0 0 48px rgba(0,229,255,.45); transform: none; }
        }
        @keyframes chBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
