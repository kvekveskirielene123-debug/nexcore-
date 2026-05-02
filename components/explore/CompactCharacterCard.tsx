"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleFavorite } from "@/lib/queries/favoriteActions";
import type { Character } from "@/lib/queries/exploreTypes";

interface CompactCharacterCardProps {
  character: Character;
  index: number;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}

// Build SUBJECT ID from name
function buildSubjectId(character: Character, index: number): string {
  const suffix = character.name.charAt(0).toUpperCase();
  const num = String(index + 1).padStart(3, "0");
  return `SUBJECT #${num}-${suffix}`;
}

// Color palette per character (deterministic from id)
function colorForCharacter(id: string): { fg: string; glow: string; bg: string } {
  const palettes = [
    { fg: "#00e5ff", glow: "rgba(0,229,255,0.8)",  bg: "linear-gradient(135deg,#0d0030,#041830)" },
    { fg: "#f472b6", glow: "rgba(244,114,182,0.8)", bg: "linear-gradient(135deg,#200010,#1a0030)" },
    { fg: "#34d399", glow: "rgba(52,211,153,0.8)",  bg: "linear-gradient(135deg,#001a10,#003020)" },
    { fg: "#a78bfa", glow: "rgba(167,139,250,0.8)", bg: "linear-gradient(135deg,#180030,#0a0040)" },
    { fg: "#fbbf24", glow: "rgba(251,191,36,0.8)",  bg: "linear-gradient(135deg,#1a1000,#2a1400)" },
  ];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

export function CompactCharacterCard({
  character,
  index,
  isFavorited = false,
  isLoggedIn = false,
}: CompactCharacterCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  const palette = colorForCharacter(character.id);
  const subjectId = buildSubjectId(character, index);
  const letter = character.name.charAt(0).toUpperCase();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 2000);
      return;
    }

    if (loading) return;
    setLoading(true);
    try {
      const newState = await toggleFavorite(character.id, favorited);
      setFavorited(newState);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block rounded-[14px] overflow-hidden border border-purple-700/20 bg-[#0c0520]/80 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(0,229,255,0.06)]"
      style={{ aspectRatio: "4/5", minWidth: 140, maxWidth: 220 }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none" />

      {/* Subject ID easter egg */}
      <span
        className="absolute top-2 left-2 z-10 text-[7px] tracking-[2px] text-cyan-400/25"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {subjectId}
      </span>

      {/* Favorite heart */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={favorited ? "#00e5ff" : "none"}
          stroke={favorited ? "#00e5ff" : "rgba(255,255,255,0.55)"}
          strokeWidth="2"
          style={{
            filter: favorited ? "drop-shadow(0 0 6px rgba(0,229,255,0.7))" : "none",
            transition: "all 0.2s",
          }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {showLoginTooltip && (
          <span
            className="absolute top-8 right-0 whitespace-nowrap bg-black/90 border border-cyan-400/30 text-cyan-400 text-[9px] tracking-wider px-2 py-1 rounded pointer-events-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SIGN UP TO SAVE
          </span>
        )}
      </button>

      {/* NSFW indicator dot */}
      {character.is_nsfw && (
        <span
          className="absolute bottom-14 left-2 z-10 w-1.5 h-1.5 rounded-full"
          style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
          aria-label="NSFW content"
        />
      )}

      {/* Avatar area */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ background: palette.bg, height: "70%" }}
      >
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-card-scan pointer-events-none"
          style={{ animationDelay: `${(index % 5) * 0.4}s` }}
        />

        {/* Avatar image or letter fallback */}
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className="relative z-10 text-[56px] font-black"
            style={{
              fontFamily: "var(--font-display)",
              color: palette.fg,
              textShadow: `0 0 24px ${palette.glow}`,
            }}
          >
            {letter}
          </span>
        )}

        {/* Platform badge */}
        {character.is_platform && (
          <span
            className="absolute bottom-2 right-2 text-[7px] tracking-[1.5px] text-cyan-400 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-cyan-400/30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR
          </span>
        )}
      </div>

      {/* Info bar */}
      <div className="px-3 py-2.5 h-[30%] flex flex-col justify-center">
        <div
          className="text-[13px] font-semibold tracking-[1.5px] truncate"
          style={{ fontFamily: "var(--font-display)", color: palette.fg }}
        >
          {character.name}
        </div>
        <div
          className="text-[8px] tracking-[1px] text-[#7a6a9a] truncate mt-0.5 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {character.gender_pronouns}
        </div>
      </div>
    </Link>
  );
}
