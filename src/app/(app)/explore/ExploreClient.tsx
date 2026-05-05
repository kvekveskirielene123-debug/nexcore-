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
import { CompactCharacterCard } from "@/components/explore/CompactCharacterCard";
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

function CreateCard() {
  return (
    <Link
      href="/create"
      className="group relative block rounded-[14px] overflow-hidden border bg-[#0c0520]/80 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        aspectRatio: "4/5",
        minWidth: 140,
        maxWidth: 220,
        borderColor: "rgba(0,229,255,0.2)",
        boxShadow: "none",
        transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.5)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 44px rgba(0,0,0,0.5), 0 0 28px rgba(0,229,255,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.2)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)",
      }} />
      <div className="h-px absolute top-0 left-0 right-0" style={{
        background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)",
      }} />

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(0,229,255,0.5)]"
        style={{
          background: "rgba(0,229,255,0.08)",
          border: "1.5px solid rgba(0,229,255,0.3)",
        }}
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
        <div className="flex-1 min-w-0 space-y-12">

          {/* Search results */}
          {isSearching ? (
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="w-0.5 h-6 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.4))", boxShadow: "0 0 6px rgba(0,229,255,0.35)" }} />
                <h2 className="text-[14px] tracking-[3px] text-white uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  RESULTS{searching ? " · SCANNING..." : ` · ${filteredResults.length}`}
                </h2>
              </div>
              {searching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-[14px] border border-purple-700/10 animate-pulse" style={{ aspectRatio: "4/5", background: "rgba(12,5,32,0.6)" }} />
                  ))}
                </div>
              ) : filteredResults.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredResults.map((char, i) => (
                    <CompactCharacterCard key={char.id} character={char} index={i} isFavorited={favoriteIds.has(char.id)} isLoggedIn={isLoggedIn} />
                  ))}
                  <div className="flex-shrink-0"><CreateCard /></div>
                </div>
              )}
            </section>

          ) : activeTab !== "all" && tab ? (
            /* Single-tab grid view */
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="w-0.5 h-6 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.4))", boxShadow: "0 0 6px rgba(0,229,255,0.35)" }} />
                <div>
                  <h2 className="text-[14px] tracking-[3px] text-white uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                    {tab.title}
                  </h2>
                  <p className="text-[9px] tracking-[2px] text-[#5a4a7a] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                    {tab.subtitle}
                  </p>
                </div>
              </div>
              {tab.chars.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {tab.chars.map((char, i) => (
                    <CompactCharacterCard
                      key={char.id}
                      character={char}
                      index={i}
                      isFavorited={favoriteIds.has(char.id)}
                      isLoggedIn={isLoggedIn}
                      rank={tab.showRanks ? i + 1 : undefined}
                    />
                  ))}
                  <div><CreateCard /></div>
                </div>
              )}
            </section>

          ) : (
            /* All tabs — rails view */
            <>
              <CharacterRail
                title="Featured"
                subtitle="Curated by Nexcor"
                characters={initialFeatured}
                favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn}
                variant="featured"
              />
              <CharacterRail
                title="Trending"
                subtitle="Most active this week"
                characters={initialTrending}
                favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn}
                showRanks
              />
              <CharacterRail
                title="New"
                subtitle="Recently awakened"
                characters={initialNew}
                favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn}
              />
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

              {/* Create card row */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-0.5 h-6 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.4))", boxShadow: "0 0 6px rgba(0,229,255,0.35)" }} />
                  <h2 className="text-[14px] tracking-[3px] text-white uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                    BUILD YOUR OWN
                  </h2>
                </div>
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
