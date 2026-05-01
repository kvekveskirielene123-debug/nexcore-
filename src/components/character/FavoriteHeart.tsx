"use client";

import { useFavorite } from "@/lib/favorites/useFavorite";

interface FavoriteHeartProps {
  characterId: string;
  initialFavorited?: boolean;
  size?: number;
}

/**
 * Compact heart toggle for use on character cards
 * (Explore page, Favorites rail, Homepage showcase, etc.)
 *
 * Click stops propagation so it doesn't navigate the card.
 */
export function FavoriteHeart({
  characterId,
  initialFavorited,
  size = 18,
}: FavoriteHeartProps) {
  const [favorited, toggle] = useFavorite(characterId, initialFavorited);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-label={favorited ? "Remove favorite" : "Add favorite"}
      aria-pressed={favorited}
      className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
        favorited
          ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          : "border-purple-700/30 bg-black/40 text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400"
      }`}
    >
      <svg
        width={size - 4}
        height={size - 4}
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
