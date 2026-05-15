"use client";

import { useState } from "react";

interface HexRatingProps {
  /** Current value to display (1-5). Null means unrated. */
  value: number | null;
  /** Hover preview value (the "if I clicked this" preview). Null when not hovering. */
  hoverValue?: number | null;
  /** Called when a cell is clicked. Receives the cell number 1-5. */
  onClick?: (rating: number) => void;
  /** Called on hover state change. Pass null when leaving. */
  onHover?: (rating: number | null) => void;
  /** Pulse cyan briefly (used after rating submission). */
  pulsing?: boolean;
  /** Disable interaction entirely (locked / read-only state). */
  disabled?: boolean;
  /** Larger size for primary profile UI; default is compact for badges. */
  size?: "sm" | "md" | "lg";
}

/**
 * Five hexagonal Petri-dish cells.
 *
 * Visual states per cell:
 *   - active (filled cyan, glowing) — when index < value
 *   - preview (filled cyan, slightly muted) — when index < hoverValue
 *   - inactive (faint purple outline)
 *   - disabled (very faint, no interaction)
 */
export function HexRating({
  value,
  hoverValue = null,
  onClick,
  onHover,
  pulsing = false,
  disabled = false,
  size = "md",
}: HexRatingProps) {
  const dims = {
    sm: { w: 14, h: 16, gap: 3 },
    md: { w: 18, h: 20, gap: 4 },
    lg: { w: 26, h: 30, gap: 5 },
  }[size];

  // Effective fill count: prefer hoverValue when interactive
  const effective = hoverValue ?? value ?? 0;

  return (
    <div
      className="inline-flex items-center"
      style={{ gap: dims.gap }}
      onMouseLeave={() => onHover?.(null)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const isActive = i <= effective;
        const isCommitted = value !== null && i <= value;
        const fill = isActive ? "rgba(0,229,255,0.22)" : "transparent";
        const stroke = isActive ? "#00e5ff" : disabled ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.4)";
        const dotFill = isActive
          ? "#00e5ff"
          : disabled
          ? "rgba(124,58,237,0.2)"
          : "rgba(124,58,237,0.35)";
        const filter =
          isActive
            ? `drop-shadow(0 0 ${size === "lg" ? 6 : 4}px rgba(0,229,255,0.6))`
            : "none";

        return (
          <button
            type="button"
            key={i}
            disabled={disabled}
            onClick={() => !disabled && onClick?.(i)}
            onMouseEnter={() => !disabled && onHover?.(i)}
            aria-label={`Rate ${i} of 5`}
            className={`flex-shrink-0 ${
              disabled ? "cursor-not-allowed" : onClick ? "cursor-pointer" : "cursor-default"
            } transition-transform hover:scale-110`}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              animation: pulsing && isCommitted ? `hexPulse 1.4s ease-out` : undefined,
            }}
          >
            <svg width={dims.w} height={dims.h} viewBox="0 0 22 24" fill="none">
              <polygon
                points="11,1.5 20,6.5 20,17.5 11,22.5 2,17.5 2,6.5"
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                style={{ filter, transition: "fill 0.18s, stroke 0.18s, filter 0.18s" }}
              />
              <circle
                cx="11"
                cy="12"
                r={isActive ? 2.4 : 1.4}
                fill={dotFill}
                style={{ transition: "r 0.18s, fill 0.18s" }}
              />
            </svg>
          </button>
        );
      })}

    </div>
  );
}
