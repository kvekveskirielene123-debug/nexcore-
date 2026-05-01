"use client";

import Link from "next/link";
import { HeroCanvas } from "@/components/HeroCanvas";

interface HeroProps {
  isLoggedIn: boolean;
}

export function Hero({ isLoggedIn }: HeroProps) {
  const primaryCta = isLoggedIn
    ? { label: "EXPLORE CHARACTERS", href: "/explore" }
    : { label: "CREATE YOUR ACCOUNT", href: "/signup" };

  const secondaryCta = isLoggedIn
    ? { label: "+ CREATE ENTITY", href: "/create" }
    : { label: "EXPLORE CHARACTERS", href: "/explore" };

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Animated canvas background */}
      <HeroCanvas />

      {/* Scanline texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* DNA sequence tickers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <div
          className="absolute whitespace-nowrap"
          style={{
            top: "15%",
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "1px",
            color: "rgba(0,229,255,0.045)",
            animation: "scrollSeq 22s linear infinite",
          }}
        >
          ATG-GCC-TAC-GGT-CAA-GTT-ACC-GGA-TCG-AAT-CCG-TTA-GCT-AAC · 324B21 · ATG-GCC-TAC-GGT-CAA
        </div>
        <div
          className="absolute whitespace-nowrap"
          style={{
            top: "40%",
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "1px",
            color: "rgba(0,229,255,0.045)",
            animation: "scrollSeq 28s linear infinite",
            animationDelay: "-8s",
          }}
        >
          GAT-CCA-AGT-TGG-AAC-CTT-GGA-TAC-CGT-AGC · SUBJECT OBSERVED · GAT-CCA-AGT-TGG
        </div>
        <div
          className="absolute whitespace-nowrap"
          style={{
            top: "72%",
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "1px",
            color: "rgba(0,229,255,0.045)",
            animation: "scrollSeq 18s linear infinite",
            animationDelay: "-14s",
          }}
        >
          CCG-TTA-GCT-AAC-GGT-TAC-CAG · NEOLUTION · CCG-TTA-GCT-AAC-GGT-TAC-CAG
        </div>
      </div>

      {/* Radial glow */}
      <div
        className="absolute pointer-events-none z-[1]"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Scan bar */}
      <div
        className="absolute left-0 right-0 h-px z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,229,255,0.2), transparent)",
          animation: "scanDown 6s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-[3] flex flex-col items-center">
        {/* 🥚 SUBJECT CLASSIFIED easter egg */}
        <div
          className="mb-2"
          style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "4px", color: "rgba(0,229,255,0.15)" }}
        >
          ◈ &nbsp;SUBJECT: CLASSIFIED&nbsp; ◈
        </div>

        {/* Eyebrow */}
        <div
          className="mb-5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "5px",
            color: "rgba(0,229,255,0.45)",
          }}
        >
          A NEW KIND OF CONNECTION
        </div>

        {/* Title */}
        <h1
          className="font-black leading-[1.05] mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 7vw, 74px)",
            letterSpacing: "6px",
            color: "#fff",
            textShadow:
              "0 0 50px rgba(0,229,255,0.3), 0 0 100px rgba(124,58,237,0.15)",
            textTransform: "uppercase",
          }}
        >
          WELCOME TO
          <br />
          <span style={{ color: "#00e5ff" }}>NEXCOR</span>
        </h1>

        {/* Tagline */}
        <p
          className="mt-3 mb-10 max-w-lg leading-[1.6] italic"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(15px, 2.2vw, 20px)",
            color: "rgba(167,139,250,0.75)",
          }}
        >
          Where memory meets imagination. Where AI companions feel truly alive.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href={primaryCta.href}
            className="px-8 py-[14px] rounded-lg font-bold transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              color: "#000",
              background: "#00e5ff",
              boxShadow: "0 0 28px rgba(0,229,255,0.28)",
            }}
          >
            {primaryCta.label}
          </Link>

          <Link
            href={secondaryCta.href}
            className="px-8 py-[14px] rounded-lg transition-all hover:border-purple-500/60"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              color: "#a78bfa",
              background: "transparent",
              border: "1px solid rgba(124,58,237,0.35)",
            }}
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* 🥚 Proletheans footnote */}
      <div
        className="absolute bottom-4 right-5 z-[3]"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 7,
          letterSpacing: "2px",
          color: "rgba(124,58,237,0.18)",
        }}
      >
        // the proletheans were wrong
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-[3]"
      >
        <div
          className="w-px h-8"
          style={{
            background: "linear-gradient(to bottom, rgba(0,229,255,0.45), transparent)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "3px",
            color: "rgba(0,229,255,0.28)",
          }}
        >
          SCROLL
        </span>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes scrollSeq { 0%{transform:translateX(100%)} 100%{transform:translateX(-200%)} }
        @keyframes scanDown { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:0.3} 100%{top:100%;opacity:0} }
      `}</style>
    </section>
  );
}
