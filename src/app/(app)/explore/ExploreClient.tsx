"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
    showNsfw: userCanSeeNsfw, // default to user's preference
  });

  const [filteredResults, setFilteredResults] = useState<Character[]>([]);
  const [searching, setSearching] = useState(false);

  const favoriteIds = useMemo(() => new Set(initialFavoriteIds), [initialFavoriteIds]);

  // Is any filter active?
  const isFiltering =
    filters.search.trim().length > 0 ||
    filters.genders.length > 0 ||
    (filters.showNsfw !== userCanSeeNsfw) ||
    filters.creator !== "all" ||
    filters.minRating > 0;

  // Refetch filtered results when filters change (and we're filtering)
  useEffect(() => {
    if (!isFiltering) {
      setFilteredResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    fetchFilteredClient(filters, userCanSeeNsfw).then((res) => {
      if (!cancelled) {
        setFilteredResults(res);
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters, isFiltering, userCanSeeNsfw]);

  return (
    <div className="min-h-screen bg-[#05020d] pb-32">
      {/* Page title band */}
      <div className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-8 h-px bg-cyan-400/40" />
          <span
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ SUBJECT CATALOG
          </span>
        </div>
        <h1
          className="text-[32px] md:text-[44px] font-black tracking-[5px] text-white uppercase"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 0 30px rgba(0,229,255,0.2)",
          }}
        >
          EXPLORE
        </h1>
        <p
          className="text-sm text-[#7a6a9a] italic mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Discover the entities waiting to meet you.
        </p>
      </div>

      {/* Search + filter bar */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-0 md:px-8 mt-8 space-y-12">
        {isFiltering ? (
          <section>
            <div className="px-4 md:px-0 mb-4 flex items-center gap-3">
              <span className="w-3 h-px bg-cyan-400/50" />
              <h2
                className="text-[14px] tracking-[3px] text-white uppercase"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                RESULTS {searching ? "· SEARCHING..." : `· ${filteredResults.length}`}
              </h2>
            </div>
            {searching ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 md:px-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[14px] bg-[#0c0520]/60 border border-purple-700/10 animate-pulse"
                    style={{ aspectRatio: "4/5" }}
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

      {/* Create Your Own CTA */}
      {isLoggedIn && username && (
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href="/create"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.6)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-lg">+</span> CREATE ENTITY
          </a>
        </div>
      )}
    </div>
  );
}
