import React from "react";

interface DnaLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function DnaLogo({ className = "", size = 32, style }: DnaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M18 6 Q32 18 46 6" stroke="#00e5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M18 18 Q32 30 46 18" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M18 30 Q32 42 46 30" stroke="#00e5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M18 42 Q32 54 46 42" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="18" y1="6" x2="18" y2="50" stroke="#00e5ff" strokeWidth="1.5" opacity="0.35" />
      <line x1="46" y1="6" x2="46" y2="50" stroke="#7c3aed" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}
