"use client";

import { useState, useEffect } from "react";
import { GENDER_PRESETS } from "@/lib/create/types";

interface GenderPronounsSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenderPronounsSelect({ value, onChange }: GenderPronounsSelectProps) {
  const [mode, setMode] = useState<"preset" | "custom">(
    !value || (GENDER_PRESETS as readonly string[]).includes(value) ? "preset" : "custom"
  );
  const [customText, setCustomText] = useState(mode === "custom" ? value : "");

  useEffect(() => {
    if (mode === "custom") onChange(customText.trim());
  }, [customText, mode, onChange]);

  return (
    <div>
      {mode === "preset" ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setMode("custom");
                setCustomText("");
                onChange("");
              } else {
                onChange(e.target.value);
              }
            }}
            className="w-full bg-transparent text-sm text-[#e2d9f3] focus:outline-none appearance-none cursor-pointer pr-5"
            style={{ fontFamily: "var(--font-body)", colorScheme: "dark" }}
          >
            <option value="" disabled style={{ background: "#08041a", color: "#3a2a5a" }}>
              Choose gender · pronouns
            </option>
            {GENDER_PRESETS.map((g) => (
              <option key={g} value={g} style={{ background: "#08041a" }}>
                {g}
              </option>
            ))}
            <option value="__custom__" style={{ background: "#08041a", color: "#a78bfa" }}>
              + Custom (type your own)
            </option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.45)" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Xenogender · xe/xem"
              autoFocus
              maxLength={60}
              className="flex-1 bg-transparent text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <button
              type="button"
              onClick={() => { setMode("preset"); setCustomText(""); onChange(""); }}
              className="text-[9px] tracking-[1.5px] flex-shrink-0 transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.7)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00e5ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.7)"; }}
            >
              ← PRESET
            </button>
          </div>
          <p className="text-[9px]" style={{ fontFamily: "var(--font-body)", color: "rgba(90,74,122,0.55)" }}>
            Format: <span style={{ color: "rgba(0,229,255,0.4)" }}>gender · pronouns</span> — stored as a single paired string
          </p>
        </div>
      )}
    </div>
  );
}
