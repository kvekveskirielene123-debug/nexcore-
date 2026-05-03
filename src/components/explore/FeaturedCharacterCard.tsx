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

function colorForCharacter(id: string): { fg: string; glow: string; bg: string; glowRgb: string } {
  const palettes = [
    { fg: "#00e5ff", glow: "rgba(0,229,255,0.8)",   bg: "linear-gradient(135deg,#0d0030,#041830)", glowRgb: "0,229,255"   },
    { fg: "#f472b6", glow: "rgba(244,114,182,0.8)", bg: "linear-gradient(135deg,#200010,#1a0030)", glowRgb: "244,114,182" },
    { fg: "#34d399", glow: "rgba(52,211,153,0.8)",  bg: "linear-gradient(135deg,#001a10,#003020)", glowRgb: "52,211,153"  },
    { fg: "#a78bfa", glow: "rgba(167,139,250,0.8)", bg: "linear-gradient(135deg,#180030,#0a0040)", glowRgb: "167,139,250" },
    { fg: "#fbbf24", glow: "rgba(251,191,36,0.8)",  bg: "linear-gradient(135deg,#1a1000,#2a1400)", glowRgb: "251,191,36"  },
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
  const [hovered, setHovered] = useState(false);

  const palette = colorForCharacter(character.id);
  const letter = character.name.charAt(0).toUpperCase();
  const subjectId = `SUBJ #${String(index + 1).padStart(3, "0")}-${letter}`;

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
      className="group relative block rounded-[18px] overflow-hidden"
      style={{
        width: 280,
        minWidth: 280,
        height: 380,
        border: `1px solid rgba(${palette.glowRgb}, ${hovered ? 0.45 : 0.18})`,
        boxShadow: hovered
          ? `0 30px 60px rgba(0,0,0,0.55), 0 0 40px rgba(${palette.glowRgb},0.14), 0 0 0 1px rgba(${palette.glowRgb},0.06)`
          : "0 4px 20px rgba(0,0,0,0.25)",
        transform: hovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        background: "#0c0520cc",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${palette.glowRgb},0.65), transparent)`,
          opacity: hovered ? 1 : 0.5,
        }}
      />

      {/* Featured badge */}
      <span
        className="absolute top-3 left-3 z-20 text-[8px] tracking-[3px] bg-black/60 backdrop-blur-sm px-2 py-1 rounded border"
        style={{
          fontFamily: "var(--font-mono)",
          color: `rgba(${palette.glowRgb}, 0.9)`,
          borderColor: `rgba(${palette.glowRgb}, 0.35)`,
        }}
      >
        ◈ FEATURED
      </span>

      {/* Subject ID */}
      <span
        className="absolute top-3 right-12 z-10 text-[7px] tracking-[2px]"
        style={{ fontFamily: "var(--font-mono)", color: `rgba(${palette.glowRgb}, 0.25)` }}
      >
        {subjectId}
      </span>

      {/* Favorite heart */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        aria-label="Toggle favorite"
        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/70 transition-all duration-200"
        style={{ boxShadow: favorited ? "0 0 8px rgba(0,229,255,0.4)" : "none" }}
      >
        <svg
          width="15" height="15" viewBox="0 0 24 24"
          fill={favorited ? "#00e5ff" : "none"}
          stroke={favorited ? "#00e5ff" : "rgba(255,255,255,0.5)"}
          strokeWidth="2"
          style={{ filter: favorited ? "drop-shadow(0 0 5px rgba(0,229,255,0.7))" : "none", transition: "all 0.2s" }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Avatar area */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ background: palette.bg, height: 260 }}
      >
        {/* Scan line */}
        <div
          className="animate-card-scan left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"
          style={{ animationDelay: `${(index % 4) * 0.7}s` }}
        />

        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-600"
            style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
            loading="lazy"
          />
        ) : (
          <span
            className="relative z-10 text-[96px] font-black transition-all duration-300"
            style={{
              fontFamily: "var(--font-display)",
              color: palette.fg,
              textShadow: hovered
                ? `0 0 50px ${palette.glow}, 0 0 12px ${palette.glow}`
                : `0 0 36px ${palette.glow}`,
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

      {/* Info overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 pt-10 transition-all duration-300"
        style={{
          background: `linear-gradient(to top, #0c0520 0%, rgba(12,5,32,0.92) 60%, transparent 100%)`,
        }}
      >
        <div
          className="text-[20px] font-bold tracking-[2px] truncate mb-1 transition-all duration-250"
          style={{
            fontFamily: "var(--font-display)",
            color: palette.fg,
            textShadow: hovered
              ? `0 0 16px rgba(${palette.glowRgb},0.8), 0 0 4px rgba(${palette.glowRgb},0.4)`
              : `0 0 10px rgba(${palette.glowRgb},0.5)`,
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

        {/* Stats row + CHAT CTA */}
        <div className="flex items-center justify-between mt-1">
          <div
            className="text-[8px] tracking-[1.5px] text-[#7a6a9a] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {character.gender_pronouns} · {character.chat_count.toLocaleString()} CHATS
          </div>
          <span
            className="text-[8px] tracking-[2px] px-2 py-1 rounded border transition-all duration-250"
            style={{
              fontFamily: "var(--font-mono)",
              color: `rgba(${palette.glowRgb}, ${hovered ? 1 : 0.5})`,
              borderColor: `rgba(${palette.glowRgb}, ${hovered ? 0.4 : 0.15})`,
              background: `rgba(${palette.glowRgb}, ${hovered ? 0.1 : 0})`,
              boxShadow: hovered ? `0 0 8px rgba(${palette.glowRgb},0.2)` : "none",
            }}
          >
            CHAT →
          </span>
        </div>
      </div>
    </Link>
  );
}
