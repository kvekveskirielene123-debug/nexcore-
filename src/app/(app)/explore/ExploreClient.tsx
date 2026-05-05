"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchFilteredClient } from "@/lib/queries/exploreQueriesClient";
import type { Character, ExploreFilters } from "@/lib/queries/exploreTypes";
import { DEFAULT_FILTERS } from "@/lib/queries/exploreTypes";

import { SearchBar } from "@/components/explore/SearchBar";
import { FilterPanel, SortDropdown } from "@/components/explore/FilterPanel";
import { FilterPills } from "@/components/explore/FilterPills";
import { CharacterRail } from "@/components/explore/CharacterRail";
import { CharacterGridCard } from "@/components/explore/CharacterGridCard";
import { EmptyState } from "@/components/explore/EmptyState";
import { ExploreRightSidebar } from "@/components/explore/ExploreRightSidebar";

interface ExploreClientProps {
  initialFeatured: Character[];
  initialTrending: Character[];
  initialNew: Character[];
  initialFavorites: Character[];
  favoriteIds: string[];
  isLoggedIn: boolean;
  userCanSeeNsfw: boolean;
  username: string | null;
}

const TABS = [
  { key: "all",       label: "All" },
  { key: "featured",  label: "Featured" },
  { key: "trending",  label: "Trending" },
  { key: "new",       label: "New" },
  { key: "nexcor",    label: "Nexcor" },
  { key: "community", label: "Community" },
] as const;

type TabKey = typeof TABS[number]["key"];

/* ── Shared layout helpers ──────────────────────────────────────────────── */

function SectionHeader({
  title,
  subtitle,
  accentRgb = "0,229,255",
}: {
  title: string;
  subtitle?: string;
  accentRgb?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="w-0.5 h-6 rounded-full flex-shrink-0"
        style={{
          background: `linear-gradient(to bottom, rgba(${accentRgb},0.7), rgba(124,58,237,0.35))`,
          boxShadow: `0 0 8px rgba(${accentRgb},0.4)`,
        }}
      />
      <div>
        <h2
          className="text-[14px] tracking-[3px] text-white uppercase leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-[9px] tracking-[2px] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${accentRgb},0.35)` }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

function CardGridSkeleton({ count }: { count: number }) {
  return (
    <CardGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-purple-700/10 animate-pulse"
          style={{ aspectRatio: "3/4", background: "rgba(12,5,32,0.6)" }}
        />
      ))}
    </CardGrid>
  );
}

