"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FavoriteHeart } from "@/components/character/FavoriteHeart";

/* ═══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

export interface FavCharacter {
  id: string;
  name: string;
  subtitle: string | null;
  avatar_url: string | null;
  gender_pronouns: string;
  is_platform: boolean;
  is_nsfw: boolean;
  tier: string;
  creator_id: string | null;
  creator_username: string | null;
}

export interface SuggestionCharacter {
  id: string;
  name: string;
  subtitle: string | null;
  avatar_url: string | null;
  is_nsfw: boolean;
  creator_username: string | null;
}

/* ═══════════════════════════════════════════════════════════
   Heartbeat logo
══════════════════════════════════════════════════════════════ */

function HeartbeatLogo() {
  return (
    <div className="relative inline-flex items-center justify-center mb-5">
      <div className="absolute rounded-full pointer-events-none tx-glow"
        style={{ width: 130, height: 130, background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, rgba(0,229,255,0.05) 50%, transparent 70%)" }} />
      <svg width="88" height="84" viewBox="0 0 88 84" fill="none" aria-hidden>
        <ellipse cx="44" cy="42" rx="38" ry="36" stroke="rgba(124,58,237,0.18)" strokeWidth="0.8" strokeDasharray="3 7" className="settings-logo-orbit" />
        {([
          [44, 6, "0s"], [79, 24, "0.5s"], [79, 60, "1s"],
          [44, 78, "1.5s"], [9, 60, "2s"], [9, 24, "2.5s"],
        ] as [number, number, string][]).map(([cx, cy, d], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.2" fill="rgba(167,139,250,0.8)" className="settings-logo-node" style={{ animationDelay: d }} />
        ))}
        <path d="M44 62 C32 52 16 44 16 32 C16 24 22 18 30 18 C36 18 41 22 44 26 C47 22 52 18 58 18 C66 18 72 24 72 32 C72 44 56 52 44 62Z"
          fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.4">
          <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
        </path>
        <polyline points="22,36 28,36 31,28 35,44 39,34 43,38 47,36 50,36 53,28 57,44 61,36 66,36"
          stroke="rgba(0,229,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
          className="tx-wave" style={{ strokeDasharray: 100 }} />
        <circle cx="44" cy="42" r="3.5" fill="rgba(167,139,250,0.9)" className="settings-logo-node" style={{ animationDelay: "0.9s" }} />
        <circle cx="44" cy="42" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1">
          <animate attributeName="r" values="3.5;11" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FavCard
══════════════════════════════════════════════════════════════ */

function FavCard({ c, idx }: { c: FavCharacter; idx: number }) {
  return (
    <div
      className="settings-card-enter group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ background: "rgba(9,4,26,0.85)", border: "1px solid rgba(124,58,237,0.18)", animationDelay: `${idx * 0.04}s` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = "1px solid rgba(167,139,250,0.45)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(167,139,250,0.1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = "1px solid rgba(124,58,237,0.18)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div className="settings-top-line" />

      {/* Avatar */}
      <Link href={`/character/${c.id}`} className="block relative aspect-square overflow-hidden bg-[#0c0720]">
        {c.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(167,139,250,0.5)" }}>
            {c.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute left-0 right-0 pointer-events-none" style={{ height: "1.5px", background: "rgba(167,139,250,0.4)", animation: "card-scan 3s ease-in-out infinite", top: 0 }} />
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          {c.is_nsfw && (
            <span className="px-1.5 py-0.5 rounded text-[8px] tracking-[1.5px] font-bold"
              style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "rgba(245,158,11,0.9)" }}>
              NSFW
            </span>
          )}
          {c.is_platform && (
            <span className="px-1.5 py-0.5 rounded text-[8px] tracking-[1.5px] font-bold ml-auto"
              style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" }}>
              ◈ NXR
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteHeart characterId={c.id} initialFavorited={true} />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/character/${c.id}`}>
          <div className="text-[13px] font-bold tracking-[1.5px] truncate transition-colors duration-200 group-hover:text-[#a78bfa]"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}>
            {c.name}
          </div>
          {c.subtitle && (
            <p className="text-[11px] italic mt-0.5 line-clamp-1 leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.65)" }}>
              {c.subtitle}
            </p>
          )}
        </Link>

        {/* Creator credit */}
        {c.creator_username && !c.is_platform && (
          <Link
            href={`/profile/${c.creator_username}`}
            className="inline-flex items-center gap-1 mt-2 transition-opacity hover:opacity-100 opacity-70"
          >
            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)", color: "rgba(167,139,250,0.9)", fontFamily: "var(--font-display)" }}>
              {c.creator_username[0].toUpperCase()}
            </div>
            <span className="text-[9px] tracking-[1px]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.7)" }}>
              {c.creator_username}
            </span>
          </Link>
        )}

        <Link href={`/chat/${c.id}`}
          className="mt-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-[1.03]"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.22)", color: "rgba(167,139,250,0.85)" }}>
          CHAT →
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Suggestions rail
══════════════════════════════════════════════════════════════ */

function SuggestionsRail({ suggestions }: { suggestions: SuggestionCharacter[] }) {
  if (suggestions.length === 0) return null;
  return (
    <div className="mb-8 settings-card-enter" style={{ animationDelay: "0.06s" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[10px] tracking-[3px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}>
          ◈ SUGGESTIONS FROM PEOPLE YOU FOLLOW
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.15), transparent)" }} />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {suggestions.map((c) => (
          <div key={c.id} className="flex-shrink-0 w-32 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.03]"
            style={{ background: "rgba(9,4,26,0.8)", border: "1px solid rgba(0,229,255,0.12)" }}>
            <Link href={`/character/${c.id}`} className="block">
              <div className="relative w-full aspect-square overflow-hidden bg-[#0a0420]">
                {c.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black"
                    style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.3)" }}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {c.is_nsfw && (
                  <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[7px] font-bold"
                    style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.2)", color: "rgba(245,158,11,0.9)" }}>
                    NSFW
                  </span>
                )}
              </div>
              <div className="p-2">
                <div className="text-[11px] font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}>
                  {c.name}
                </div>
                {c.creator_username && (
                  <div className="text-[9px] truncate mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}>
                    {c.creator_username}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FavoritesClient
══════════════════════════════════════════════════════════════ */

export function FavoritesClient({ characters, suggestions }: { characters: FavCharacter[]; suggestions: SuggestionCharacter[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.subtitle ?? "").toLowerCase().includes(q) || (c.creator_username ?? "").toLowerCase().includes(q)
    );
  }, [characters, query]);

  const LETTERS = "FAVORITES".split("");

  return (
    <div className="min-h-screen bg-[#05020d] px-4 md:px-8 pt-8 pb-28 md:pb-8">
      <div className="fixed inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.22) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <header className="text-center mb-8 settings-card-enter" style={{ animationDelay: "0s" }}>
          <HeartbeatLogo />
          <div className="flex items-center justify-center gap-[2px] mb-2">
            {LETTERS.map((l, i) => (
              <span key={i} className="settings-letter text-[28px] md:text-[38px] font-black"
                style={{ fontFamily: "var(--font-display)", color: "#fff", animationDelay: `${i * 0.07}s`, letterSpacing: "0.12em", textShadow: "0 0 24px rgba(167,139,250,0.5)" }}>
                {l}
              </span>
            ))}
          </div>
          <div className="text-[10px] tracking-[4px] uppercase mb-4"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.5)" }}>
            ◈ SAVED ENTITIES · 324B21
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <span style={{ color: "rgba(167,139,250,0.7)", fontSize: 11 }}>♥</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "rgba(167,139,250,0.9)" }}>
                {characters.length}
              </span>
              <span className="text-[9px] tracking-[1.5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.5)" }}>
                {characters.length === 1 ? "ENTITY" : "ENTITIES"}
              </span>
            </div>
          </div>
        </header>

        {/* Suggestions rail */}
        <SuggestionsRail suggestions={suggestions} />

        {/* Search */}
        {characters.length > 0 && (
          <div className="relative mb-6 settings-card-enter" style={{ animationDelay: "0.08s" }}>
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text" placeholder="Search by name, creator…" value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[12px] outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(226,217,243,0.85)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(167,139,250,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(124,58,237,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] opacity-60 hover:opacity-100"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}>
                ✕
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {characters.length === 0 ? (
          <div className="text-center py-20 settings-card-enter" style={{ animationDelay: "0.1s" }}>
            <div className="text-[10px] tracking-[3px] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.3)" }}>
              NO ENTITIES DESIGNATED
            </div>
            <p className="text-[14px] italic mb-8 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}>
              Find a character you love and tap the heart. They&apos;ll live here.
            </p>
            <Link href="/explore"
              className="inline-block px-6 py-2.5 rounded-lg text-[10px] tracking-[3px] font-bold uppercase transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)]"
              style={{ fontFamily: "var(--font-mono)", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "rgba(167,139,250,0.9)" }}>
              BROWSE CHARACTERS →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[12px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}>
              No entities match &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((c, i) => (
              <FavCard key={c.id} c={c} idx={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
