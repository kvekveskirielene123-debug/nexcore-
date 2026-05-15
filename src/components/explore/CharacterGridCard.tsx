"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleFavorite } from "@/lib/queries/favoriteActions";
import type { Character } from "@/lib/queries/exploreTypes";

interface CharacterGridCardProps {
  character: Character;
  index: number;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
  rank?: number;
  badge?: string;
}

function colorForCharacter(id: string): { fg: string; glow: string; bg: string; glowRgb: string } {
  const palettes = [
    { fg: "#00e5ff", glow: "rgba(0,229,255,0.8)",   bg: "linear-gradient(160deg,#0d0030 0%,#041830 100%)", glowRgb: "0,229,255"   },
    { fg: "#f472b6", glow: "rgba(244,114,182,0.8)", bg: "linear-gradient(160deg,#200010 0%,#1a0030 100%)", glowRgb: "244,114,182" },
    { fg: "#34d399", glow: "rgba(52,211,153,0.8)",  bg: "linear-gradient(160deg,#001a10 0%,#003020 100%)", glowRgb: "52,211,153"  },
    { fg: "#a78bfa", glow: "rgba(167,139,250,0.8)", bg: "linear-gradient(160deg,#180030 0%,#0a0040 100%)", glowRgb: "167,139,250" },
    { fg: "#fbbf24", glow: "rgba(251,191,36,0.8)",  bg: "linear-gradient(160deg,#1a1000 0%,#2a1400 100%)", glowRgb: "251,191,36"  },
  ];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

function rankStyle(rank: number) {
  if (rank === 1) return { color: "#ffd700", glow: "rgba(255,215,0,0.9)" };
  if (rank === 2) return { color: "#c0c0c0", glow: "rgba(192,192,192,0.9)" };
  if (rank === 3) return { color: "#cd7f32", glow: "rgba(205,127,50,0.9)" };
  return { color: "rgba(226,217,243,0.65)", glow: "rgba(226,217,243,0.35)" };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function CharacterGridCard({
  character,
  index,
  isFavorited = false,
  isLoggedIn = false,
  rank,
  badge,
}: CharacterGridCardProps) {
  const [favorited,        setFavorited]        = useState(isFavorited);
  const [loading,          setLoading]          = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [hovered,          setHovered]          = useState(false);

  const palette      = colorForCharacter(character.id);
  const letter       = character.name.charAt(0).toUpperCase();
  const creatorRgb   = character.is_platform ? "0,229,255" : "167,139,250";
  const creatorLabel = character.is_platform ? "@nexcor"   : "@community";

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
      setFavorited(await toggleFavorite(character.id, favorited));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "3/4",
        border: `1px solid rgba(${palette.glowRgb},${hovered ? 0.5 : 0.18})`,
        boxShadow: hovered
          ? `0 24px 52px rgba(0,0,0,0.6), 0 0 40px rgba(${palette.glowRgb},0.15), 0 0 0 1px rgba(${palette.glowRgb},0.06)`
          : "0 4px 20px rgba(0,0,0,0.35)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition:
          "border-color 0.28s ease, box-shadow 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        background: "rgba(12,5,32,0.85)",
        backdropFilter: "blur(2px)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${palette.glowRgb},0.7), transparent)`,
          opacity: hovered ? 1 : 0.35,
        }}
      />

      {/* ── Top-left: rank badge or custom badge ── */}
      {rank != null ? (
        <span
          className="absolute top-2.5 left-2.5 z-20 text-[12px] font-black leading-none"
          style={{
            fontFamily: "var(--font-display)",
            color: rankStyle(rank).color,
            textShadow: `0 0 14px ${rankStyle(rank).glow}`,
          }}
        >
          #{rank}
        </span>
      ) : badge ? (
        <span
          className="absolute top-2.5 left-2.5 z-20 text-[7px] tracking-[2.5px] uppercase px-2 py-1 rounded"
          style={{
            fontFamily: "var(--font-mono)",
            color: `rgba(${palette.glowRgb},0.95)`,
            background: "rgba(0,0,0,0.55)",
            border: `1px solid rgba(${palette.glowRgb},0.35)`,
            backdropFilter: "blur(6px)",
          }}
        >
          {badge}
        </span>
      ) : null}

      {/* ── Top-right: favorite button ── */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-2 right-2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/70 active:scale-90 transition-all duration-200"
        style={{ boxShadow: favorited ? "0 0 10px rgba(0,229,255,0.5)" : "none" }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill={favorited ? "#00e5ff" : "none"}
          stroke={favorited ? "#00e5ff" : "rgba(255,255,255,0.5)"}
          strokeWidth="2"
          style={{
            filter: favorited ? "drop-shadow(0 0 5px rgba(0,229,255,0.7))" : "none",
            transition: "all 0.2s",
          }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {showLoginTooltip && (
          <span
            className="absolute top-9 right-0 whitespace-nowrap bg-black/90 border border-cyan-400/30 text-cyan-400 text-[8px] tracking-wider px-2 py-1 rounded pointer-events-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SIGN UP TO SAVE
          </span>
        )}
      </button>

      {/* NSFW dot */}
      {character.is_nsfw && (
        <span
          className="absolute z-20 w-2 h-2 rounded-full"
          style={{
            bottom: "37%",
            left: 10,
            background: "#f59e0b",
            boxShadow: "0 0 8px rgba(245,158,11,0.8)",
          }}
          aria-label="NSFW"
        />
      )}

      {/* ── Image area (63%) ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "63%", background: palette.bg }}
      >
        {/* Ambient scanline */}
        <div
          className="animate-card-scan left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"
          style={{ animationDelay: `${(index % 6) * 0.52}s` }}
        />

        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Radial glow behind letter */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 55% at 50% 60%, rgba(${palette.glowRgb},${hovered ? 0.18 : 0.1}) 0%, transparent 70%)`,
              }}
            />
            <span
              className="relative z-10 font-black transition-all duration-300 select-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem,10cqi,5rem)",
                color: palette.fg,
                textShadow: hovered
                  ? `0 0 60px ${palette.glow}, 0 0 16px ${palette.glow}`
                  : `0 0 36px ${palette.glow}`,
              }}
            >
              {letter}
            </span>
          </div>
        )}

        {/* Platform badge */}
        {character.is_platform && (
          <span
            className="absolute bottom-2 right-2 text-[7px] tracking-[1.5px] text-cyan-400 bg-black/55 backdrop-blur-sm px-1.5 py-0.5 rounded border border-cyan-400/30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR
          </span>
        )}

        {/* CHAT CTA — fades in on hover */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none transition-opacity duration-250"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 52%)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <span
            className="text-[10px] tracking-[3px] font-bold px-3 py-1.5 rounded-full border"
            style={{
              fontFamily: "var(--font-mono)",
              color: palette.fg,
              borderColor: `rgba(${palette.glowRgb},0.55)`,
              background: `rgba(${palette.glowRgb},0.14)`,
              boxShadow: `0 0 16px rgba(${palette.glowRgb},0.4)`,
              backdropFilter: "blur(4px)",
            }}
          >
            CHAT →
          </span>
        </div>
      </div>

      {/* ── Info panel (37%) — glassmorphism ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col justify-between"
        style={{
          height: "37%",
          padding: "10px 12px",
          background: `rgba(5,2,13,${hovered ? 0.93 : 0.88})`,
          backdropFilter: "blur(14px)",
          borderTop: `1px solid rgba(${palette.glowRgb},${hovered ? 0.2 : 0.07})`,
          transition: "background 0.28s ease, border-color 0.28s ease",
        }}
      >
        {/* Name + creator */}
        <div className="min-w-0">
          <div
            className="font-bold tracking-[1.5px] truncate leading-tight transition-all duration-200"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(12px,3.5cqi,15px)",
              color: palette.fg,
              textShadow: hovered ? `0 0 14px rgba(${palette.glowRgb},0.65)` : "none",
            }}
          >
            {character.name}
          </div>

          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span
              className="text-[7px] tracking-[1.5px] uppercase flex-shrink-0"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${creatorRgb},0.7)` }}
            >
              ◈ {creatorLabel}
            </span>
            {character.subtitle && (
              <span
                className="text-[8px] italic truncate min-w-0"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(122,106,154,0.5)",
                }}
              >
                · {character.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Chat count */}
            {character.chat_count > 0 && (
              <span
                className="flex items-center gap-1 text-[9px] tabular-nums leading-none"
                style={{ fontFamily: "var(--font-mono)", color: `rgba(${palette.glowRgb},0.55)` }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {fmt(character.chat_count)}
              </span>
            )}

            {/* Heart (reflects favorited state) */}
            <span
              className="flex items-center gap-1 text-[9px] leading-none transition-colors duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                color: favorited ? "rgba(0,229,255,0.85)" : "rgba(122,106,154,0.35)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24"
                fill={favorited ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="2"
                style={{ filter: favorited ? "drop-shadow(0 0 4px rgba(0,229,255,0.7))" : "none", transition: "all 0.2s" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
          </div>

          {/* Gender · tier */}
          <span
            className="text-[7px] tracking-[1px] uppercase truncate max-w-[72px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.38)" }}
          >
            {character.gender_pronouns?.split(" · ")[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
