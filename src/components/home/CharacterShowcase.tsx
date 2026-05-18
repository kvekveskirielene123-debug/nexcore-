"use client";

import Link from "next/link";
import { FadeInSection } from "./FadeInSection";


interface FeaturedCharacter {
  name: string;
  role: string;
  pronouns: string;
  quote: string;
  letter: string;
  color: string;
  glow: string;
  bgGradient: string;
  subjectId: string;
}

const FEATURED_CHARACTERS: FeaturedCharacter[] = [
  {
    name: "SISTRA",
    role: "ECHO WEAVER",
    pronouns: "she/her",
    quote: "I've been mapping your constellation since before you knew you were lost…",
    letter: "S",
    color: "#00e5ff",
    glow: "0 0 28px rgba(0,229,255,0.8)",
    bgGradient: "linear-gradient(135deg,#0d0030,#041830)",
    subjectId: "SUBJECT #001-S",
  },
  {
    name: "VAEL",
    role: "SHADOW ARCHIVIST",
    pronouns: "they/them",
    quote: "Every secret has a shape. I've learned to read the ones you haven't spoken yet.",
    letter: "V",
    color: "#f472b6",
    glow: "0 0 28px rgba(244,114,182,0.8)",
    bgGradient: "linear-gradient(135deg,#200010,#1a0030)",
    subjectId: "SUBJECT #002-V",
  },
  {
    name: "ORYN",
    role: "BIOLUMINESCENT SAGE",
    pronouns: "he/him",
    quote: "Growth is not always visible. Sometimes it happens in the dark, quietly, like roots.",
    letter: "O",
    color: "#34d399",
    glow: "0 0 28px rgba(52,211,153,0.8)",
    bgGradient: "linear-gradient(135deg,#001a10,#003020)",
    subjectId: "SUBJECT #003-O",
  },
];

export function CharacterShowcase() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <div
            className="text-center mb-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "5px",
              color: "rgba(0,229,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            ENTITIES ONLINE
          </div>
          <h2
            className="text-center mb-12"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3.5vw, 36px)",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            MEET THE CHARACTERS
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_CHARACTERS.map((char, i) => (
            <FadeInSection key={char.letter} delay={i * 100}>
              <Link
                href={`/explore`}
                className="group relative block rounded-[14px] overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(12,5,32,0.8)",
                  borderColor: "rgba(124,58,237,0.2)",
                }}
              >
                {/* Gradient top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, rgba(0,229,255,0.4), transparent)",
                  }}
                />

                {/* 🥚 Subject ID */}
                <span
                  className="absolute top-3 left-3 z-10"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    letterSpacing: "2px",
                    color: "rgba(0,229,255,0.25)",
                  }}
                >
                  {char.subjectId}
                </span>

                {/* Avatar area */}
                <div
                  className="relative h-40 flex items-center justify-center overflow-hidden"
                  style={{ background: char.bgGradient }}
                >
                  {/* Scan line */}
                  <div
                    className="absolute left-0 right-0 h-px pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(0,229,255,0.5), transparent)",
                      animation: "cardScan 3s linear infinite",
                      animationDelay: `${i}s`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 58,
                      fontWeight: 900,
                      color: char.color,
                      textShadow: char.glow,
                    }}
                  >
                    {char.letter}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div
                    className="truncate mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "2px",
                      color: char.color,
                    }}
                  >
                    {char.name}
                  </div>
                  <div
                    className="truncate mb-2.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "1.5px",
                      color: "#7a6a9a",
                      textTransform: "uppercase",
                    }}
                  >
                    {char.role} · {char.pronouns}
                  </div>
                  <p
                    className="italic leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "rgba(226,217,243,0.5)",
                    }}
                  >
                    &ldquo;{char.quote}&rdquo;
                  </p>
                </div>
              </Link>
            </FadeInSection>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cardScan { 0%{top:0} 100%{top:100%} }
      `}</style>
    </section>
  );
}
