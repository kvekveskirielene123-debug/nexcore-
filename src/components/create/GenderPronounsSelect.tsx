"use client";

import { useState, useEffect } from "react";
import { GENDER_PRESETS } from "@/lib/create/types";

interface GenderPronounsSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenderPronounsSelect({ value, onChange }: GenderPronounsSelectProps) {
  // Determine initial mode based on incoming value
  const [mode, setMode] = useState<"preset" | "custom">(
    !value || (GENDER_PRESETS as readonly string[]).includes(value)
      ? "preset"
      : "custom"
  );
  const [customText, setCustomText] = useState(
    mode === "custom" ? value : ""
  );

  useEffect(() => {
    if (mode === "custom") onChange(customText.trim());
  }, [customText, mode, onChange]);

  return (
    <div className="space-y-2">
      {mode === "preset" ? (
        <>
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
            className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] focus:outline-none focus:border-cyan-400/40 transition-all"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="" disabled className="bg-[#08041a]">
              Choose gender · pronouns
            </option>
            {GENDER_PRESETS.map((g) => (
              <option key={g} value={g} className="bg-[#08041a]">
                {g}
              </option>
            ))}
            <option value="__custom__" className="bg-[#08041a]">
              + Custom (type your own)
            </option>
          </select>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Xenogender · xe/xem"
              autoFocus
              maxLength={60}
              className="flex-1 bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <button
              type="button"
              onClick={() => {
                setMode("preset");
                setCustomText("");
                onChange("");
              }}
              className="text-[10px] tracking-[2px] text-[#7a6a9a] hover:text-cyan-400 px-3 py-2 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← USE PRESET
            </button>
          </div>
          <p
            className="text-[10px] text-[#7a6a9a]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Format as <code>gender · pronouns</code> — it&apos;s stored as a single paired string.
          </p>
        </>
      )}
    </div>
  );
}
