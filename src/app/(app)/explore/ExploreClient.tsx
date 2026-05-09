"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchFilteredClient } from "@/lib/queries/exploreQueriesClient";
import { toggleFavorite } from "@/lib/queries/favoriteActions";
import type { Character, ExploreFilters, SortOption } from "@/lib/queries/exploreTypes";
import { DEFAULT_FILTERS } from "@/lib/queries/exploreTypes";
import { SearchBar } from "@/components/explore/SearchBar";
import { FilterPanel, SortDropdown } from "@/components/explore/FilterPanel";
import { FilterPills } from "@/components/explore/FilterPills";
import { EmptyState } from "@/components/explore/EmptyState";

/* ─── types ────────────────────────────────────────────────────────────── */

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
  { key: "all",       label: "All",       dot: "rgba(0,229,255,0.8)"   },
  { key: "featured",  label: "Featured",  dot: "rgba(251,191,36,0.8)"  },
  { key: "trending",  label: "Trending",  dot: "rgba(244,114,182,0.8)" },
  { key: "new",       label: "New",       dot: "rgba(52,211,153,0.8)"  },
  { key: "nexcor",    label: "Nexcor",    dot: "rgba(0,229,255,0.8)"   },
  { key: "community", label: "Community", dot: "rgba(167,139,250,0.8)" },
] as const;
type TabKey = typeof TABS[number]["key"];

/* ─── helpers ───────────────────────────────────────────────────────────── */

