"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DnaLogo } from "@/components/DnaLogo";

interface SuccessScreenProps {
  characterId: string;
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string;
}

function formatDesignation(id: string, name: string): string {
  const slug = id.replace(/-/g, "").slice(-4).toUpperCase();
  const letter = (name.charAt(0) || "X").toUpperCase();
  return `SUBJECT #${slug}-${letter}`;
}

export function SuccessScreen({
  characterId,
  characterName,
  characterAvatarUrl,
  greeting,
}: SuccessScreenProps) {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "SUBJECT SYNTHESIZED";

  // Typewriter effect on the title
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const designation = formatDesignation(characterId, characterName);

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,229,255,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Scan line sweep */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,229,255,0.5), transparent)",
          animation: "scanDown 4s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        <DnaLogo size={40} className="mx-auto" />

        {/* Title with typewriter */}
        <div>
          <div
            className="text-[9px] tracking-[4px] text-[#00e5ff]/40 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ NEOLUTION PROTOCOL
          </div>
          <h1
            className="text-[32px] md:text-[38px] font-black tracking-[4px] uppercase text-white"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 40px rgba(0,229,255,0.4)",
              minHeight: "1.2em",
            }}
          >
            {displayedText}
            <span
              className="inline-block w-[3px] h-[0.9em] bg-cyan-400 ml-1 align-middle animate-pulse"
              style={{ verticalAlign: "text-bottom" }}
            />
          </h1>
        </div>

        {/* Avatar with pulsing ring */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="absolute inset-[-8px] rounded-full border border-cyan-400/50"
              style={{ animation: "pulseRing 3s ease-in-out infinite" }}
            />
            <div
              className="absolute inset-[-16px] rounded-full border border-purple-500/25"
              style={{ animation: "pulseRing 3s ease-in-out 1s infinite" }}
            />
            <div className="w-28 h-28 rounded-full overflow-hidden border border-cyan-400/40 bg-[#150035]">
              {characterAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={characterAvatarUrl}
                  alt={characterName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="text-4xl font-black text-cyan-400"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
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
            className="text-2xl font-bold tracking-[3px] uppercase text-cyan-400"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 16px rgba(0,229,255,0.4)",
            }}
          >
            {characterName}
          </h2>
          <p
            className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase mt-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {designation}
          </p>
        </div>

        {/* Greeting teaser */}
        {greeting && (
          <p
            className="text-[#a78bfa] italic leading-relaxed"
            style={{ fontFamily: "var(--font-body)", fontSize: 15 }}
          >
            &ldquo;{greeting.slice(0, 140)}
            {greeting.length > 140 && "…"}&rdquo;
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4">
          <Link
            href={`/chat/${characterId}`}
            className="block w-full py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ▶ INITIATE CONTACT
          </Link>
          <Link
            href={`/character/${characterId}`}
            className="block w-full py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            VIEW ENTITY FILE
          </Link>
        </div>

        <p
          className="text-[8px] tracking-[3px] text-purple-500/25 uppercase pt-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SESTRA PROTOCOL ACTIVE · 324B21
        </p>
      </div>

      <style>{`
        @keyframes scanDown { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:0.3} 100%{top:100%;opacity:0} }
        @keyframes pulseRing { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
      `}</style>
    </div>
  );
}