function CreateCard() {
  return (
    <Link
      href="/create"
      className="group relative block rounded-2xl overflow-hidden border bg-[#0c0520]/80 flex flex-col items-center justify-center"
      style={{
        aspectRatio: "3/4",
        borderColor: "rgba(0,229,255,0.18)",
        transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(0,229,255,0.5)";
        el.style.boxShadow = "0 20px 44px rgba(0,0,0,0.5), 0 0 28px rgba(0,229,255,0.12)";
        el.style.transform = "translateY(-4px) scale(1.015)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(0,229,255,0.18)";
        el.style.boxShadow = "none";
        el.style.transform = "none";
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }}
      />

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(0,229,255,0.5)]"
        style={{ background: "rgba(0,229,255,0.08)", border: "1.5px solid rgba(0,229,255,0.3)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      <div
        className="text-[9px] tracking-[3px] uppercase text-center px-2"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
      >
        CREATE YOUR OWN
      </div>
      <div
        className="text-[8px] tracking-[1px] mt-1 text-center px-3"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
      >
        BUILD AN AI CHARACTER
      </div>
    </Link>
  );
}

export function ExploreClient({
  initialFeatured,
  initialTrending,
  initialNew,
  initialFavorites,
  favoriteIds: initialFavoriteIds,
  isLoggedIn,
  userCanSeeNsfw,
  username,
}: ExploreClientProps) {
  const [filters, setFilters] = useState<ExploreFilters>({
    ...DEFAULT_FILTERS,
    showNsfw: userCanSeeNsfw,
  });
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [filteredResults, setFilteredResults] = useState<Character[]>([]);
  const [searching, setSearching] = useState(false);

  const favoriteIds = useMemo(() => new Set(initialFavoriteIds), [initialFavoriteIds]);

  const isSearching =
    filters.search.trim().length > 0 ||
    filters.genders.length > 0 ||
    filters.showNsfw !== userCanSeeNsfw ||
    filters.creator !== "all" ||
    filters.minRating > 0;

  useEffect(() => {
    if (!isSearching) { setFilteredResults([]); return; }
    let cancelled = false;
    setSearching(true);
    fetchFilteredClient(filters, userCanSeeNsfw).then((res) => {
      if (!cancelled) { setFilteredResults(res); setSearching(false); }
    });
    return () => { cancelled = true; };
  }, [filters, isSearching, userCanSeeNsfw]);

  // Tab → content mapping
  const tabContent = (): { chars: Character[]; title: string; subtitle: string; showRanks: boolean } | null => {
    switch (activeTab) {
      case "featured":  return { chars: initialFeatured, title: "FEATURED", subtitle: "Curated by Nexcor", showRanks: false };
      case "trending":  return { chars: initialTrending, title: "TRENDING", subtitle: "Most active this week", showRanks: true };
      case "new":       return { chars: initialNew,      title: "NEW",      subtitle: "Recently awakened", showRanks: false };
      case "nexcor":    return { chars: [...initialFeatured, ...initialTrending, ...initialNew].filter(c => c.is_platform).filter((c, i, a) => a.findIndex(x => x.id === c.id) === i), title: "NEXCOR ORIGINALS", subtitle: "Official characters", showRanks: false };
      case "community": return { chars: [...initialFeatured, ...initialTrending, ...initialNew].filter(c => !c.is_platform).filter((c, i, a) => a.findIndex(x => x.id === c.id) === i), title: "COMMUNITY", subtitle: "Created by users", showRanks: false };
      default: return null;
    }
  };

  const tab = tabContent();

  return (
    <div className="min-h-screen bg-[#05020d]">

      {/* ── Page header ── */}
      <div className="pt-6 pb-6 px-4 md:px-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5))" }} />
          <span
            className="text-[9px] tracking-[4px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            ◈ SUBJECT CATALOG · 324B21
          </span>
        </div>
        <h1
          className="text-[32px] md:text-[44px] font-black tracking-[5px] text-white uppercase mb-1"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 0 40px rgba(0,229,255,0.18), 0 0 80px rgba(0,229,255,0.06)",
          }}
        >
          EXPLORE
        </h1>
        <p className="text-sm text-[#7a6a9a] italic" style={{ fontFamily: "var(--font-body)" }}>
          Chat with AI characters — pick one below to begin instantly.
        </p>
      </div>

      {/* ── Sticky search + tabs bar ── */}
      <div
        className="sticky top-0 md:top-14 z-30 px-4 md:px-8"
        style={{
          background: "rgba(5,2,13,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(124,58,237,0.1)",
        }}
      >
        {/* Search row */}
        <div className="flex gap-3 items-center py-3">
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters({ ...filters, search })}
            />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} userCanSeeNsfw={userCanSeeNsfw} />
          <SortDropdown value={filters.sort} onChange={(sort) => setFilters({ ...filters, sort })} />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all duration-200 hover:text-white"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? "#00e5ff" : "rgba(122,106,154,0.6)",
                  background: active ? "rgba(0,229,255,0.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.15)"}`,
                  boxShadow: active ? "0 0 12px rgba(0,229,255,0.2)" : "none",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active filter pills */}
        {isSearching && (
          <div className="pb-2">
            <FilterPills filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      {/* ── Two-column layout: main + sidebar ── */}
      <div className="flex gap-6 px-4 md:px-8 mt-6 pb-16 items-start">

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-14">

          {/* ── Search results ── */}
          {isSearching ? (
            <section>
              <SectionHeader
                title={searching ? "RESULTS · SCANNING..." : `RESULTS · ${filteredResults.length}`}
              />
              {searching ? (
                <CardGridSkeleton count={8} />
              ) : filteredResults.length === 0 ? (
                <EmptyState />
              ) : (
                <CardGrid>
                  {filteredResults.map((char, i) => (
                    <CharacterGridCard
                      key={char.id}
                      character={char}
                      index={i}
                      isFavorited={favoriteIds.has(char.id)}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                  <CreateCard />
                </CardGrid>
              )}
            </section>

          ) : activeTab !== "all" && tab ? (
            /* ── Single-tab full grid ── */
            <section>
              <SectionHeader title={tab.title} subtitle={tab.subtitle} />
              {tab.chars.length === 0 ? (
                <EmptyState />
              ) : (
                <CardGrid>
                  {tab.chars.map((char, i) => (
                    <CharacterGridCard
                      key={char.id}
                      character={char}
                      index={i}
                      isFavorited={favoriteIds.has(char.id)}
                      isLoggedIn={isLoggedIn}
                      rank={tab.showRanks ? i + 1 : undefined}
                    />
                  ))}
                  <CreateCard />
                </CardGrid>
              )}
            </section>

          ) : (
            /* ── All tab — Editor's Choice grid + discovery rails ── */
            <>
              {/* EDITOR'S CHOICE — full grid */}
              {initialFeatured.length > 0 && (
                <section>
                  <SectionHeader
                    title="EDITOR'S CHOICE"
                    subtitle="Curated by the Nexcor team"
                    accentRgb="251,191,36"
                  />
                  <CardGrid>
                    {initialFeatured.slice(0, 8).map((char, i) => (
                      <CharacterGridCard
                        key={char.id}
                        character={char}
                        index={i}
                        isFavorited={favoriteIds.has(char.id)}
                        isLoggedIn={isLoggedIn}
                        badge="◈ PICK"
                      />
                    ))}
                    <CreateCard />
                  </CardGrid>
                </section>
              )}

              {/* Trending rail */}
              <CharacterRail
                title="Trending"
                subtitle="Most active this week"
                characters={initialTrending}
                favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn}
                showRanks
              />

              {/* New rail */}
              <CharacterRail
                title="New"
                subtitle="Recently awakened"
                characters={initialNew}
                favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn}
              />

              {/* Favorites rail */}
              {isLoggedIn && initialFavorites.length >= 3 && (
                <CharacterRail
                  title="Your Favorites"
                  subtitle="Saved to your archive"
                  characters={initialFavorites}
                  favoriteIds={favoriteIds}
                  isLoggedIn={isLoggedIn}
                  minCount={1}
                />
              )}

              {/* Build your own CTA */}
              <section>
                <SectionHeader title="BUILD YOUR OWN" subtitle="Design your AI persona" />
                <div style={{ width: 160 }}>
                  <CreateCard />
                </div>
              </section>
            </>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <ExploreRightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
