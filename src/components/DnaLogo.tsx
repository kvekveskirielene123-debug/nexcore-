"use client";

import React, { useState } from "react";

interface DnaLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  /** When true, hovering plays a scan-sweep animation and a cyan glow */
  interactive?: boolean;
}

export function DnaLogo({ className = "", size = 32, style, interactive = false }: DnaLogoProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative overflow-hidden"
      style={{ width: size, height: size, display: "inline-block", flexShrink: 0 }}
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        style={{
          ...style,
          display: "block",
          transition: "filter 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          filter: hovered
            ? "drop-shadow(0 0 5px rgba(0,229,255,1)) drop-shadow(0 0 14px rgba(0,229,255,0.45)) drop-shadow(0 0 3px rgba(124,58,237,0.55))"
            : "none",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        {/* Cyan strands — brighten on hover */}
        <path
          d="M18 6 Q32 18 46 6"
          stroke="#00e5ff"
          strokeWidth={hovered ? "3.2" : "2.5"}
          fill="none"
          strokeLinecap="round"
          style={{ transition: "stroke-width 0.38s" }}
        />
        <path
          d="M18 30 Q32 42 46 30"
          stroke="#00e5ff"
          strokeWidth={hovered ? "3.2" : "2.5"}
          fill="none"
          strokeLinecap="round"
          style={{ transition: "stroke-width 0.38s" }}
        />

        {/* Purple strands — glow on hover */}
        <path
          d="M18 18 Q32 30 46 18"
          stroke="#7c3aed"
          strokeWidth={hovered ? "2.5" : "2"}
          fill="none"
          strokeLinecap="round"
          style={{ transition: "stroke-width 0.38s, opacity 0.38s", opacity: hovered ? 1 : 0.8 }}
        />
        <path
          d="M18 42 Q32 54 46 42"
          stroke="#7c3aed"
          strokeWidth={hovered ? "2.5" : "2"}
          fill="none"
          strokeLinecap="round"
          style={{ transition: "stroke-width 0.38s, opacity 0.38s", opacity: hovered ? 1 : 0.8 }}
        />

        {/* Vertical spine lines */}
        <line
          x1="18" y1="6" x2="18" y2="50"
          stroke="#00e5ff"
          strokeWidth="1.5"
          style={{ transition: "opacity 0.38s", opacity: hovered ? 0.65 : 0.35 }}
        />
        <line
          x1="46" y1="6" x2="46" y2="50"
          stroke="#7c3aed"
          strokeWidth="1.5"
          style={{ transition: "opacity 0.38s", opacity: hovered ? 0.65 : 0.35 }}
        />
      </svg>

      {/* Scan-sweep line — plays on hover */}
      {interactive && (
        <span
          aria-hidden="true"
          className={hovered ? "animate-logo-scan" : ""}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            top: hovered ? undefined : "-4px",
            opacity: hovered ? undefined : 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.95) 45%, rgba(255,255,255,0.7) 50%, rgba(0,229,255,0.95) 55%, transparent 100%)",
            pointerEvents: "none",
            boxShadow: "0 0 6px rgba(0,229,255,0.8)",
          }}
        />
      )}
    </span>
  );
}
