"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchFilteredClient, searchUsers } from "@/lib/queries/exploreQueriesClient";
import { toggleFavorite } from "@/lib/queries/favoriteActions";
import type { Character, ExploreFilters, SortOption, UserProfile } from "@/lib/queries/exploreTypes";
import { DEFAULT_FILTERS, GENDER_OPTIONS, TAG_GROUPS } from "@/lib/queries/exploreTypes";

/* ─── interfaces ─────────────────────────────────────────────────────────── */

interface ExploreClientProps {
  initialFeatured:  Character[];
  initialTrending:  Character[];
  initialNew:       Character[];
  initialFavorites: Character[];
  favoriteIds:      string[];
  isLoggedIn:       boolean;
  userCanSeeNsfw:   boolean;
  username:         string | null;
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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",       label: "NEWEST FIRST"  },
  { value: "popular",      label: "MOST POPULAR"  },
  { value: "alphabetical", label: "A → Z"          },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */

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

/* ─── NxCard ─────────────────────────────────────────────────────────────── */

function NxCard({
  character, isFavorited = false, isLoggedIn = false, rank, badge, userCanSeeNsfw = true,
}: {
  character: Character; isFavorited?: boolean;
  isLoggedIn?: boolean; rank?: number; badge?: string; userCanSeeNsfw?: boolean;
}) {
  const isNsfwBlurred = character.is_nsfw && !userCanSeeNsfw;
  const pal  = palette(character.id);
  const [fav, setFav]   = useState(isFavorited);
  const [busy, setBusy] = useState(false);
  const [tip, setTip]   = useState(false);
  const [hov, setHov]   = useState(false);

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
      href={isNsfwBlurred ? "/settings" : `/character/${character.id}`}
      className="group relative block overflow-hidden rounded-2xl select-none"
      style={{
        aspectRatio: "2/3",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? 0.55 : 0.14})`,
        boxShadow: hov ? `0 28px 56px rgba(0,0,0,.7),0 0 48px rgba(${pal.glow},.18)` : "0 4px 24px rgba(0,0,0,.4)",
        transform: hov ? "translateY(-5px) scale(1.012)" : "none",
        transition: "border-color .25s,box-shadow .25s,transform .25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.8),transparent)`, opacity: hov ? 1 : .3 }} />

      {/* Image */}
      {character.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={character.avatar_url} alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hov ? "scale(1.07)" : "scale(1)", filter: isNsfwBlurred ? "blur(20px) saturate(0.4)" : "none" }} loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ filter: isNsfwBlurred ? "blur(20px) saturate(0.4)" : "none" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 60% at 50% 55%,rgba(${pal.glow},.15) 0%,transparent 70%)` }} />
          <span className="relative z-10 font-black select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem,10cqi,6rem)",
              color: pal.fg,
              textShadow: `0 0 48px rgba(${pal.glow},.6)`,
            }}>
            {character.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "65%", background: "linear-gradient(to top,rgba(5,2,13,.97) 0%,rgba(5,2,13,.5) 55%,transparent 100%)" }} />

      {/* NSFW overlay */}
      {isNsfwBlurred && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.9)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-[7px] tracking-[1.5px] uppercase text-center leading-tight"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(245,158,11,0.9)" }}>NSFW Content</span>
          <span className="text-[6px] tracking-[1px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(245,158,11,0.6)" }}>Enable in Settings →</span>
        </div>
      )}

      {/* Rank / badge */}
      {rank != null ? (
        <span className="absolute top-3 left-3 z-30 font-black leading-none"
          style={{ fontFamily: "var(--font-display)", fontSize: 14, color: rankColor(rank), textShadow: `0 0 18px ${rankColor(rank)}` }}>
          #{rank}
        </span>
      ) : badge ? (
        <span className="absolute top-3 left-3 z-30 text-[7px] tracking-[2px] uppercase px-2 py-1 rounded"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.95)`, background: "rgba(0,0,0,.6)", border: `1px solid rgba(${pal.glow},.4)`, backdropFilter: "blur(6px)" }}>
          {badge}
        </span>
      ) : null}

      {/* Fav button */}
      <button onClick={handleFav} disabled={busy}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", boxShadow: fav ? `0 0 12px rgba(${pal.glow},.6)` : "none" }}>
        <svg width="13" height="13" viewBox="0 0 24 24"
          fill={fav ? pal.fg : "none"} stroke={fav ? pal.fg : "rgba(255,255,255,.55)"} strokeWidth="2"
          style={{ filter: fav ? `drop-shadow(0 0 5px rgba(${pal.glow},.8))` : "none", transition: "all .2s" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-8">
        {character.subtitle && (
          <p className="text-[10px] leading-relaxed mb-1.5 line-clamp-2 transition-all duration-300"
            style={{
              fontFamily: "var(--font-body)", color: "rgba(226,217,243,.65)",
              opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(6px)",
            }}>
            {character.subtitle}
          </p>
        )}
        <div className="font-black tracking-wide leading-tight truncate"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(13px,3.5cqi,16px)",
            color: hov ? pal.fg : "#fff",
            textShadow: hov ? `0 0 20px rgba(${pal.glow},.7)` : "none",
            transition: "color .25s,text-shadow .25s",
          }}>
          {character.name}
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[8px] tracking-[1.5px] uppercase truncate"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.55)` }}>
            {character.is_platform ? "◈ nexcor" : "◈ community"}
          </span>
          {character.chat_count > 0 && (
            <span className="flex items-center gap-1 text-[8px] tabular-nums flex-shrink-0"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.45)` }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {fmt(character.chat_count)}
            </span>
          )}
        </div>

        {/* Primary tags — 1-2 always visible */}
        {character.tags && character.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {character.tags.slice(0, 2).map(tag => (
              <span key={tag}
                className="text-[7px] tracking-[0.8px] px-1.5 py-0.5 rounded-full uppercase leading-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: `rgba(${pal.glow},.1)`,
                  border: `1px solid rgba(${pal.glow},.28)`,
                  color: `rgba(${pal.glow},.75)`,
                }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 transition-all duration-300"
          style={{ opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(5px)" }}>
          <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[3px] font-bold px-3 py-1.5 rounded-full"
            style={{
              fontFamily: "var(--font-mono)", color: pal.fg,
              background: `rgba(${pal.glow},.14)`,
              border: `1px solid rgba(${pal.glow},.5)`,
              boxShadow: `0 0 16px rgba(${pal.glow},.3)`,
            }}>
            CHAT NOW →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── UserCard ───────────────────────────────────────────────────────────── */

function UserCard({ user }: { user: UserProfile }) {
  const [hov, setHov] = useState(false);
  const letter = user.username?.[0]?.toUpperCase() ?? "?";

  return (
    <Link href={`/profile/${user.username}`}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-250 select-none"
      style={{
        background: hov ? "rgba(0,229,255,0.06)" : "rgba(12,5,32,0.6)",
        border: `1px solid ${hov ? "rgba(0,229,255,0.3)" : "rgba(124,58,237,0.18)"}`,
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,.5),0 0 24px rgba(0,229,255,.08)" : "none",
        transform: hov ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
        style={{
          border: `2px solid ${hov ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.3)"}`,
          boxShadow: hov ? "0 0 20px rgba(0,229,255,0.2)" : "none",
          transition: "border-color .25s,box-shadow .25s",
        }}>
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,rgba(124,58,237,.4),rgba(0,229,255,.25))" }}>
            <span className="font-black text-[22px]"
              style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 14px rgba(0,229,255,.5)" }}>
              {letter}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-[11px] tracking-[2px] uppercase font-bold mb-0.5"
          style={{ fontFamily: "var(--font-mono)", color: hov ? "#00e5ff" : "rgba(226,217,243,.8)", transition: "color .25s" }}>
          @{user.username}
        </div>
        {user.marks != null && (
          <div className="text-[9px] tracking-[1.5px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.4)" }}>
            ⟡ {user.marks >= 1000 ? `${(user.marks / 1000).toFixed(1)}k` : user.marks} marks
          </div>
        )}
      </div>

      <span className="text-[8px] tracking-[2px] uppercase transition-all duration-250"
        style={{ fontFamily: "var(--font-mono)", color: hov ? "rgba(0,229,255,.7)" : "transparent" }}>
        VIEW PROFILE →
      </span>
    </Link>
  );
}

