"use client";

import { HexRatingStub } from "./HexRatingStub";

interface CharacterHeroProps {
  name: string;
  subtitle: string | null;
  avatarUrl: string;
  genderPronouns: string;
  subjectId: string;
  isPlatform: boolean;
  tier: "standard" | "brilliant";
  isNsfw: boolean;
  children?: React.ReactNode; // action buttons
}

export function CharacterHero({
  name,
  subtitle,
  avatarUrl,
  genderPronouns,
  subjectId,
  isPlatform,
  tier,
  isNsfw,
  children,
}: CharacterHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Blurred avatar as background */}
      <div className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "blur(48px) brightness(0.4) saturate(1.2)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05020d]/70 via-[#05020d]/85 to-[#05020d]" />
      </div>

      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Scan bar sweep */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,229,255,0.35), transparent)",
          animation: "heroScan 7s ease-in-out infinite",
        }}
      />

      <div className="relative pt-28 pb-16 px-6 flex flex-col items-center text-center">
        {/* SUBJECT ID easter-egg header */}
        <div
          className="mb-6"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "4px",
            color: "rgba(0,229,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          ◈ {subjectId} · NEOLUTION PROTOCOL
        </div>

        {/* Avatar with pulsing rings */}
        <div className="relative mb-7">
          <div
            className="absolute inset-[-14px] rounded-full border border-cyan-400/50"
            style={{ animation: "heroRing 3.2s ease-in-out infinite" }}
          />
          <div
            className="absolute inset-[-26px] rounded-full border border-purple-500/25"
            style={{ animation: "heroRing 3.2s ease-in-out 1.1s infinite" }}
          />
          <div
            className="w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-cyan-400/40 bg-[#150035] relative"
            style={{
              boxShadow: "0 0 60px rgba(0,229,255,0.25)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name */}
        <h1
          className="font-black leading-[1.05] mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 76px)",
            letterSpacing: "6px",
            color: "#00e5ff",
            textShadow:
              "0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(124,58,237,0.2)",
            textTransform: "uppercase",
          }}
        >
          {name}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="italic max-w-xl"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(15px, 2vw, 20px)",
              color: "rgba(167,139,250,0.85)",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Identity row: pronouns + verified + tier + NSFW */}
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
                fontFamily: "var(--font-mono)",
                color: "#00e5ff",
                borderColor: "rgba(0,229,255,0.4)",
                background: "rgba(0,229,255,0.08)",
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
                fontFamily: "var(--font-mono)",
                color: "#fcd34d",
                borderColor: "rgba(250,204,21,0.4)",
                background: "rgba(250,204,21,0.08)",
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

          <HexRatingStub />
        </div>

        {/* Action buttons (passed in) */}
        {children && <div className="mt-8">{children}</div>}
      </div>

      <style>{`
        @keyframes heroRing {
          0%,100%{opacity:0.4;transform:scale(1)}
          50%{opacity:1;transform:scale(1.04)}
        }
        @keyframes heroScan {
          0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:0.3} 100%{top:100%;opacity:0}
        }
      `}</style>
    </section>
  );
}
