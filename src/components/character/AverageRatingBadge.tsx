"use client";

import { HexRating } from "./HexRating";
import { RATING_REVEAL_THRESHOLD } from "@/lib/ratings/helpers";

interface AverageRatingBadgeProps {
  /** Total number of ratings the character has received. */
  ratingCount: number;
  /** Public average (only set when ratingCount >= reveal threshold). May be null. */
  average: number | null;
  /** Compact size for cards, default md for profile. */
  size?: "sm" | "md";
  /** Show count next to hexes. Default true. */
  showCount?: boolean;
}

/**
 * Read-only display of a character's average rating.
 *
 * Below the reveal threshold (5 ratings):
 *   - shows "◈ AWAITING DESIGNATIONS · X / 5"
 *
 * At or above the threshold:
 *   - shows rounded hex cells + count
 */
export function AverageRatingBadge({
  ratingCount,
  average,
  size = "md",
  showCount = true,
}: AverageRatingBadgeProps) {
  const revealed = ratingCount >= RATING_REVEAL_THRESHOLD && average !== null;

  if (!revealed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-purple-700/20 bg-[#08041a]/40">
        <span
          className="text-[8px] tracking-[2px] uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            color: "rgba(122,106,154,0.55)",
          }}
        >
          ◈ AWAITING · {ratingCount} / {RATING_REVEAL_THRESHOLD}
        </span>
      </div>
    );
  }

  const rounded = Math.round(average ?? 0);

  return (
    <div className="inline-flex items-center gap-2">
      <HexRating value={rounded} size={size} disabled />
      {showCount && (
        <span
          className="text-[10px] tracking-[1.5px] text-[#a78bfa]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {(average ?? 0).toFixed(1)} · {ratingCount.toLocaleString()} ratings
        </span>
      )}
    </div>
  );
}
