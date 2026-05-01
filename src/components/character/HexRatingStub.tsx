"use client";

/**
 * Hexagonal cell rating stub — visual only for Package A.
 * Will be replaced with interactive + DB-backed version in Package D.
 *
 * Shows 5 hex cells. In this stub: all faint purple outlines,
 * hover tooltip says "Ratings launching soon".
 */

interface HexRatingStubProps {
  /** Optional: preview an aggregate rating (filled hexes). 0-5. Default 0. */
  preview?: number;
}

export function HexRatingStub({ preview = 0 }: HexRatingStubProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-purple-700/20 bg-[#08041a]/60 cursor-help"
      title="Ratings launching soon · 324B21"
    >
      <span
        className="text-[9px] tracking-[2px] uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(122,106,154,0.55)",
        }}
      >
        Rating
      </span>
      <div className="flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => {
          const active = i < preview;
          return (
            <svg
              key={i}
              width="14"
              height="16"
              viewBox="0 0 22 24"
              fill="none"
            >
              <polygon
                points="11,1.5 20,6.5 20,17.5 11,22.5 2,17.5 2,6.5"
                fill={active ? "rgba(0,229,255,0.18)" : "transparent"}
                stroke={active ? "#00e5ff" : "rgba(124,58,237,0.35)"}
                strokeWidth="1.5"
                style={{
                  filter: active
                    ? "drop-shadow(0 0 4px rgba(0,229,255,0.55))"
                    : "none",
                }}
              />
              {/* Inner membrane dot for extra bio detail */}
              <circle
                cx="11"
                cy="12"
                r={active ? 2.2 : 1.4}
                fill={active ? "#00e5ff" : "rgba(124,58,237,0.3)"}
              />
            </svg>
          );
        })}
      </div>
      <span
        className="text-[8px] tracking-[1.5px] uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(122,106,154,0.35)",
        }}
      >
        SOON
      </span>
    </div>
  );
}
