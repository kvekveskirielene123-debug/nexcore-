"use client";

import { useRef } from "react";
import type { Character } from "@/lib/queries/exploreTypes";
import { CompactCharacterCard } from "./CompactCharacterCard";
import { FeaturedCharacterCard } from "./FeaturedCharacterCard";

interface CharacterRailProps {
  title: string;
  subtitle?: string;
  characters: Character[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  variant?: "compact" | "featured";
  minCount?: number;
  showRanks?: boolean;
}

export function CharacterRail({
  title,
  subtitle,
  characters,
  favoriteIds,
  isLoggedIn,
  variant = "compact",
  minCount = 3,
  showRanks = false,
}: CharacterRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (characters.length < minCount) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = variant === "featured" ? 320 : 180;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5 px-4 md:px-0">
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <span
            className="w-0.5 rounded-full flex-shrink-0"
            style={{
              height: 28,
              background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.4))",
              boxShadow: "0 0 8px rgba(0,229,255,0.4)",
            }}
          />
          <div>
            <h2
              className="text-[14px] md:text-[15px] tracking-[3px] text-white uppercase leading-tight"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-[9px] tracking-[2px] text-[#5a4a7a] mt-0.5 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Desktop scroll arrows */}
        <div className="hidden md:flex gap-1.5">
          {["left", "right"].map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir as "left" | "right")}
              aria-label={`Scroll ${dir}`}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-purple-700/25 bg-[#0c0520]/60 text-[#7a6a9a] hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 hover:shadow-[0_0_10px_rgba(0,229,255,0.12)] transition-all duration-200 text-sm"
            >
              {dir === "left" ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scroll container with fade-mask edges ── */}
      <div className="relative">
        {/* Left fade mask */}
        <div
          className="absolute left-0 top-0 bottom-4 w-8 md:hidden z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #05020d, transparent)" }}
        />
        {/* Right fade mask */}
        <div
          className="absolute right-0 top-0 bottom-4 w-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #05020d, transparent)" }}
        />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {characters.map((char, i) => (
            <div
              key={char.id}
              className="flex-shrink-0 snap-start animate-card-enter"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.32)}s` }}
            >
              {variant === "featured" ? (
                <FeaturedCharacterCard
                  character={char}
                  index={i}
                  isFavorited={favoriteIds.has(char.id)}
                  isLoggedIn={isLoggedIn}
                />
              ) : (
                <div style={{ width: 160 }}>
                  <CompactCharacterCard
                    character={char}
                    index={i}
                    isFavorited={favoriteIds.has(char.id)}
                    isLoggedIn={isLoggedIn}
                    rank={showRanks ? i + 1 : undefined}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
