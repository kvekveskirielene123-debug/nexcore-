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
}

export function CharacterRail({
  title,
  subtitle,
  characters,
  favoriteIds,
  isLoggedIn,
  variant = "compact",
  minCount = 3,
}: CharacterRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide rail if not enough content
  if (characters.length < minCount) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = variant === "featured" ? 320 : 180;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative">
      {/* Title band */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div>
          <h2
            className="text-[14px] md:text-base tracking-[3px] text-white uppercase flex items-center gap-3"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            <span className="w-3 h-px bg-cyan-400/50" />
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-[9px] tracking-[2px] text-[#5a4a7a] mt-1 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop scroll buttons */}
        <div className="hidden md:flex gap-1">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-purple-700/30 hover:border-cyan-400/40 text-[#7a6a9a] hover:text-cyan-400 transition-all"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-purple-700/30 hover:border-cyan-400/40 text-[#7a6a9a] hover:text-cyan-400 transition-all"
          >
            →
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          section > div::-webkit-scrollbar { display: none; }
        `}</style>
        {characters.map((char, i) => (
          <div key={char.id} className="flex-shrink-0 snap-start">
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
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
