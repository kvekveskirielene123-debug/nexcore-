"use client";

import { useState, useMemo } from "react";
import { PRESET_TAGS, MAX_TAGS } from "@/lib/personas/types";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const lowerValue = useMemo(() => value.map((t) => t.toLowerCase()), [value]);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q && !focused) return [];
    const filtered = PRESET_TAGS.filter(
      (t) => !lowerValue.includes(t.toLowerCase())
    );
    if (!q) return filtered.slice(0, 12);
    return filtered.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
  }, [input, focused, lowerValue]);

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (t.length > 30) return;
    if (lowerValue.includes(t.toLowerCase())) return;
    if (value.length >= MAX_TAGS) return;
    onChange([...value, t]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const remaining = MAX_TAGS - value.length;

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#08041a] border ${
          focused ? "border-cyan-400/40" : "border-purple-700/25"
        } transition-all min-h-[44px]`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-cyan-400/30 bg-cyan-400/8 text-[11px] tracking-[1px] text-cyan-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-cyan-400/70 hover:text-red-400 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}

        {value.length < MAX_TAGS && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={value.length === 0 ? "Add tags · press Enter to confirm" : "+ add tag"}
            className="flex-1 min-w-[100px] bg-transparent text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <p
          className="text-[10px] text-[#7a6a9a]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Type & press <span className="text-cyan-400">Enter</span> · or pick from suggestions
        </p>
        <span
          className={`text-[9px] tracking-[1px] ${
            remaining <= 2 ? "text-amber-400" : "text-[#7a6a9a]"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {value.length}/{MAX_TAGS}
        </span>
      </div>

      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-purple-700/30 bg-[#0c0520]/95 backdrop-blur-md p-2 max-h-60 overflow-y-auto">
          <div
            className="text-[8px] tracking-[2px] text-[#7a6a9a] uppercase mb-1.5 px-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ SUGGESTIONS
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
                className="px-2 py-1 rounded-md border border-purple-700/25 text-[11px] text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
