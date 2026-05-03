"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchFilteredClient } from "@/lib/queries/exploreQueriesClient";
import type { Character, ExploreFilters } from "@/lib/queries/exploreTypes";
import { DEFAULT_FILTERS } from "@/lib/queries/exploreTypes";

import { SearchBar } from "@/components/explore/SearchBar";
import { FilterPanel, SortDropdown } from "@/components/explore/FilterPanel";
import { FilterPills } from "@/components/explore/FilterPills";
import { CharacterRail } from "@/components/explore/CharacterRail";
import { CompactCharacterCard } from "@/components/explore/CompactCharacterCard";
import { EmptyState } from "@/components/explore/EmptyState";

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

  const [filteredResults, setFilteredResults] = useState<Character[]>([]);
  const [searching, setSearching] = useState(false);

  const favoriteIds = useMemo(() => new Set(initialFavoriteIds), [initialFavoriteIds]);

  const isFiltering =
    filters.search.trim().length > 0 ||
    filters.genders.length > 0 ||
    filters.showNsfw !== userCanSeeNsfw ||
    filters.creator !== "all" ||
    filters.minRating > 0;

  useEffect(() => {
    if (!isFiltering) { setFilteredResults([]); return; }
    let cancelled = false;
    setSearching(true);
    fetchFilteredClient(filters, userCanSeeNsfw).then((res) => {
      if (!cancelled) { setFilteredResults(res); setSearching(false); }
    });
    return () => { cancelled = true; };
  }, [filters, isFiltering, userCanSeeNsfw]);

  return (
    <div className="min-h-screen bg-[#05020d] pb-32">

      {/* ── Page header ── */}
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Ambient glow orb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: 64,
            width: 600,
            height: 200,
            background: "radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5))" }} />
          <span
            className="text-[9px] tracking-[4px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            ◈ SUBJECT CATALOG
          </span>
        </div>

        <h1
          className="text-[32px] md:text-[44px] font-black tracking-[5px] text-white uppercase mb-2"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 0 40px rgba(0,229,255,0.18), 0 0 80px rgba(0,229,255,0.06)",
          }}
        >
          EXPLORE
        </h1>

        <p
          className="text-sm text-[#7a6a9a] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Chat with AI characters — pick one below to begin instantly.
        </p>

        {/* Always-visible onboarding hint */}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border"
            style={{
              borderColor: "rgba(0,229,255,0.18)",
              background: "rgba(0,229,255,0.04)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-neon-pulse"
              style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.8)" }}
            />
            <span
              className="text-[10px] tracking-[2px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {isLoggedIn ? "SELECT A CHARACTER · SCROLL DOWN TO BROWSE" : "SELECT ANY CHARACTER TO START CHATTING FREE"}
            </span>
          </div>

          {!isLoggedIn && (
            <span
              className="text-[10px] tracking-[1.5px] text-[#5a4a7a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Already have an account?{" "}
              <a href="/login" className="text-[#a78bfa] hover:text-cyan-400 transition-colors underline">
                Log in
              </a>
            </span>
          )}
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="sticky top-16 z-30 bg-[#05020d]/90 backdrop-blur-md border-b border-purple-700/10 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <SearchBar
                value={filters.search}
                onChange={(search) => setFilters({ ...filters, search })}
              />
            </div>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              userCanSeeNsfw={userCanSeeNsfw}
            />
            <SortDropdown
              value={filters.sort}
              onChange={(sort) => setFilters({ ...filters, sort })}
            />
          </div>
          <div className="mt-3">
            <FilterPills filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-0 md:px-8 mt-8 space-y-14">
        {isFiltering ? (
          <section>
            <div className="px-4 md:px-0 mb-5 flex items-center gap-3">
              <span className="w-0.5 h-6 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.4))", boxShadow: "0 0 6px rgba(0,229,255,0.35)" }} />
              <h2
                className="text-[14px] tracking-[3px] text-white uppercase"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
              >
                RESULTS{searching ? " · SCANNING..." : ` · ${filteredResults.length}`}
              </h2>
            </div>
            {searching ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 md:px-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[14px] border border-purple-700/10 animate-pulse"
                    style={{ aspectRatio: "4/5", background: "rgba(12,5,32,0.6)" }}
                  />
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 md:px-0">
                {filteredResults.map((char, i) => (
                  <CompactCharacterCard
                    key={char.id}
                    character={char}
                    index={i}
                    isFavorited={favoriteIds.has(char.id)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
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
          </>
        )}
      </div>

      {/* ── Create CTA ── */}
      {isLoggedIn && username && (
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href="/create"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              boxShadow: "0 0 24px rgba(0,229,255,0.45), 0 4px 16px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 48px rgba(0,229,255,0.7), 0 4px 24px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 24px rgba(0,229,255,0.45), 0 4px 16px rgba(0,0,0,0.4)";
            }}
          >
            <span className="text-lg leading-none">+</span> CREATE ENTITY
          </a>
        </div>
      )}
    </div>
  );
}
