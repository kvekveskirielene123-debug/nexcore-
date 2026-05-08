"use client";

import { useState } from "react";
import type { ExploreFilters, SortOption } from "@/lib/queries/exploreTypes";
import { GENDER_OPTIONS, DISCOVERY_TAGS } from "@/lib/queries/exploreTypes";

interface FilterPanelProps {
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  userCanSeeNsfw: boolean;
}

export function FilterPanel({ filters, onChange, userCanSeeNsfw }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const toggleGender = (g: string) => {
    const set = new Set(filters.genders);
    if (set.has(g)) set.delete(g);
    else set.add(g);
    onChange({ ...filters, genders: Array.from(set) });
  };

  const toggleTag = (t: string) => {
    const set = new Set(filters.tags);
    if (set.has(t)) set.delete(t);
    else set.add(t);
    onChange({ ...filters, tags: Array.from(set) });
  };

  const activeCount =
    filters.genders.length +
    (filters.showNsfw ? 1 : 0) +
    (filters.creator !== "all" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.tags?.length ?? 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 border border-purple-700/25 rounded-lg bg-[#08041a] text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 hover:text-cyan-400 transition-all"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        FILTER
        {activeCount > 0 && (
          <span className="bg-cyan-400 text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-full right-0 mt-2 z-50 w-80 rounded-xl border border-purple-700/30 bg-[#0c0520]/95 backdrop-blur-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-xl" />

            <div className="mb-4">
              <h3
                className="text-[10px] tracking-[3px] text-[#00e5ff] mb-3 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ GENDER / PRONOUNS
              </h3>
              <div className="flex flex-col gap-1.5">
                {GENDER_OPTIONS.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 text-[12px] text-[#c0b8d8] hover:text-white cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.genders.includes(g)}
                      onChange={() => toggleGender(g)}
                      className="w-3.5 h-3.5 rounded accent-cyan-400"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            {userCanSeeNsfw && (
              <div className="mb-4 pb-4 border-b border-purple-700/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div
                      className="text-[10px] tracking-[3px] text-[#00e5ff] uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ◈ SHOW NSFW
                    </div>
                    <div
                      className="text-[11px] text-[#7a6a9a] mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Mature content from creators
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onChange({ ...filters, showNsfw: !filters.showNsfw })
                    }
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      filters.showNsfw ? "bg-cyan-400/80" : "bg-purple-900/40"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        filters.showNsfw ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4 pb-4 border-b border-purple-700/20">
              <h3
                className="text-[10px] tracking-[3px] text-[#00e5ff] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ TAGS
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {DISCOVERY_TAGS.map((tag) => {
                  const active = filters.tags?.includes(tag) ?? false;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] tracking-[1px] border transition-all ${
                        active
                          ? "border-cyan-400/60 text-cyan-400 bg-cyan-400/8"
                          : "border-purple-700/25 text-[#7a6a9a] hover:border-purple-500/50"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-1">
              <h3
                className="text-[10px] tracking-[3px] text-[#00e5ff] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ CREATOR
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { value: "all", label: "ALL" },
                  { value: "platform", label: "NEXCOR" },
                  { value: "community", label: "COMMUNITY" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onChange({ ...filters, creator: opt.value as any })
                    }
                    className={`px-3 py-1.5 rounded-md text-[10px] tracking-[1.5px] border transition-all ${
                      filters.creator === opt.value
                        ? "border-cyan-400/60 text-cyan-400 bg-cyan-400/5"
                        : "border-purple-700/25 text-[#7a6a9a] hover:border-purple-500/50"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  const options: { value: SortOption; label: string }[] = [
    { value: "newest", label: "NEWEST FIRST" },
    { value: "popular", label: "MOST POPULAR" },
    { value: "alphabetical", label: "A → Z" },
  ];

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 border border-purple-700/25 rounded-lg bg-[#08041a] text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 hover:text-cyan-400 transition-all min-w-[160px] justify-between"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>{current?.label ?? "SORT"}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-48 rounded-xl border border-purple-700/30 bg-[#0c0520]/95 backdrop-blur-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[11px] tracking-[2px] transition-colors ${
                  value === opt.value
                    ? "text-cyan-400 bg-cyan-400/5"
                    : "text-[#c0b8d8] hover:bg-purple-900/20"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