/* ─── CreateCard ─────────────────────────────────────────────────────────── */

function CreateCard() {
  const [hov, setHov] = useState(false);
  return (
    <Link href="/create"
      className="relative block overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "2/3",
        background: "rgba(0,229,255,0.03)",
        border: `1px solid rgba(0,229,255,${hov ? .45 : .12})`,
        boxShadow: hov ? "0 28px 56px rgba(0,0,0,.6),0 0 36px rgba(0,229,255,.12)" : "none",
        transform: hov ? "translateY(-5px) scale(1.012)" : "none",
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(0,229,255,.05) 0%,transparent 70%)" }} />
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,.35),transparent)", opacity: hov ? 1 : .3 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{ background: "rgba(0,229,255,.07)", border: "1.5px solid rgba(0,229,255,.25)", boxShadow: hov ? "0 0 28px rgba(0,229,255,.35)" : "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <div className="text-center px-3">
          <div className="text-[10px] tracking-[3px] uppercase mb-1"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.75)" }}>CREATE YOUR OWN</div>
          <div className="text-[8px] tracking-[1px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.4)" }}>BUILD AN AI CHARACTER</div>
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

function NxGridSkeleton({ count = 10 }: { count?: number }) {
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
    <div className="flex items-center gap-3 mb-5 ex-label-in">
      <div className="flex-shrink-0 w-0.5 h-7 rounded-full"
        style={{ background: `linear-gradient(to bottom,${color},rgba(124,58,237,.35))`, boxShadow: `0 0 8px ${color}60` }} />
      <div>
        <h2 className="text-[13px] md:text-[15px] tracking-[3.5px] uppercase font-black leading-none"
          style={{ fontFamily: "var(--font-display)", color: "#fff", textShadow: `0 0 28px ${color}30` }}>{title}</h2>
        {sub && <p className="text-[8px] tracking-[3px] uppercase mt-1"
          style={{ fontFamily: "var(--font-mono)", color: `${color}55`, letterSpacing: "3px" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── HorizontalRail ─────────────────────────────────────────────────────── */

function HorizontalRail({ title, sub, chars, favoriteIds, isLoggedIn, showRanks = false, color = "#00e5ff", userCanSeeNsfw = true }: {
  title: string; sub?: string; chars: Character[]; favoriteIds: Set<string>;
  isLoggedIn: boolean; showRanks?: boolean; color?: string; userCanSeeNsfw?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (chars.length === 0) return null;
  const scroll = (d: "l" | "r") => ref.current?.scrollBy({ left: d === "l" ? -220 : 220, behavior: "smooth" });

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <SectionLabel title={title} sub={sub} color={color} />
        <div className="hidden md:flex gap-1.5">
          {(["l", "r"] as const).map(d => (
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
              <NxCard character={c} isFavorited={favoriteIds.has(c.id)}
                isLoggedIn={isLoggedIn} rank={showRanks ? i + 1 : undefined} userCanSeeNsfw={userCanSeeNsfw} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SpotlightBanner ────────────────────────────────────────────────────── */

function SpotlightBanner({ character, isFavorited, isLoggedIn, userCanSeeNsfw = true }: {
  character: Character; isFavorited: boolean; isLoggedIn: boolean; userCanSeeNsfw?: boolean;
}) {
  const pal  = palette(character.id);
  const [hov, setHov]   = useState(false);
  const [fav, setFav]   = useState(isFavorited);
  const [busy, setBusy] = useState(false);
  const isNsfwBlurred = character.is_nsfw && !userCanSeeNsfw;

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn || busy) return;
    setBusy(true);
    try { setFav(await toggleFavorite(character.id, fav)); }
    finally { setBusy(false); }
  };

  return (
    <Link href={isNsfwBlurred ? "/settings" : `/character/${character.id}`}
      className="relative block overflow-hidden rounded-3xl mb-10 select-none"
      style={{
        height: "clamp(220px,35vw,380px)",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? .55 : .18})`,
        boxShadow: hov ? `0 32px 72px rgba(0,0,0,.7),0 0 60px rgba(${pal.glow},.2)` : "0 8px 40px rgba(0,0,0,.5)",
        transition: "border-color .3s,box-shadow .3s,transform .3s cubic-bezier(.4,0,.2,1)",
        transform: hov ? "scale(1.004)" : "none",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      {character.avatar_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={character.avatar_url} alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hov ? "scale(1.04)" : "scale(1)", objectPosition: "top center", filter: isNsfwBlurred ? "blur(24px) saturate(0.4)" : "none" }} />
      )}
      {!character.avatar_url && (
        <div className="absolute inset-0 flex items-center justify-end pr-16 pointer-events-none">
          <span className="font-black select-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)", color: `rgba(${pal.glow},.12)` }}>
            {character.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right,rgba(5,2,13,.95) 0%,rgba(5,2,13,.6) 45%,rgba(5,2,13,.1) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top,rgba(5,2,13,.85) 0%,transparent 100%)" }} />
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,rgba(${pal.glow},.8),transparent 60%)`, opacity: hov ? 1 : .4 }} />

      {isNsfwBlurred && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.9)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-[11px] tracking-[2px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(245,158,11,0.9)" }}>NSFW Content</span>
          <span className="text-[9px] tracking-[1.5px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(245,158,11,0.6)" }}>Enable in Settings →</span>
        </div>
      )}

      <button onClick={handleFav} disabled={busy}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", boxShadow: fav ? `0 0 16px rgba(${pal.glow},.7)` : "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill={fav ? pal.fg : "none"} stroke={fav ? pal.fg : "rgba(255,255,255,.6)"} strokeWidth="2"
          style={{ filter: fav ? `drop-shadow(0 0 6px rgba(${pal.glow},.9))` : "none", transition: "all .2s" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {character.is_platform && (
        <span className="absolute top-4 left-4 z-20 text-[8px] tracking-[2px] uppercase px-2.5 py-1 rounded"
          style={{ fontFamily: "var(--font-mono)", color: "#00e5ff", background: "rgba(0,0,0,.6)", border: "1px solid rgba(0,229,255,.4)", backdropFilter: "blur(8px)" }}>
          ◈ NEXCOR ORIGINAL
        </span>
      )}

      <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 md:p-10 max-w-xl z-10">
        <div className="text-[8px] tracking-[4px] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.65)` }}>
          ◈ FEATURED · SPOTLIGHT
        </div>
        <h3 className="font-black tracking-wide leading-none mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,52px)", color: "#fff", textShadow: `0 0 40px rgba(${pal.glow},.35)` }}>
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

/* ─── InlineSort ─────────────────────────────────────────────────────────── */

function InlineSort({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative flex-shrink-0">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] tracking-[1.5px] uppercase transition-all duration-200 whitespace-nowrap active:scale-95"
        style={{
          fontFamily: "var(--font-mono)",
          background: open ? "rgba(0,229,255,0.08)" : "rgba(8,4,26,0.8)",
          border: `1px solid ${open ? "rgba(0,229,255,0.38)" : "rgba(124,58,237,0.22)"}`,
          color: open ? "#00e5ff" : "rgba(167,139,250,0.75)",
        }}
        onMouseEnter={e => {
          if (!open) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(0,229,255,0.07)";
            el.style.borderColor = "rgba(0,229,255,0.32)";
            el.style.color = "rgba(0,229,255,0.9)";
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "0 4px 16px rgba(0,229,255,0.1)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(8,4,26,0.8)";
            el.style.borderColor = "rgba(124,58,237,0.22)";
            el.style.color = "rgba(167,139,250,0.75)";
            el.style.transform = "";
            el.style.boxShadow = "";
          }
        }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
        </svg>
        <span className="hidden sm:inline">{current.label}</span>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-48 rounded-xl"
            style={{
              background: "rgba(8,4,26,0.98)",
              border: "1px solid rgba(0,229,255,0.16)",
              boxShadow: "0 20px 40px rgba(0,0,0,.65),0 0 0 1px rgba(0,229,255,.04)",
              backdropFilter: "blur(24px)",
            }}>
            <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,.4),transparent)" }} />
            <div className="p-1.5">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] tracking-[2px] uppercase text-left transition-colors duration-100"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: value === opt.value ? "rgba(0,229,255,0.09)" : "transparent",
                    color: value === opt.value ? "#00e5ff" : "rgba(167,139,250,0.6)",
                  }}
                  onMouseEnter={e => { if (value !== opt.value) { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,.8)"; } }}
                  onMouseLeave={e => { if (value !== opt.value) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,.6)"; } }}
                >
                  <span className="w-3 text-[10px]" style={{ color: "#00e5ff" }}>{value === opt.value ? "✓" : ""}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── InlineFilter ───────────────────────────────────────────────────────── */

function InlineFilter({ filters, onChange }: {
  filters: ExploreFilters; onChange: (f: ExploreFilters) => void;
}) {
  const [open, setOpen] = useState(false);

  const activeCount =
    filters.genders.length +
    (filters.creator !== "all" ? 1 : 0) +
    (filters.tags?.length ?? 0);

  const toggleGender = (g: string) => onChange({
    ...filters,
    genders: filters.genders.includes(g)
      ? filters.genders.filter(x => x !== g)
      : [...filters.genders, g],
  });

  const toggleTag = (t: string) => onChange({
    ...filters,
    tags: (filters.tags ?? []).includes(t)
      ? (filters.tags ?? []).filter(x => x !== t)
      : [...(filters.tags ?? []), t],
  });

  const CREATOR_OPTS = [
    { value: "all",       label: "ALL"       },
    { value: "platform",  label: "NEXCOR"    },
    { value: "community", label: "COMMUNITY" },
  ] as const;

  return (
    <div className="relative flex-shrink-0">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] tracking-[1.5px] uppercase transition-all duration-200 active:scale-95"
        style={{
          fontFamily: "var(--font-mono)",
          background: open || activeCount > 0 ? "rgba(0,229,255,0.08)" : "rgba(8,4,26,0.8)",
          border: `1px solid ${open || activeCount > 0 ? "rgba(0,229,255,0.38)" : "rgba(124,58,237,0.22)"}`,
          color: open || activeCount > 0 ? "#00e5ff" : "rgba(167,139,250,0.75)",
        }}
        onMouseEnter={e => {
          if (!open && activeCount === 0) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(0,229,255,0.07)";
            el.style.borderColor = "rgba(0,229,255,0.32)";
            el.style.color = "rgba(0,229,255,0.9)";
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "0 4px 16px rgba(0,229,255,0.1)";
          }
        }}
        onMouseLeave={e => {
          if (!open && activeCount === 0) {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(8,4,26,0.8)";
            el.style.borderColor = "rgba(124,58,237,0.22)";
            el.style.color = "rgba(167,139,250,0.75)";
            el.style.transform = "";
            el.style.boxShadow = "";
          }
        }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        FILTER
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-black"
            style={{ background: "#00e5ff", color: "#05020d" }}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-80 rounded-xl max-h-[80vh] overflow-y-auto"
            style={{
              background: "rgba(8,4,26,0.98)",
              border: "1px solid rgba(0,229,255,0.16)",
              boxShadow: "0 20px 40px rgba(0,0,0,.65)",
              backdropFilter: "blur(24px)",
              scrollbarWidth: "none",
            }}>
            <div className="h-px sticky top-0" style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,.4),transparent)" }} />

            <div className="p-4 space-y-5">
              {/* CREATOR */}
              <div>
                <div className="text-[8px] tracking-[3px] uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.45)" }}>◈ CREATOR</div>
                <div className="flex gap-1.5">
                  {CREATOR_OPTS.map(opt => (
                    <button key={opt.value}
                      onClick={() => onChange({ ...filters, creator: opt.value })}
                      className="flex-1 py-1.5 rounded-md text-[9px] tracking-[1.5px] uppercase transition-all duration-150"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: filters.creator === opt.value ? "rgba(0,229,255,0.12)" : "rgba(12,5,32,0.6)",
                        border: `1px solid ${filters.creator === opt.value ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.18)"}`,
                        color: filters.creator === opt.value ? "#00e5ff" : "rgba(122,106,154,0.65)",
                        boxShadow: filters.creator === opt.value ? "0 0 8px rgba(0,229,255,0.12)" : "none",
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GENDER */}
              <div>
                <div className="text-[8px] tracking-[3px] uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.45)" }}>◈ GENDER / PRONOUNS</div>
                <div className="space-y-1">
                  {GENDER_OPTIONS.map(g => {
                    const checked = filters.genders.includes(g);
                    return (
                      <button key={g} onClick={() => toggleGender(g)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 text-left"
                        style={{
                          background: checked ? "rgba(0,229,255,0.06)" : "transparent",
                          border: `1px solid ${checked ? "rgba(0,229,255,0.18)" : "transparent"}`,
                        }}>
                        <span className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-150"
                          style={{
                            background: checked ? "#00e5ff" : "transparent",
                            border: `1.5px solid ${checked ? "#00e5ff" : "rgba(122,106,154,0.32)"}`,
                            boxShadow: checked ? "0 0 6px rgba(0,229,255,.45)" : "none",
                          }}>
                          {checked && (
                            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                              <polyline points="1,5 3.5,7.5 9,2" stroke="#05020d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: checked ? "rgba(226,217,243,.9)" : "rgba(122,106,154,.55)" }}>
                          {g}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAGS — grouped */}
              {Object.entries(TAG_GROUPS).map(([groupName, groupTags]) => (
                <div key={groupName}>
                  <div className="text-[8px] tracking-[3px] uppercase mb-2"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.45)" }}>◈ {groupName}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {groupTags.map(tag => {
                      const active = (filters.tags ?? []).includes(tag);
                      return (
                        <button key={tag} onClick={() => toggleTag(tag)}
                          className="px-2.5 py-1 rounded-full text-[9px] tracking-[1px] uppercase transition-all duration-150"
                          style={{
                            fontFamily: "var(--font-mono)",
                            background: active ? "rgba(0,229,255,0.12)" : "rgba(12,5,32,0.6)",
                            border: `1px solid ${active ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.18)"}`,
                            color: active ? "#00e5ff" : "rgba(122,106,154,.55)",
                            boxShadow: active ? "0 0 8px rgba(0,229,255,0.14)" : "none",
                          }}>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Clear */}
              {activeCount > 0 && (
                <button
                  onClick={() => { onChange({ ...filters, genders: [], creator: "all", tags: [] }); setOpen(false); }}
                  className="w-full py-2 rounded-lg text-[9px] tracking-[2px] uppercase transition-all duration-150"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "rgba(244,114,182,0.06)",
                    border: "1px solid rgba(244,114,182,0.2)",
                    color: "rgba(244,114,182,.7)",
                  }}>
                  ✕ CLEAR ALL FILTERS
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── ExploreClient ──────────────────────────────────────────────────────── */

export function ExploreClient({
  initialFeatured, initialTrending, initialNew, initialFavorites,
  favoriteIds: initialFavoriteIds, isLoggedIn, userCanSeeNsfw,
}: ExploreClientProps) {
  const [inputSearch,  setInputSearch]  = useState("");
  const [filters,      setFilters]      = useState<ExploreFilters>({ ...DEFAULT_FILTERS, showNsfw: userCanSeeNsfw });
  const [activeTab,    setActiveTab]    = useState<TabKey>("all");
  const [charResults,  setCharResults]  = useState<Character[]>([]);
  const [userResults,  setUserResults]  = useState<UserProfile[]>([]);
  const [searching,    setSearching]    = useState(false);

  // Single debounce — push raw input into filters.search after 320ms
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: inputSearch })), 320);
    return () => clearTimeout(t);
  }, [inputSearch]);

  const favoriteIds = useMemo(() => new Set(initialFavoriteIds), [initialFavoriteIds]);

  // Client-side sorted initial data so sort dropdown works instantly
  const sortedFeatured  = useMemo(() => clientSort(initialFeatured,  filters.sort), [initialFeatured,  filters.sort]);
  const sortedTrending  = useMemo(() => clientSort(initialTrending,  filters.sort), [initialTrending,  filters.sort]);
  const sortedNew       = useMemo(() => clientSort(initialNew,       filters.sort), [initialNew,       filters.sort]);
  const sortedFavorites = useMemo(() => clientSort(initialFavorites, filters.sort), [initialFavorites, filters.sort]);

  // Any active search or filter?
  const hasText    = filters.search.trim().length > 0;
  const hasFilters = filters.genders.length > 0 || filters.creator !== "all" || (filters.tags?.length ?? 0) > 0;
  const isSearchMode = hasText || hasFilters;

  // Fire server queries when search/filter changes
  useEffect(() => {
    if (!isSearchMode) {
      setCharResults([]);
      setUserResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);

    Promise.all([
      fetchFilteredClient(filters, userCanSeeNsfw),
      hasText ? searchUsers(filters.search) : Promise.resolve([] as UserProfile[]),
    ]).then(([chars, users]) => {
      if (!cancelled) {
        setCharResults(chars);
        setUserResults(users);
        setSearching(false);
      }
    });

    return () => { cancelled = true; };
  }, [filters, isSearchMode, hasText, userCanSeeNsfw]);

  // Tab content for non-search mode
  const tabData = useMemo(() => {
    switch (activeTab) {
      case "featured":  return { chars: sortedFeatured, title: "FEATURED",         sub: "Curated by Nexcor",     showRanks: false };
      case "trending":  return { chars: sortedTrending, title: "TRENDING",         sub: "Most active this week", showRanks: filters.sort === "newest" };
      case "new":       return { chars: sortedNew,      title: "NEW ARRIVALS",     sub: "Recently awakened",     showRanks: false };
      case "nexcor":    return { chars: clientSort([...sortedFeatured, ...sortedTrending, ...sortedNew].filter(c => c.is_platform).filter((c,i,a) => a.findIndex(x => x.id===c.id)===i), filters.sort), title: "NEXCOR ORIGINALS", sub: "Official characters", showRanks: false };
      case "community": return { chars: clientSort([...sortedFeatured, ...sortedTrending, ...sortedNew].filter(c => !c.is_platform).filter((c,i,a) => a.findIndex(x => x.id===c.id)===i), filters.sort), title: "COMMUNITY", sub: "Created by users", showRanks: false };
      default:          return null;
    }
  }, [activeTab, sortedFeatured, sortedTrending, sortedNew, filters.sort]);

  const clearTab = (key: TabKey) => {
    setActiveTab(key);
    setInputSearch("");
    setFilters(f => ({ ...f, search: "", genders: [], creator: "all", tags: [] }));
  };

  return (
    <div className="min-h-screen bg-[#05020d]">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="relative pt-6 pb-4 px-4 md:px-8 overflow-x-hidden" style={{ zIndex: 32 }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(0,212,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 90% at 50% -10%,rgba(0,212,255,.08) 0%,transparent 65%)" }} />

        {/* ── Scanner logo mark ── */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative inline-flex items-center justify-center mb-4" style={{ width: 100, height: 100 }}>
            {/* Ambient breathe glow */}
            <div className="absolute rounded-full pointer-events-none ex-breathe"
              style={{
                inset: -24,
                background: "radial-gradient(circle,rgba(0,212,255,0.18) 0%,rgba(0,212,255,0.04) 45%,transparent 70%)",
              }} />

            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden="true">

              {/* Outer orbital ring + 4 nodes */}
              <g className="ex-orbit">
                <circle cx="50" cy="50" r="46" stroke="rgba(0,212,255,0.18)" strokeWidth="1" strokeDasharray="6 10"/>
                <circle cx="50" cy="4"   r="2.5" fill="#00d4ff" className="ex-node" />
                <circle cx="96" cy="50"  r="2.5" fill="#a78bfa" className="ex-node" style={{ animationDelay: ".8s" }} />
                <circle cx="50" cy="96"  r="2.5" fill="#00d4ff" className="ex-node" style={{ animationDelay: "1.6s" }} />
                <circle cx="4"  cy="50"  r="2.5" fill="#a78bfa" className="ex-node" style={{ animationDelay: "2.4s" }} />
              </g>

              {/* Concentric radar rings */}
              <circle cx="50" cy="50" r="35" stroke="rgba(0,212,255,0.09)" strokeWidth="0.8"/>
              <circle cx="50" cy="50" r="23" stroke="rgba(0,212,255,0.11)" strokeWidth="0.8"/>
              <circle cx="50" cy="50" r="12" stroke="rgba(0,212,255,0.14)" strokeWidth="0.8"/>

              {/* Cardinal crosshair spokes (gap at inner r=12) */}
              <line x1="50" y1="4"  x2="50" y2="38"  stroke="rgba(0,212,255,0.12)" strokeWidth="0.8"/>
              <line x1="96" y1="50" x2="62" y2="50"  stroke="rgba(0,212,255,0.12)" strokeWidth="0.8"/>
              <line x1="50" y1="96" x2="50" y2="62"  stroke="rgba(0,212,255,0.12)" strokeWidth="0.8"/>
              <line x1="4"  y1="50" x2="38" y2="50"  stroke="rgba(0,212,255,0.12)" strokeWidth="0.8"/>

              {/* Sweep arm (rotates full 360°) */}
              <g className="ex-sweep">
                {/* Trailing fade — fat lines at offsets */}
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(0,229,255,0.04)" strokeWidth="20" strokeLinecap="butt" transform="rotate(-42 50 50)"/>
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(0,229,255,0.07)" strokeWidth="12" strokeLinecap="butt" transform="rotate(-26 50 50)"/>
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(0,229,255,0.13)" strokeWidth="6"  strokeLinecap="butt" transform="rotate(-13 50 50)"/>
                {/* Main arm */}
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(0,229,255,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Tip glow dot */}
                <circle cx="50" cy="7" r="2.2" fill="rgba(0,229,255,0.95)"
                  style={{ filter: "drop-shadow(0 0 5px rgba(0,229,255,1))" }}/>
              </g>

              {/* Signal ping dots scattered at ring intersections */}
              <circle cx="71" cy="22" r="1.8" fill="#00d4ff" className="ex-ping"/>
              <circle cx="76" cy="64" r="1.5" fill="#a78bfa" className="ex-ping" style={{ animationDelay: "1.1s" }}/>
              <circle cx="18" cy="40" r="1.6" fill="#00d4ff" className="ex-ping" style={{ animationDelay: "2.0s" }}/>
              <circle cx="38" cy="78" r="1.4" fill="#a78bfa" className="ex-ping" style={{ animationDelay: "0.6s" }}/>
              <circle cx="28" cy="27" r="1.3" fill="#00d4ff" className="ex-ping" style={{ animationDelay: "1.7s" }}/>

              {/* Expanding ripple pulses */}
              <circle cx="50" cy="50" fill="none" stroke="rgba(0,229,255,0.55)" strokeWidth="1.5" r="5">
                <animate attributeName="r"       values="5;44"  dur="3s"   repeatCount="indefinite"/>
                <animate attributeName="opacity" values=".55;0" dur="3s"   repeatCount="indefinite"/>
              </circle>
              <circle cx="50" cy="50" fill="none" stroke="rgba(124,58,237,0.35)" strokeWidth="1" r="5">
                <animate attributeName="r"       values="5;44"  dur="3s"   begin="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values=".35;0" dur="3s"   begin="1.5s" repeatCount="indefinite"/>
              </circle>

              {/* Center crosshair ticks */}
              <line x1="46" y1="50" x2="42" y2="50" stroke="rgba(0,229,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="54" y1="50" x2="58" y2="50" stroke="rgba(0,229,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="50" y1="46" x2="50" y2="42" stroke="rgba(0,229,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="50" y1="54" x2="50" y2="58" stroke="rgba(0,229,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>

              {/* Center ⟡ diamond */}
              <polygon points="50,44 56,50 50,56 44,50" fill="rgba(0,229,255,0.9)" stroke="white" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="1.8" fill="white" opacity="0.95"/>
            </svg>
          </div>

          {/* System label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,.4))" }} />
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
              <span className="text-[8px] tracking-[5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,.4)" }}>
                SUBJECT CATALOG · 324B21
              </span>
            </div>
            <div className="w-8 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,.4))" }} />
          </div>

          <h1 className="font-black tracking-[6px] uppercase mb-1"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,42px)", color: "#fff" }}
            aria-label="EXPLORE">
            {"EXPLORE".split("").map((letter, i) => (
              <span key={i} className="ex-title-letter inline-block"
                style={{ animationDelay: `${i * 0.07}s, ${i * 0.35}s` }}>
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-[11px] italic mb-5" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.5)" }}>
            Discover characters and connect with creators
          </p>
        </div>

        {/* Search + Filter + Sort */}
        <div className="flex gap-2 items-center w-full max-w-4xl mb-3">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {searching ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: "nx-spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.45)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              )}
            </div>
            <input
              type="text"
              value={inputSearch}
              onChange={e => setInputSearch(e.target.value)}
              placeholder="Search characters, tags, or @username..."
              className="w-full pl-10 pr-8 py-2.5 rounded-lg text-[12px] text-[#e2d9f3] focus:outline-none transition-all duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(12,5,32,0.8)",
                border: "1px solid rgba(124,58,237,0.22)",
                letterSpacing: "0.4px",
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.35)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(0,229,255,.08),0 0 18px rgba(0,229,255,.05)"; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.22)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            />
            {inputSearch && (
              <button onClick={() => setInputSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] transition-opacity"
                style={{ color: "rgba(122,106,154,.45)" }}>
                ✕
              </button>
            )}
          </div>
          <InlineFilter filters={filters} onChange={setFilters} />
          <InlineSort value={filters.sort} onChange={sort => setFilters(f => ({ ...f, sort }))} />
        </div>

        {/* Active filter pills */}
        {(filters.genders.length > 0 || filters.creator !== "all" || (filters.tags?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {filters.genders.map(g => (
              <button key={g} onClick={() => setFilters(f => ({ ...f, genders: f.genders.filter(x => x !== g) }))}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] tracking-[1px] uppercase transition-all"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" }}>
                {g.split(" ·")[0]} <span style={{ opacity: .5 }}>✕</span>
              </button>
            ))}
            {filters.creator !== "all" && (
              <button onClick={() => setFilters(f => ({ ...f, creator: "all" }))}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] tracking-[1px] uppercase transition-all"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" }}>
                {filters.creator} <span style={{ opacity: .5 }}>✕</span>
              </button>
            )}
            {(filters.tags ?? []).map(t => (
              <button key={t} onClick={() => setFilters(f => ({ ...f, tags: (f.tags ?? []).filter(x => x !== t) }))}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] tracking-[1px] uppercase transition-all"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                {t} <span style={{ opacity: .5 }}>✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 px-4 md:px-8 pb-3"
        style={{ background: "rgba(5,2,13,.95)", borderBottom: "1px solid rgba(124,58,237,.1)", backdropFilter: "blur(20px)" }}>
        <div className="flex gap-1.5 pt-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map(t => {
            const active = activeTab === t.key && !isSearchMode;
            return (
              <button key={t.key} onClick={() => clearTab(t.key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all duration-200 active:scale-95"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? "#fff" : "rgba(122,106,154,.6)",
                  background: active ? "rgba(0,229,255,.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(0,229,255,.4)" : "rgba(124,58,237,.15)"}`,
                  boxShadow: active ? "0 0 14px rgba(0,229,255,.18)" : "none",
                  fontWeight: active ? 700 : 400,
                }}
                onMouseEnter={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "rgba(167,139,250,.9)";
                    el.style.background = "rgba(124,58,237,.1)";
                    el.style.borderColor = "rgba(124,58,237,.35)";
                    el.style.transform = "translateY(-1px)";
                    el.style.boxShadow = "0 4px 14px rgba(124,58,237,.12)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "rgba(122,106,154,.6)";
                    el.style.background = "transparent";
                    el.style.borderColor = "rgba(124,58,237,.15)";
                    el.style.transform = "";
                    el.style.boxShadow = "none";
                  }
                }}>
                {active && <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: t.dot, boxShadow: `0 0 6px ${t.dot}` }} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 pt-8 pb-28 md:pb-16 space-y-12 max-w-7xl mx-auto">

        {/* ── SEARCH / FILTER MODE ─────────────────────────────────── */}
        {isSearchMode ? (
          <>
            {/* Character results */}
            <section>
              <SectionLabel
                title={searching ? "SCANNING···" : `CHARACTERS · ${charResults.length}`}
                sub={searching ? undefined : charResults.length === 0 ? "no subjects match" : "matching entities"}
              />
              {searching ? (
                <NxGridSkeleton count={10} />
              ) : charResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-[11px] tracking-[4px] uppercase mb-2"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.4)" }}>
                    NO SUBJECTS MATCH YOUR SEARCH
                  </div>
                  <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,.3)" }}>
                    Try different keywords or clear your filters.
                  </p>
                </div>
              ) : (
                <NxGrid>
                  {charResults.map(c => (
                    <NxCard key={c.id} character={c} isFavorited={favoriteIds.has(c.id)} isLoggedIn={isLoggedIn} userCanSeeNsfw={userCanSeeNsfw} />
                  ))}
                  <CreateCard />
                </NxGrid>
              )}
            </section>

            {/* User results — only shown when there's search text */}
            {hasText && (
              <section>
                <SectionLabel
                  title={searching ? "SCANNING USERS···" : `USERS · ${userResults.length}`}
                  sub={userResults.length > 0 ? "matching profiles" : "no profiles found"}
                  color="#a78bfa"
                />
                {!searching && userResults.length === 0 ? (
                  <div className="text-[10px] tracking-[3px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.3)" }}>
                    NO USERS FOUND FOR &quot;{filters.search}&quot;
                  </div>
                ) : !searching ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                    {userResults.map(u => <UserCard key={u.id} user={u} />)}
                  </div>
                ) : null}
              </section>
            )}
          </>

        ) : activeTab !== "all" && tabData ? (
          /* ── SINGLE TAB MODE ─────────────────────────────────────── */
          <section>
            <SectionLabel title={tabData.title} sub={tabData.sub} />
            {tabData.chars.length === 0 ? (
              <div className="text-center py-16 text-[11px] tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.3)" }}>
                NOTHING HERE YET
              </div>
            ) : (
              <NxGrid>
                {tabData.chars.map((c, i) => (
                  <NxCard key={c.id} character={c} isFavorited={favoriteIds.has(c.id)}
                    isLoggedIn={isLoggedIn} rank={tabData.showRanks ? i + 1 : undefined} userCanSeeNsfw={userCanSeeNsfw} />
                ))}
                <CreateCard />
              </NxGrid>
            )}
          </section>

        ) : (
          /* ── ALL TAB (default) ───────────────────────────────────── */
          <>
            {/* Spotlight: featured first, fall back to first trending/new */}
            {(() => {
              const spotlight = sortedFeatured[0] ?? sortedTrending[0] ?? sortedNew[0];
              if (!spotlight) return null;
              return (
                <SpotlightBanner
                  character={spotlight}
                  isFavorited={favoriteIds.has(spotlight.id)}
                  isLoggedIn={isLoggedIn}
                  userCanSeeNsfw={userCanSeeNsfw}
                />
              );
            })()}

            {sortedFeatured.length > 1 && (
              <section>
                <SectionLabel title="EDITOR'S CHOICE" sub="Curated by the Nexcor team" color="#fbbf24" />
                <NxGrid>
                  {sortedFeatured.slice(1, 10).map((c) => (
                    <NxCard key={c.id} character={c} isFavorited={favoriteIds.has(c.id)}
                      isLoggedIn={isLoggedIn} badge="◈ PICK" userCanSeeNsfw={userCanSeeNsfw} />
                  ))}
                  <CreateCard />
                </NxGrid>
              </section>
            )}

            <HorizontalRail title="TRENDING NOW" sub="Most active this week"
              chars={sortedTrending} favoriteIds={favoriteIds}
              isLoggedIn={isLoggedIn} showRanks color="#f472b6" userCanSeeNsfw={userCanSeeNsfw} />

            <HorizontalRail title="NEW ARRIVALS" sub="Recently awakened"
              chars={sortedNew} favoriteIds={favoriteIds}
              isLoggedIn={isLoggedIn} color="#34d399" userCanSeeNsfw={userCanSeeNsfw} />

            {isLoggedIn && sortedFavorites.length > 0 && (
              <HorizontalRail title="YOUR ARCHIVE" sub="Saved characters"
                chars={sortedFavorites} favoriteIds={favoriteIds}
                isLoggedIn={isLoggedIn} color="#a78bfa" userCanSeeNsfw={userCanSeeNsfw} />
            )}

            {/* Always show a full grid of all characters so nothing is ever blank */}
            {(() => {
              const allChars = clientSort(
                [...sortedTrending, ...sortedNew, ...sortedFeatured]
                  .filter((c, i, a) => a.findIndex(x => x.id === c.id) === i),
                filters.sort
              );
              if (allChars.length === 0) return (
                <section>
                  <SectionLabel title="NO CHARACTERS YET" sub="Be the first to create one" />
                  <div className="text-center py-10">
                    <p className="text-[12px] mb-6" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,.4)" }}>
                      No characters have been published yet. Create the first one!
                    </p>
                    <div style={{ maxWidth: 160, margin: "0 auto" }}><CreateCard /></div>
                  </div>
                </section>
              );
              return (
                <section>
                  <SectionLabel title="ALL CHARACTERS" sub={`${allChars.length} published`} />
                  <NxGrid>
                    {allChars.map((c) => (
                      <NxCard key={c.id} character={c} isFavorited={favoriteIds.has(c.id)}
                        isLoggedIn={isLoggedIn} userCanSeeNsfw={userCanSeeNsfw} />
                    ))}
                    <CreateCard />
                  </NxGrid>
                </section>
              );
            })()}
          </>
        )}
      </div>

      <style>{`
        @keyframes nx-spin      { to { transform: rotate(360deg); } }
        @keyframes exOrbit      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes exSweep      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes exNode       { 0%,100% { opacity:.35; } 50% { opacity:1; } }
        @keyframes exPing       { 0%,100% { opacity:.15; transform:scale(1); } 50% { opacity:1; transform:scale(1.6); } }
        @keyframes exBreathe    { 0%,100% { transform:scale(1); opacity:.6; } 50% { transform:scale(1.08); opacity:1; } }
        @keyframes exTitleIn    { from { opacity:0; transform:translateY(14px) scaleY(0.8); } to { opacity:1; transform:translateY(0) scaleY(1); } }
        @keyframes exTitleGlow  { 0%,100% { text-shadow:0 0 40px rgba(0,212,255,.2); } 50% { text-shadow:0 0 55px rgba(0,212,255,.75),0 0 25px rgba(0,212,255,.45); } }
        @keyframes exLabelIn    { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        .ex-orbit       { animation: exOrbit   44s linear      infinite; transform-origin: 50px 50px; }
        .ex-sweep       { animation: exSweep   5s  linear      infinite; transform-origin: 50px 50px; }
        .ex-node        { animation: exNode    2.8s ease-in-out infinite; }
        .ex-ping        { animation: exPing    3.2s ease-in-out infinite; }
        .ex-breathe     { animation: exBreathe 4s   ease-in-out infinite; }
        .ex-title-letter {
          animation:
            exTitleIn   0.55s cubic-bezier(0.16,1,0.3,1) both,
            exTitleGlow 2.8s  ease-in-out                infinite;
        }
        .ex-label-in { animation: exLabelIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </div>
  );
}
