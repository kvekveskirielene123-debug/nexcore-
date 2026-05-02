"use client";

import type { ExploreFilters } from "@/lib/queries/exploreTypes";
import { DEFAULT_FILTERS } from "@/lib/queries/exploreTypes";

interface FilterPillsProps {
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
}

export function FilterPills({ filters, onChange }: FilterPillsProps) {
  const pills: { key: string; label: string; onRemove: () => void }[] = [];

  filters.genders.forEach((g) => {
    pills.push({
      key: `gender:${g}`,
      label: g,
      onRemove: () =>
        onChange({
          ...filters,
          genders: filters.genders.filter((x) => x !== g),
        }),
    });
  });

  if (filters.showNsfw) {
    pills.push({
      key: "nsfw",
      label: "NSFW on",
      onRemove: () => onChange({ ...filters, showNsfw: false }),
    });
  }

  if (filters.creator !== "all") {
    pills.push({
      key: "creator",
      label: filters.creator === "platform" ? "Nexcor only" : "Community only",
      onRemove: () => onChange({ ...filters, creator: "all" }),
    });
  }

  if (filters.minRating > 0) {
    pills.push({
      key: "rating",
      label: `${filters.minRating}+ stars`,
      onRemove: () => onChange({ ...filters, minRating: 0 }),
    });
  }

  if (pills.length === 0) return null;

  const clearAll = () => onChange({ ...DEFAULT_FILTERS, search: filters.search });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={p.onRemove}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-[10px] tracking-[1.5px] text-cyan-400 hover:bg-cyan-400/15 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {p.label}
          <span className="text-cyan-400/70">×</span>
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-[9px] tracking-[2px] text-[#7a6a9a] hover:text-cyan-400 underline-offset-2 hover:underline transition-colors"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        CLEAR ALL
      </button>
    </div>
  );
}
