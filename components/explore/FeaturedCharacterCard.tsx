"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleFavorite } from "@/lib/queries/favoriteActions";
import type { Character } from "@/lib/queries/exploreTypes";

interface FeaturedCharacterCardProps {
  character: Character;
  index: number;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}

function colorForCharacter(id: string) {
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

export function FeaturedCharacterCard({
  character,
  index,
  isFavorited = false,
  isLoggedIn = false,
}: FeaturedCharacterCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const palette = colorForCharacter(character.id);
  const letter = character.name.charAt(0).toUpperCase();
  const subjectId = `SUBJECT #${String(index + 1).padStart(3, "0")}-${letter}`;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || loading) return;
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
      className="group relative block rounded-[18px] overflow-hidden border border-cyan-400/20 bg-[#0c0520]/80 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(0,229,255,0.1)]"
      style={{ width: 280, minWidth: 280, height: 380 }}
    >
      {/* Featured badge */}
      <span
        className="absolute top-3 left-3 z-20 text-[8px] tracking-[3px] text-cyan-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-cyan-400/40"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ◈ FEATURED
      </span>

      {/* Subject easter egg */}
      <span
        className="absolute top-3 right-12 z-10 text-[7px] tracking-[2px] text-cyan-400/30"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {subjectId}
      </span>

      {/* Favorite heart */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        aria-label="Toggle favorite"
        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={favorited ? "#00e5ff" : "none"}
          stroke={favorited ? "#00e5ff" : "rgba(255,255,255,0.55)"}
          strokeWidth="2"
          style={{
            filter: favorited ? "drop-shadow(0 0 6px rgba(0,229,255,0.7))" : "none",
          }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Avatar area — bigger */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ background: palette.bg, height: 260 }}
      >
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-card-scan pointer-events-none"
          style={{ animationDelay: `${(index % 4) * 0.5}s` }}
        />
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
            className="relative z-10 text-[96px] font-black"
            style={{
              fontFamily: "var(--font-display)",
              color: palette.fg,
              textShadow: `0 0 40px ${palette.glow}`,
            }}
          >
            {letter}
          </span>
        )}

        {/* NSFW dot */}
        {character.is_nsfw && (
          <span
            className="absolute bottom-3 left-3 w-2 h-2 rounded-full"
            style={{ background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,0.8)" }}
            aria-label="NSFW content"
          />
        )}
      </div>

      {/* Gradient overlay + info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-[#0c0520] via-[#0c0520]/85 to-transparent">
        <div
          className="text-[20px] font-bold tracking-[2px] truncate mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: palette.fg,
            textShadow: `0 0 12px ${palette.glow}`,
          }}
        >
          {character.name}
        </div>
        {character.subtitle && (
          <p
            className="text-[11px] text-[#9a88b0]/80 italic line-clamp-2 leading-relaxed mb-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {character.subtitle}
          </p>
        )}
        <div
          className="text-[8px] tracking-[1.5px] text-[#7a6a9a] uppercase truncate"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {character.gender_pronouns} · {character.chat_count.toLocaleString()} CHATS
        </div>
      </div>
    </Link>
  );
}