const PALETTES = [
  { fg: "#00e5ff", glow: "0,229,255",   bg: "linear-gradient(170deg,#041830 0%,#0d0030 100%)" },
  { fg: "#f472b6", glow: "244,114,182", bg: "linear-gradient(170deg,#200010 0%,#1a0030 100%)" },
  { fg: "#34d399", glow: "52,211,153",  bg: "linear-gradient(170deg,#001a10 0%,#003020 100%)" },
  { fg: "#a78bfa", glow: "167,139,250", bg: "linear-gradient(170deg,#180030 0%,#0a0040 100%)" },
  { fg: "#fbbf24", glow: "251,191,36",  bg: "linear-gradient(170deg,#1a1000 0%,#2a1400 100%)" },
];
function palette(id: string) {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTES[h % PALETTES.length];
}
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
function rankColor(r: number) {
  if (r === 1) return "#ffd700";
  if (r === 2) return "#c0c0c0";
  if (r === 3) return "#cd7f32";
  return "rgba(226,217,243,0.6)";
}
function clientSort(chars: Character[], sort: SortOption): Character[] {
  const arr = [...chars];
  switch (sort) {
    case "popular":      return arr.sort((a, b) => b.chat_count - a.chat_count);
    case "alphabetical": return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:             return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

/* ─── NxCard — portrait, image-first ──────────────────────────────────── */

function NxCard({
  character, index, isFavorited = false, isLoggedIn = false, rank, badge, large = false,
}: {
  character: Character; index: number; isFavorited?: boolean;
  isLoggedIn?: boolean; rank?: number; badge?: string; large?: boolean;
}) {
  const pal = palette(character.id);
  const [fav, setFav]     = useState(isFavorited);
  const [busy, setBusy]   = useState(false);
  const [tip, setTip]     = useState(false);
  const [hov, setHov]     = useState(false);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) { setTip(true); setTimeout(() => setTip(false), 2000); return; }
    if (busy) return;
    setBusy(true);
    try { setFav(await toggleFavorite(character.id, fav)); }
    catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block overflow-hidden rounded-2xl select-none"
      style={{
        aspectRatio: large ? "16/9" : "2/3",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? 0.55 : 0.14})`,
        boxShadow: hov
          ? `0 28px 56px rgba(0,0,0,0.7), 0 0 48px rgba(${pal.glow},0.18)`
          : "0 4px 24px rgba(0,0,0,0.4)",
        transform: hov ? "translateY(-6px) scale(1.015)" : "none",
        transition: "border-color .28s ease, box-shadow .28s ease, transform .28s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.8),transparent)`, opacity: hov ? 1 : .3 }} />

      {/* Image / placeholder */}
      {character.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={character.avatar_url} alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hov ? "scale(1.08)" : "scale(1)" }} loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 60% at 50% 55%, rgba(${pal.glow},.15) 0%, transparent 70%)` }} />
          <span className="relative z-10 font-black select-none transition-all duration-300"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: large ? "clamp(5rem,12vw,9rem)" : "clamp(3.5rem,10cqi,6rem)",
              color: pal.fg,
              textShadow: hov ? `0 0 80px rgba(${pal.glow},.9), 0 0 20px rgba(${pal.glow},.6)` : `0 0 48px rgba(${pal.glow},.6)`,
            }}
          >
            {character.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Bottom gradient overlay — always visible */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "65%", background: "linear-gradient(to top, rgba(5,2,13,.97) 0%, rgba(5,2,13,.6) 50%, transparent 100%)" }} />

      {/* Hover full-screen tint */}
      <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
        style={{ background: `linear-gradient(to top, rgba(${pal.glow},.08) 0%, transparent 60%)`, opacity: hov ? 1 : 0 }} />

      {/* ── Top-left: rank / badge ── */}
      {rank != null ? (
        <span className="absolute top-3 left-3 z-30 font-black leading-none"
          style={{ fontFamily: "var(--font-display)", fontSize: large ? 20 : 14, color: rankColor(rank), textShadow: `0 0 18px ${rankColor(rank)}` }}>
          #{rank}
        </span>
      ) : badge ? (
        <span className="absolute top-3 left-3 z-30 text-[7px] tracking-[2px] uppercase px-2 py-1 rounded"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.95)`, background: "rgba(0,0,0,.6)", border: `1px solid rgba(${pal.glow},.4)`, backdropFilter: "blur(6px)" }}>
          {badge}
        </span>
      ) : null}

      {/* ── Top-right: favorite ── */}
      <button onClick={handleFav} disabled={busy}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", boxShadow: fav ? `0 0 12px rgba(${pal.glow},.6)` : "none" }}>
        <svg width="13" height="13" viewBox="0 0 24 24"
          fill={fav ? pal.fg : "none"} stroke={fav ? pal.fg : "rgba(255,255,255,.55)"} strokeWidth="2"
          style={{ filter: fav ? `drop-shadow(0 0 5px rgba(${pal.glow},.8))` : "none", transition: "all .2s" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {tip && (
          <span className="absolute top-9 right-0 whitespace-nowrap text-[8px] tracking-wider px-2 py-1 rounded pointer-events-none"
            style={{ fontFamily: "var(--font-mono)", background: "rgba(0,0,0,.9)", border: "1px solid rgba(0,229,255,.3)", color: "#00e5ff" }}>
            SIGN UP TO SAVE
          </span>
        )}
      </button>

      {/* NSFW dot */}
      {character.is_nsfw && (
        <span className="absolute z-30 w-2 h-2 rounded-full"
          style={{ top: 13, left: rank != null ? 36 : 13, background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,.8)" }} />
      )}

      {/* Nexcor badge */}
      {character.is_platform && (
        <span className="absolute top-3 z-30 text-[7px] tracking-[1.5px] px-1.5 py-0.5 rounded"
          style={{ right: 44, fontFamily: "var(--font-mono)", color: "#00e5ff", background: "rgba(0,0,0,.55)", border: "1px solid rgba(0,229,255,.3)", backdropFilter: "blur(6px)" }}>
          NEXCOR
        </span>
      )}

      {/* ── Bottom info overlay ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-8">
        {/* Description — slides in on hover */}
        {character.subtitle && (
          <p className="text-[10px] leading-relaxed mb-2 line-clamp-2 transition-all duration-300"
            style={{
              fontFamily: "var(--font-body)", color: "rgba(226,217,243,.7)",
              opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(8px)",
            }}>
            {character.subtitle}
          </p>
        )}

        {/* Name */}
        <div className="font-black tracking-wide leading-tight truncate"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: large ? "clamp(18px,3vw,26px)" : "clamp(13px,3.5cqi,16px)",
            color: hov ? pal.fg : "#fff",
            textShadow: hov ? `0 0 20px rgba(${pal.glow},.7)` : "none",
            transition: "color .25s, text-shadow .25s",
          }}>
          {character.name}
        </div>

        {/* Subtitle row */}
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[8px] tracking-[1.5px] uppercase truncate"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.6)` }}>
            {character.is_platform ? "◈ nexcor" : "◈ community"}
            {character.subtitle ? ` · ${character.subtitle}` : ""}
          </span>
          {character.chat_count > 0 && (
            <span className="flex items-center gap-1 text-[8px] tabular-nums flex-shrink-0"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.5)` }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {fmt(character.chat_count)}
            </span>
          )}
        </div>

        {/* CHAT CTA — hover only */}
        <div className="mt-2.5 transition-all duration-300"
          style={{ opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(6px)" }}>
          <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[3px] font-bold px-3 py-1.5 rounded-full"
            style={{
              fontFamily: "var(--font-mono)", color: pal.fg,
              background: `rgba(${pal.glow},.14)`,
              border: `1px solid rgba(${pal.glow},.5)`,
              boxShadow: `0 0 16px rgba(${pal.glow},.35)`,
            }}>
            CHAT NOW →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── CreateCard ─────────────────────────────────────────────────────────── */

function CreateCard() {
  const [hov, setHov] = useState(false);
  return (
    <Link href="/create"
      className="group relative block overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "2/3",
        background: "rgba(0,229,255,0.03)",
        border: `1px solid rgba(0,229,255,${hov ? .45 : .12})`,
        boxShadow: hov ? "0 28px 56px rgba(0,0,0,.6), 0 0 36px rgba(0,229,255,.12)" : "none",
        transform: hov ? "translateY(-6px) scale(1.015)" : "none",
        transition: "all .28s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,229,255,.05) 0%, transparent 70%)" }} />
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,.35),transparent)", opacity: hov ? 1 : .3 }} />
      {/* Corner brackets */}
      {[["top-3 left-3","borderTop borderLeft"],["top-3 right-3","borderTop borderRight"],["bottom-3 left-3","borderBottom borderLeft"],["bottom-3 right-3","borderBottom borderRight"]].map(([pos]) => (
        <div key={pos} className={`absolute ${pos} w-4 h-4 pointer-events-none`}
          style={{ borderTop: pos.includes("top") ? "1.5px solid rgba(0,229,255,.3)" : undefined, borderBottom: pos.includes("bottom") ? "1.5px solid rgba(0,229,255,.3)" : undefined, borderLeft: pos.includes("left") ? "1.5px solid rgba(0,229,255,.3)" : undefined, borderRight: pos.includes("right") ? "1.5px solid rgba(0,229,255,.3)" : undefined }} />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{ background: "rgba(0,229,255,.07)", border: "1.5px solid rgba(0,229,255,.25)", boxShadow: hov ? "0 0 28px rgba(0,229,255,.35)" : "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div className="text-center px-3">
          <div className="text-[10px] tracking-[3px] uppercase mb-1"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.75)" }}>CREATE YOUR OWN</div>
          <div className="text-[8px] tracking-[1px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.5)" }}>BUILD AN AI CHARACTER</div>
        </div>
      </div>
    </Link>
  );
}

/* ─── NxGrid ─────────────────────────────────────────────────────────────── */

function NxGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {children}
    </div>
  );
}

function NxGridSkeleton({ count }: { count: number }) {
  return (
    <NxGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse"
          style={{ aspectRatio: "2/3", background: "rgba(12,5,32,.6)" }} />
      ))}
    </NxGrid>
  );
}

/* ─── SectionLabel ───────────────────────────────────────────────────────── */

function SectionLabel({ title, sub, color = "#00e5ff" }: { title: string; sub?: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-shrink-0 w-0.5 h-7 rounded-full"
        style={{ background: `linear-gradient(to bottom, ${color}, rgba(124,58,237,.35))`, boxShadow: `0 0 8px ${color}60` }} />
      <div>
        <h2 className="text-[13px] md:text-[15px] tracking-[3.5px] uppercase font-black leading-none"
          style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{title}</h2>
        {sub && <p className="text-[8px] tracking-[2px] uppercase mt-1"
          style={{ fontFamily: "var(--font-mono)", color: `${color}60` }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── HorizontalRail ─────────────────────────────────────────────────────── */

function HorizontalRail({ title, sub, chars, favoriteIds, isLoggedIn, showRanks = false, color = "#00e5ff" }: {
  title: string; sub?: string; chars: Character[]; favoriteIds: Set<string>;
  isLoggedIn: boolean; showRanks?: boolean; color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (chars.length < 3) return null;
  const scroll = (d: "l" | "r") => ref.current?.scrollBy({ left: d === "l" ? -220 : 220, behavior: "smooth" });

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <SectionLabel title={title} sub={sub} color={color} />
        <div className="hidden md:flex gap-1.5">
          {(["l","r"] as const).map(d => (
            <button key={d} onClick={() => scroll(d)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200"
              style={{ border: "1px solid rgba(124,58,237,.25)", background: "rgba(12,5,32,.6)", color: "rgba(122,106,154,.8)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}50`; (e.currentTarget as HTMLElement).style.color = color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,.25)"; (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,.8)"; }}>
              {d === "l" ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute right-0 top-0 bottom-4 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left,#05020d,transparent)" }} />
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}>
          {chars.map((c, i) => (
            <div key={c.id} className="flex-shrink-0 snap-start" style={{ width: 160 }}>
              <NxCard character={c} index={i} isFavorited={favoriteIds.has(c.id)}
                isLoggedIn={isLoggedIn} rank={showRanks ? i + 1 : undefined} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SpotlightBanner — wide hero card for first featured char ───────────── */

function SpotlightBanner({ character, isFavorited, isLoggedIn }: {
  character: Character; isFavorited: boolean; isLoggedIn: boolean;
}) {
  const pal = palette(character.id);
  const [hov, setHov] = useState(false);
  const [fav, setFav] = useState(isFavorited);
  const [busy, setBusy] = useState(false);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn || busy) return;
    setBusy(true);
    try { setFav(await toggleFavorite(character.id, fav)); }
    finally { setBusy(false); }
  };

  return (
    <Link href={`/character/${character.id}`}
      className="relative block overflow-hidden rounded-3xl mb-10 select-none"
      style={{
        height: "clamp(220px,35vw,380px)",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? .55 : .18})`,
        boxShadow: hov ? `0 32px 72px rgba(0,0,0,.7), 0 0 60px rgba(${pal.glow},.2)` : "0 8px 40px rgba(0,0,0,.5)",
        transition: "border-color .3s ease, box-shadow .3s ease, transform .3s cubic-bezier(.4,0,.2,1)",
        transform: hov ? "scale(1.005)" : "none",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      {/* Background image */}
      {character.avatar_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={character.avatar_url} alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hov ? "scale(1.04)" : "scale(1)", objectPosition: "top center" }} />
      )}

      {/* No image placeholder */}
      {!character.avatar_url && (
        <div className="absolute inset-0 flex items-center justify-end pr-16 pointer-events-none">
          <span className="font-black select-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)", color: `rgba(${pal.glow},.12)` }}>
            {character.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(5,2,13,.95) 0%, rgba(5,2,13,.7) 40%, rgba(5,2,13,.1) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(5,2,13,.85) 0%, transparent 100%)" }} />

      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,rgba(${pal.glow},.8),transparent 60%)`, opacity: hov ? 1 : .4 }} />

      {/* Favorite */}
      <button onClick={handleFav} disabled={busy}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", boxShadow: fav ? `0 0 16px rgba(${pal.glow},.7)` : "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill={fav ? pal.fg : "none"} stroke={fav ? pal.fg : "rgba(255,255,255,.6)"} strokeWidth="2"
          style={{ filter: fav ? `drop-shadow(0 0 6px rgba(${pal.glow},.9))` : "none", transition: "all .2s" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* NEXCOR badge */}
      {character.is_platform && (
        <span className="absolute top-4 left-4 z-20 text-[8px] tracking-[2px] uppercase px-2.5 py-1 rounded"
          style={{ fontFamily: "var(--font-mono)", color: "#00e5ff", background: "rgba(0,0,0,.6)", border: "1px solid rgba(0,229,255,.4)", backdropFilter: "blur(8px)" }}>
          ◈ NEXCOR ORIGINAL
        </span>
      )}

      {/* Text content */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 md:p-10 max-w-xl z-10">
        <div className="text-[8px] tracking-[4px] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.65)` }}>
          ◈ FEATURED · SPOTLIGHT
        </div>
        <h3 className="font-black tracking-wide leading-none mb-2"
          style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,52px)", color: "#fff",
            textShadow: `0 0 40px rgba(${pal.glow},.35)`,
          }}>
          {character.name}
        </h3>
        {character.subtitle && (
          <p className="text-[13px] italic leading-relaxed mb-4 line-clamp-2"
            style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.7)" }}>
            {character.subtitle}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[3px] font-bold px-4 py-2 rounded-full transition-all duration-300"
            style={{
              fontFamily: "var(--font-mono)", color: pal.fg,
              background: `rgba(${pal.glow},.15)`,
              border: `1px solid rgba(${pal.glow},.5)`,
              boxShadow: hov ? `0 0 24px rgba(${pal.glow},.4)` : "none",
            }}>
            BEGIN CHAT →
          </span>
          {character.chat_count > 0 && (
            <span className="text-[10px] tabular-nums"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.35)" }}>
              {fmt(character.chat_count)} chats
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── ExploreClient ──────────────────────────────────────────────────────── */

export function ExploreClient({
  initialFeatured, initialTrending, initialNew, initialFavorites,
  favoriteIds: initialFavoriteIds, isLoggedIn, userCanSeeNsfw,
}: ExploreClientProps) {
  const [filters,         setFilters]         = useState<ExploreFilters>({ ...DEFAULT_FILTERS, showNsfw: userCanSeeNsfw });
  const [inputSearch,     setInputSearch]     = useState("");
  const [activeTab,       setActiveTab]       = useState<TabKey>("all");
  const [filteredResults, setFilteredResults] = useState<Character[]>([]);
  const [searching,       setSearching]       = useState(false);

  // Debounce the search text so we don't fire a fetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: inputSearch })), 350);
    return () => clearTimeout(t);
  }, [inputSearch]);

  const favoriteIds    = useMemo(() => new Set(initialFavoriteIds), [initialFavoriteIds]);

  // Sort initial lists client-side so the sort dropdown always has an immediate effect
  const sortedFeatured  = useMemo(() => clientSort(initialFeatured,  filters.sort), [initialFeatured,  filters.sort]);
  const sortedTrending  = useMemo(() => clientSort(initialTrending,  filters.sort), [initialTrending,  filters.sort]);
  const sortedNew       = useMemo(() => clientSort(initialNew,       filters.sort), [initialNew,       filters.sort]);
  const sortedFavorites = useMemo(() => clientSort(initialFavorites, filters.sort), [initialFavorites, filters.sort]);

  const isSearching =
    filters.search.trim().length > 0 ||
    filters.genders.length > 0 ||
    filters.showNsfw !== userCanSeeNsfw ||
    filters.creator !== "all" ||
    filters.minRating > 0 ||
    (filters.tags?.length ?? 0) > 0;

  useEffect(() => {
    if (!isSearching) { setFilteredResults([]); return; }
    let cancelled = false;
    setSearching(true);
    fetchFilteredClient(filters, userCanSeeNsfw).then((res) => {
      if (!cancelled) { setFilteredResults(res); setSearching(false); }
    });
    return () => { cancelled = true; };
  }, [filters, isSearching, userCanSeeNsfw]);

  const tabContent = () => {
    switch (activeTab) {
      case "featured":  return { chars: sortedFeatured, title: "FEATURED",        sub: "Curated by Nexcor",       showRanks: false };
      case "trending":  return { chars: sortedTrending, title: "TRENDING",        sub: "Most active this week",   showRanks: filters.sort === "newest" };
      case "new":       return { chars: sortedNew,      title: "NEW ARRIVALS",    sub: "Recently awakened",       showRanks: false };
      case "nexcor":    return { chars: clientSort([...sortedFeatured,...sortedTrending,...sortedNew].filter(c=>c.is_platform).filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i), filters.sort), title: "NEXCOR ORIGINALS", sub: "Official characters", showRanks: false };
      case "community": return { chars: clientSort([...sortedFeatured,...sortedTrending,...sortedNew].filter(c=>!c.is_platform).filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i), filters.sort), title: "COMMUNITY", sub: "Created by users", showRanks: false };
      default: return null;
    }
  };
  const tab = tabContent();

  return (
    <div className="min-h-screen bg-[#05020d]">

      {/* ── Atmospheric page header ───────────────────────────────── */}
      <div className="relative overflow-hidden pt-6 pb-4 px-4 md:px-8">
        {/* Hex grid bg */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{ backgroundImage: "linear-gradient(rgba(0,212,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Radial glows */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% -20%, rgba(0,212,255,.06) 0%, transparent 70%),radial-gradient(ellipse 30% 40% at 80% 80%, rgba(124,58,237,.04) 0%, transparent 60%)" }} />

        {/* System label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,.4))" }} />
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
            <span className="text-[8px] tracking-[5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,.4)" }}>
              SUBJECT CATALOG · 324B21
            </span>
          </div>
        </div>

        <h1 className="font-black tracking-[6px] uppercase mb-4"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,44px)", color: "#fff", textShadow: "0 0 50px rgba(0,212,255,.2)" }}>
          EXPLORE
        </h1>

        {/* Search + filter row */}
        <div className="flex gap-3 items-center mb-4 max-w-3xl">
          <div className="flex-1"><SearchBar value={inputSearch} onChange={setInputSearch} /></div>
          <FilterPanel filters={filters} onChange={setFilters} userCanSeeNsfw={userCanSeeNsfw} />
          <SortDropdown value={filters.sort} onChange={(sort) => setFilters({ ...filters, sort })} />
        </div>

        {/* Filter pills */}
        {isSearching && <div className="mb-3"><FilterPills filters={filters} onChange={setFilters} /></div>}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 px-4 md:px-8 pb-3"
        style={{ background: "rgba(5,2,13,.95)", borderBottom: "1px solid rgba(124,58,237,.1)", backdropFilter: "blur(20px)" }}>
        <div className="flex gap-1.5 pt-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => {
            const active = activeTab === t.key && !isSearching;
            return (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setInputSearch(""); setFilters(f => ({ ...f, search: "" })); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all duration-200"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? "#fff" : "rgba(122,106,154,.65)",
                  background: active ? "rgba(0,229,255,.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(0,229,255,.45)" : "rgba(124,58,237,.15)"}`,
                  boxShadow: active ? "0 0 14px rgba(0,229,255,.2)" : "none",
                  fontWeight: active ? 700 : 400,
                }}>
                {active && <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: t.dot, boxShadow: `0 0 6px ${t.dot}` }} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 pt-8 pb-20 space-y-14">

        {isSearching ? (
          <section>
            <SectionLabel title={searching ? "SCANNING···" : `RESULTS · ${filteredResults.length}`} />
            {searching ? <NxGridSkeleton count={10} /> :
              filteredResults.length === 0 ? <EmptyState /> : (
                <NxGrid>
                  {filteredResults.map((c, i) => (
                    <NxCard key={c.id} character={c} index={i} isFavorited={favoriteIds.has(c.id)} isLoggedIn={isLoggedIn} />
                  ))}
                  <CreateCard />
                </NxGrid>
              )}
          </section>

        ) : activeTab !== "all" && tab ? (
          <section>
            <SectionLabel title={tab.title} sub={tab.sub} />
            {tab.chars.length === 0 ? <EmptyState /> : (
              <NxGrid>
                {tab.chars.map((c, i) => (
                  <NxCard key={c.id} character={c} index={i} isFavorited={favoriteIds.has(c.id)}
                    isLoggedIn={isLoggedIn} rank={tab.showRanks ? i + 1 : undefined} />
                ))}
                <CreateCard />
              </NxGrid>
            )}
          </section>

        ) : (
          <>
            {/* Spotlight hero */}
            {sortedFeatured.length > 0 && (
              <SpotlightBanner
                character={sortedFeatured[0]}
                isFavorited={favoriteIds.has(sortedFeatured[0].id)}
                isLoggedIn={isLoggedIn}
              />
            )}

            {/* Featured grid (skip first — already in spotlight) */}
            {sortedFeatured.length > 1 && (
              <section>
                <SectionLabel title="EDITOR'S CHOICE" sub="Curated by the Nexcor team" color="#fbbf24" />
                <NxGrid>
                  {sortedFeatured.slice(1, 10).map((c, i) => (
                    <NxCard key={c.id} character={c} index={i} isFavorited={favoriteIds.has(c.id)}
                      isLoggedIn={isLoggedIn} badge="◈ PICK" />
                  ))}
                  <CreateCard />
                </NxGrid>
              </section>
            )}

            {/* Trending rail */}
            <HorizontalRail title="TRENDING NOW" sub="Most active this week"
              chars={sortedTrending} favoriteIds={favoriteIds}
              isLoggedIn={isLoggedIn} showRanks color="#f472b6" />

            {/* New arrivals rail */}
            <HorizontalRail title="NEW ARRIVALS" sub="Recently awakened"
              chars={sortedNew} favoriteIds={favoriteIds}
              isLoggedIn={isLoggedIn} color="#34d399" />

            {/* Favorites rail */}
            {isLoggedIn && sortedFavorites.length >= 3 && (
              <HorizontalRail title="YOUR ARCHIVE" sub="Saved characters"
                chars={sortedFavorites} favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn} color="#a78bfa" />
            )}

            {/* Build your own CTA */}
            <section>
              <SectionLabel title="BUILD YOUR OWN" sub="Design your AI character" />
              <div style={{ width: 160 }}><CreateCard /></div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
