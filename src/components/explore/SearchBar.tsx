"use client";

import { useEffect, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by name, trait, or fragment...",
}: SearchBarProps) {
  const [local, setLocal] = useState(value);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" opacity="0.6">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#08041a] border border-purple-700/25 rounded-xl pl-11 pr-4 py-3.5 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_0_1px_rgba(0,229,255,0.15),0_0_24px_rgba(0,229,255,0.08)] transition-all duration-200"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}
      />

      {/* Easter egg: terminal prompt marker */}
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] tracking-[2px] text-purple-500/25 pointer-events-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        324B21
      </span>
    </div>
  );
}
