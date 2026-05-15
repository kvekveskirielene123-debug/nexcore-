"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/profile/FollowButton";
import { GiftMarksModal } from "@/components/profile/GiftMarksModal";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { FavoriteHeart } from "@/components/character/FavoriteHeart";
import type { FavCharacter } from "@/app/(app)/favorites/FavoritesClient";

interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  subscription_expires_at: string | null;
}
interface CharacterData {
  id: string;
  name: string;
  subtitle: string | null;
  avatar_url: string | null;
  is_nsfw: boolean;
  is_platform: boolean;
  tier: string;
  chat_count: number;
  visibility?: string;
}
interface Props {
  profile: ProfileData;
  characters: CharacterData[];
  followerCount: number;
  followingCount: number;
  viewerId: string | null;
  viewerFollowing: boolean;
  viewerBalance: number;
  isOwnProfile?: boolean;
  favorites?: FavCharacter[];
}

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
function hashId(s: string) {
  return s.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0) >>> 0;
}

/* ─── DNA Helix SVG ──────────────────────────────────────────────────────── */
// Two interleaved cubic-bezier sine waves with connecting rungs + node dots.
const STRAND1 = [
  "M 50,0",
  "C 100,0 100,50 50,50",   "C 0,50 0,100 50,100",
  "C 100,100 100,150 50,150","C 0,150 0,200 50,200",
  "C 100,200 100,250 50,250","C 0,250 0,300 50,300",
  "C 100,300 100,350 50,350","C 0,350 0,400 50,400",
  "C 100,400 100,450 50,450","C 0,450 0,500 50,500",
  "C 100,500 100,550 50,550","C 0,550 0,600 50,600",
].join(" ");
const STRAND2 = [
  "M 50,0",
  "C 0,0 0,50 50,50",       "C 100,50 100,100 50,100",
  "C 0,100 0,150 50,150",   "C 100,150 100,200 50,200",
  "C 0,200 0,250 50,250",   "C 100,250 100,300 50,300",
  "C 0,300 0,350 50,350",   "C 100,350 100,400 50,400",
  "C 0,400 0,450 50,450",   "C 100,450 100,500 50,500",
  "C 0,500 0,550 50,550",   "C 100,550 100,600 50,600",
].join(" ");
const RUNG_Y = [25,75,125,175,225,275,325,375,425,475,525,575];

function DnaHelix({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 600"
      preserveAspectRatio="none"
      className="absolute top-0 bottom-0 h-full pointer-events-none"
      style={{ width: 80, [flip ? "right" : "left"]: 0, transform: flip ? "scaleX(-1)" : "none" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={flip ? "dgf" : "dg"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="12%" stopColor="rgba(0,229,255,1)"/>
          <stop offset="88%" stopColor="rgba(124,58,237,1)"/>
          <stop offset="100%" stopColor="transparent"/>
        </linearGradient>
        <mask id={flip ? "dmf" : "dm"}>
          <rect x="0" y="0" width="100" height="600" fill={`url(#${flip ? "dgf" : "dg"})`}/>
        </mask>
      </defs>
      <g mask={`url(#${flip ? "dmf" : "dm"})`}>
        <path d={STRAND1} stroke="rgba(0,229,255,.55)" strokeWidth="1.2" fill="none"/>
        <path d={STRAND2} stroke="rgba(124,58,237,.55)" strokeWidth="1.2" fill="none"/>
        {RUNG_Y.map((y, i) => (
          <g key={y}>
            <line x1="8" y1={y} x2="92" y2={y}
              stroke={i % 2 === 0 ? "rgba(0,229,255,.25)" : "rgba(124,58,237,.25)"}
              strokeWidth="0.8"/>
            <circle cx="8"  cy={y} r="2.2" fill={i % 2 === 0 ? "#00e5ff" : "#a78bfa"} opacity=".7"/>
            <circle cx="92" cy={y} r="2.2" fill={i % 2 === 0 ? "#a78bfa" : "#00e5ff"} opacity=".7"/>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ─── Targeting reticle avatar ───────────────────────────────────────────── */
function TargetAvatar({ avatarUrl, initial, isBrilliant }: {
  avatarUrl: string | null; initial: string; isBrilliant: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer rotating dashed ring */}
      <svg className="absolute inset-0 w-full h-full prf-orbit" viewBox="0 0 220 220" fill="none" aria-hidden>
        <circle cx="110" cy="110" r="106" stroke="rgba(0,229,255,.2)" strokeWidth="1" strokeDasharray="7 5"/>
      </svg>

      {/* Static frame SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 220" fill="none" aria-hidden>
        {/* Inner avatar ring */}
        <circle cx="110" cy="110" r="74" stroke="rgba(0,229,255,.45)" strokeWidth="1.5"/>
        {/* Second ring */}
        <circle cx="110" cy="110" r="88" stroke="rgba(124,58,237,.2)" strokeWidth="1" strokeDasharray="3 5"/>

        {/* Cardinal tick marks */}
        {[0,90,180,270].map(deg => {
          const r = Math.PI * deg / 180;
          const x1 = 110 + 96 * Math.sin(r), y1 = 110 - 96 * Math.cos(r);
          const x2 = 110 + 107 * Math.sin(r), y2 = 110 - 107 * Math.cos(r);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,.7)" strokeWidth="2" strokeLinecap="round"/>;
        })}

        {/* Diagonal minor ticks */}
        {[45,135,225,315].map(deg => {
          const r = Math.PI * deg / 180;
          const x1 = 110 + 96 * Math.sin(r), y1 = 110 - 96 * Math.cos(r);
          const x2 = 110 + 103 * Math.sin(r), y2 = 110 - 103 * Math.cos(r);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,.3)" strokeWidth="1" strokeLinecap="round"/>;
        })}

        {/* Corner bracket marks at N/E/S/W */}
        {/* N bracket */}
        <path d="M 101,4 L 101,1 L 119,1 L 119,4" stroke="rgba(0,229,255,.6)" strokeWidth="1.2" fill="none"/>
        {/* S bracket */}
        <path d="M 101,216 L 101,219 L 119,219 L 119,216" stroke="rgba(0,229,255,.6)" strokeWidth="1.2" fill="none"/>
        {/* E bracket */}
        <path d="M 216,101 L 219,101 L 219,119 L 216,119" stroke="rgba(0,229,255,.6)" strokeWidth="1.2" fill="none"/>
        {/* W bracket */}
        <path d="M 4,101 L 1,101 L 1,119 L 4,119" stroke="rgba(0,229,255,.6)" strokeWidth="1.2" fill="none"/>

        {/* Data labels */}
        <text x="110" y="14" textAnchor="middle" fontSize="5.5" fill="rgba(0,229,255,.4)" fontFamily="monospace">000°</text>
        <text x="206" y="113" textAnchor="start"  fontSize="5.5" fill="rgba(0,229,255,.4)" fontFamily="monospace">090°</text>
        <text x="110" y="212" textAnchor="middle" fontSize="5.5" fill="rgba(0,229,255,.4)" fontFamily="monospace">180°</text>
        <text x="14"  y="113" textAnchor="end"    fontSize="5.5" fill="rgba(0,229,255,.4)" fontFamily="monospace">270°</text>

        {/* Crosshair center lines */}
        <line x1="110" y1="36" x2="110" y2="68" stroke="rgba(0,229,255,.15)" strokeWidth=".8"/>
        <line x1="110" y1="152" x2="110" y2="184" stroke="rgba(0,229,255,.15)" strokeWidth=".8"/>
        <line x1="36" y1="110" x2="68" y2="110" stroke="rgba(0,229,255,.15)" strokeWidth=".8"/>
        <line x1="152" y1="110" x2="184" y2="110" stroke="rgba(0,229,255,.15)" strokeWidth=".8"/>
      </svg>

      {/* Radar sweep arm */}
      <svg className="absolute inset-0 w-full h-full prf-sweep" viewBox="0 0 220 220" fill="none" aria-hidden style={{ transformOrigin: "110px 110px" }}>
        <line x1="110" y1="110" x2="110" y2="4" stroke="rgba(0,229,255,.06)" strokeWidth="18" strokeLinecap="butt" transform="rotate(-36 110 110)"/>
        <line x1="110" y1="110" x2="110" y2="4" stroke="rgba(0,229,255,.12)" strokeWidth="9"  strokeLinecap="butt" transform="rotate(-20 110 110)"/>
        <line x1="110" y1="110" x2="110" y2="4" stroke="rgba(0,229,255,.22)" strokeWidth="4"  strokeLinecap="butt" transform="rotate(-10 110 110)"/>
        <line x1="110" y1="110" x2="110" y2="4" stroke="rgba(0,229,255,.85)" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="110" cy="7" r="2.5" fill="rgba(0,229,255,.95)" style={{ filter: "drop-shadow(0 0 5px rgba(0,229,255,1))" }}/>
      </svg>

      {/* Avatar circle */}
      <div className="relative overflow-hidden rounded-full prf-avatar-glow z-10"
        style={{ width: 140, height: 140, border: "1.5px solid rgba(0,229,255,.4)", background: "#0c0520" }}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[54px] font-black"
              style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 28px rgba(0,229,255,.8)" }}>
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Brilliant badge */}
      {isBrilliant && (
        <div className="absolute bottom-6 right-6 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ background: "rgba(167,139,250,.95)", color: "#05020d", boxShadow: "0 0 14px rgba(167,139,250,.7)", border: "2px solid rgba(167,139,250,.5)" }}>
          ◈
        </div>
      )}
    </div>
  );
}

/* ─── HUD corner brackets ────────────────────────────────────────────────── */
function HudBrackets() {
  const s = "rgba(0,229,255,.35)";
  const len = 28, thick = 2;
  return (
    <>
      {/* TL */}
      <div className="absolute top-4 left-4 pointer-events-none" style={{ width: len, height: len }}>
        <div style={{ position:"absolute", top:0, left:0, width:len, height:thick, background:s }}/>
        <div style={{ position:"absolute", top:0, left:0, width:thick, height:len, background:s }}/>
      </div>
      {/* TR */}
      <div className="absolute top-4 right-4 pointer-events-none" style={{ width: len, height: len }}>
        <div style={{ position:"absolute", top:0, right:0, width:len, height:thick, background:s }}/>
        <div style={{ position:"absolute", top:0, right:0, width:thick, height:len, background:s }}/>
      </div>
      {/* BL */}
      <div className="absolute bottom-4 left-4 pointer-events-none" style={{ width: len, height: len }}>
        <div style={{ position:"absolute", bottom:0, left:0, width:len, height:thick, background:s }}/>
        <div style={{ position:"absolute", bottom:0, left:0, width:thick, height:len, background:s }}/>
      </div>
      {/* BR */}
      <div className="absolute bottom-4 right-4 pointer-events-none" style={{ width: len, height: len }}>
        <div style={{ position:"absolute", bottom:0, right:0, width:len, height:thick, background:s }}/>
        <div style={{ position:"absolute", bottom:0, right:0, width:thick, height:len, background:s }}/>
      </div>
    </>
  );
}

/* ─── Typewriter label ───────────────────────────────────────────────────── */
function TypeLabel({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState("");
  const [done,  setDone]  = useState(false);
  useEffect(() => {
    const t0 = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setShown(text.slice(0, i + 1));
        i++;
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, 38);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t0);
  }, [text, delay]);
  return (
    <span>
      {shown}
      {!done && <span className="prf-cursor">_</span>}
    </span>
  );
}

/* ─── Character portrait card ────────────────────────────────────────────── */
function CharCard({ c, isOwn }: { c: CharacterData; isOwn?: boolean }) {
  const pal = palette(c.id);
  const [hov, setHov] = useState(false);
  return (
    <Link href={`/character/${c.id}`}
      className="relative block overflow-hidden rounded-2xl select-none"
      style={{ aspectRatio: "2/3", background: pal.bg, border: `1px solid rgba(${pal.glow},${hov ? .5 : .14})`, boxShadow: hov ? `0 24px 50px rgba(0,0,0,.7),0 0 40px rgba(${pal.glow},.16)` : "0 4px 20px rgba(0,0,0,.4)", transform: hov ? "translateY(-5px) scale(1.012)" : "none", transition: "all .25s cubic-bezier(.4,0,.2,1)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.85),transparent)`, opacity: hov ? 1 : .3, transition: "opacity .25s" }}/>
      {c.avatar_url
        ? <img src={c.avatar_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover" // eslint-disable-line @next/next/no-img-element
            style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .7s ease", filter: c.is_nsfw ? "blur(18px) saturate(.4)" : "none" }} loading="lazy"/>
        : <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-black select-none opacity-70"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,9cqi,5.5rem)", color: pal.fg, textShadow: `0 0 40px rgba(${pal.glow},.6)` }}>
              {c.name.charAt(0).toUpperCase()}
            </span>
          </div>
      }
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "62%", background: "linear-gradient(to top,rgba(5,2,13,.97) 0%,rgba(5,2,13,.48) 55%,transparent 100%)" }}/>
      {c.is_nsfw && (
        <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.45)", color: "#f59e0b", backdropFilter: "blur(6px)" }}>NSFW</span>
      )}
      {isOwn && c.visibility === "private" && (
        <span className="absolute top-2.5 right-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.5)", color: "#a78bfa", backdropFilter: "blur(6px)" }}>PRIVATE</span>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6">
        <div className="font-black tracking-wide leading-tight truncate"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(12px,3cqi,15px)", color: hov ? pal.fg : "#fff", textShadow: hov ? `0 0 18px rgba(${pal.glow},.7)` : "none", transition: "color .25s,text-shadow .25s" }}>
          {c.name}
        </div>
        {c.subtitle && <p className="text-[9px] leading-relaxed truncate mt-0.5" style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.55)" }}>{c.subtitle}</p>}
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[7px] tracking-[1.5px] uppercase truncate" style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.5)` }}>{c.is_platform ? "◈ nexcor" : "◈ community"}</span>
          {c.chat_count > 0 && <span className="text-[7px] tabular-nums flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.4)` }}>{fmt(c.chat_count)} chats</span>}
        </div>
        <div className="mt-2 transition-all duration-300" style={{ opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(5px)" }}>
          <span className="inline-flex items-center gap-1 text-[8px] tracking-[2.5px] font-bold px-3 py-1.5 rounded-full"
            style={{ fontFamily: "var(--font-mono)", color: pal.fg, background: `rgba(${pal.glow},.12)`, border: `1px solid rgba(${pal.glow},.45)`, boxShadow: `0 0 14px rgba(${pal.glow},.28)` }}>
            CHAT NOW →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Favorite card ──────────────────────────────────────────────────────── */
function FavCard({ c }: { c: FavCharacter }) {
  const pal = palette(c.id);
  const [hov, setHov] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-2xl select-none"
      style={{ aspectRatio: "2/3", background: pal.bg, border: `1px solid rgba(${pal.glow},${hov ? .5 : .14})`, boxShadow: hov ? `0 24px 50px rgba(0,0,0,.7),0 0 40px rgba(${pal.glow},.16)` : "0 4px 20px rgba(0,0,0,.4)", transform: hov ? "translateY(-5px) scale(1.012)" : "none", transition: "all .25s cubic-bezier(.4,0,.2,1)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute top-0 inset-x-0 h-px z-10" style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.85),transparent)`, opacity: hov ? 1 : .3, transition: "opacity .25s" }}/>
      <Link href={`/character/${c.id}`} className="absolute inset-0">
        {c.avatar_url
          ? <img src={c.avatar_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover" // eslint-disable-line @next/next/no-img-element
              style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .7s ease", filter: c.is_nsfw ? "blur(18px) saturate(.4)" : "none" }} loading="lazy"/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black select-none opacity-70"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,9cqi,5.5rem)", color: pal.fg, textShadow: `0 0 40px rgba(${pal.glow},.6)` }}>
                {c.name.charAt(0).toUpperCase()}
              </span>
            </div>
        }
      </Link>
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "62%", background: "linear-gradient(to top,rgba(5,2,13,.97) 0%,rgba(5,2,13,.48) 55%,transparent 100%)" }}/>
      {c.is_nsfw && <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold" style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.45)", color: "#f59e0b", backdropFilter: "blur(6px)" }}>NSFW</span>}
      <div className="absolute top-2.5 right-2.5 z-30"><FavoriteHeart characterId={c.id} initialFavorited={true}/></div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6">
        <Link href={`/character/${c.id}`}>
          <div className="font-black tracking-wide leading-tight truncate" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(12px,3cqi,15px)", color: hov ? pal.fg : "#fff", textShadow: hov ? `0 0 18px rgba(${pal.glow},.7)` : "none", transition: "color .25s,text-shadow .25s" }}>{c.name}</div>
          {c.subtitle ? <p className="text-[9px] leading-relaxed truncate mt-0.5" style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.55)" }}>{c.subtitle}</p>
            : c.creator_username && !c.is_platform
              ? <p className="text-[9px] tracking-[1px] mt-0.5 truncate" style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.4)` }}>by {c.creator_username}</p>
              : null}
        </Link>
        <Link href={`/chat/${c.id}`}
          className="mt-2 flex items-center justify-center gap-1 py-1.5 rounded-full text-[8px] tracking-[2px] font-bold uppercase transition-all duration-200"
          style={{ fontFamily: "var(--font-mono)", background: `rgba(${pal.glow},.1)`, border: `1px solid rgba(${pal.glow},.3)`, color: `rgba(${pal.glow},.85)` }}
          onClick={e => e.stopPropagation()}>CHAT →</Link>
      </div>
    </div>
  );
}

/* ─── Add card ───────────────────────────────────────────────────────────── */
function AddCard() {
  const [hov, setHov] = useState(false);
  return (
    <Link href="/create" className="relative block overflow-hidden rounded-2xl"
      style={{ aspectRatio: "2/3", background: hov ? "rgba(0,229,255,.04)" : "rgba(0,229,255,.02)", border: `1px dashed rgba(0,229,255,${hov ? .45 : .15})`, boxShadow: hov ? "0 24px 50px rgba(0,0,0,.5),0 0 30px rgba(0,229,255,.08)" : "none", transform: hov ? "translateY(-5px) scale(1.012)" : "none", transition: "all .25s cubic-bezier(.4,0,.2,1)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{ background: "rgba(0,229,255,.07)", border: "1.5px solid rgba(0,229,255,.25)", boxShadow: hov ? "0 0 24px rgba(0,229,255,.35)" : "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span className="text-[8px] tracking-[2.5px] uppercase text-center" style={{ fontFamily: "var(--font-mono)", color: hov ? "rgba(0,229,255,.75)" : "rgba(0,229,255,.35)" }}>NEW ENTITY</span>
      </div>
    </Link>
  );
}

/* ─── ProfileClient ──────────────────────────────────────────────────────── */
export function ProfileClient({ profile, characters, followerCount, followingCount, viewerId, viewerFollowing, viewerBalance, isOwnProfile: isOwnProfileProp, favorites = [] }: Props) {
  const [giftOpen,  setGiftOpen]  = useState(false);
  const [balance,   setBalance]   = useState(viewerBalance);
  const [activeTab, setActiveTab] = useState<"entities"|"favourites">("entities");

  const isOwnProfile = isOwnProfileProp ?? (viewerId === profile.id);
  const isBrilliant  = isSubscriptionActive(profile.subscription_expires_at);
  const initial      = (profile.username[0] ?? "?").toUpperCase();
  const subjectTag   = profile.username.slice(0, 4).toUpperCase().padEnd(4, "X");
  const hexId        = hashId(profile.id ?? profile.username).toString(16).toUpperCase().padStart(8, "0");

  return (
    <div className="min-h-screen bg-[#05020d]">
      <style>{`
        @keyframes prfOrbit  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes prfSweep  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes prfAGlow  { 0%,100%{box-shadow:0 0 32px rgba(0,229,255,.2),0 0 64px rgba(124,58,237,.1)} 50%{box-shadow:0 0 56px rgba(0,229,255,.38),0 0 90px rgba(124,58,237,.18)} }
        @keyframes prfScan   { 0%{top:-2px;opacity:0} 8%{opacity:.45} 92%{opacity:.12} 100%{top:100%;opacity:0} }
        @keyframes prfOrb    { 0%,100%{transform:translate(0,0) scale(1)} 45%{transform:translate(16px,-20px) scale(1.05)} 75%{transform:translate(-10px,12px) scale(.97)} }
        @keyframes prfGlitch { 0%,78%,100%{text-shadow:0 0 48px rgba(0,229,255,.45);transform:none}
          79%{text-shadow:3px 0 0 rgba(255,0,128,.8),-3px 0 0 rgba(0,229,255,.8);transform:skewX(-2deg)}
          80%{text-shadow:-3px 0 0 rgba(255,0,128,.8),3px 0 0 rgba(0,229,255,.8);transform:skewX(2deg) translateX(2px)}
          81%{text-shadow:0 0 48px rgba(0,229,255,.45);transform:none}
          82%{text-shadow:2px 0 0 rgba(255,128,0,.7),-2px 0 0 rgba(0,229,255,.7);transform:translateY(-1px)}
          83%{text-shadow:0 0 48px rgba(0,229,255,.45);transform:none} }
        @keyframes prfCursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes prfFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes prfDataScroll { from{transform:translateY(0)} to{transform:translateY(-50%)} }
        .prf-orbit       { animation: prfOrbit  28s linear      infinite; transform-origin:110px 110px; }
        .prf-sweep       { animation: prfSweep  4s  linear      infinite; }
        .prf-avatar-glow { animation: prfAGlow  4s  ease-in-out infinite; }
        .prf-orb         { animation: prfOrb    9s  ease-in-out infinite; }
        .prf-glitch      { animation: prfGlitch 6s  ease-in-out infinite; }
        .prf-cursor      { animation: prfCursor 0.8s ease-in-out infinite; }
        .prf-fade-up     { animation: prfFadeUp .5s cubic-bezier(.16,1,.3,1) both; }
        .prf-data-scroll { animation: prfDataScroll 18s linear infinite; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 460 }}>

        {/* ── Same background stack as explore page ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg,rgba(0,8,20,0.95) 0%,rgba(5,2,13,0) 100%)" }}/>
        <div className="absolute inset-0 pointer-events-none opacity-[0.028]"
          style={{ backgroundImage: "linear-gradient(rgba(0,212,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.8) 1px,transparent 1px)", backgroundSize: "40px 40px" }}/>
        <div className="absolute inset-0 pointer-events-none" style={{ background: [
          "radial-gradient(ellipse 90% 55% at 50% -5%,rgba(0,212,255,.11) 0%,transparent 65%)",
          "radial-gradient(ellipse 55% 45% at 15% 65%,rgba(124,58,237,.08) 0%,transparent 60%)",
          "radial-gradient(ellipse 45% 40% at 85% 55%,rgba(244,114,182,.06) 0%,transparent 55%)",
        ].join(",") }}/>
        {/* Fade to page bg at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to bottom,transparent,rgba(5,2,13,1))" }}/>

        {/* DNA Helices (profile-exclusive) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
          <DnaHelix/>
          <DnaHelix flip/>
        </div>

        {/* Floating orbs — same as explore */}
        <div className="absolute pointer-events-none prf-orb"
          style={{ top:"8%", right:"8%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,.055) 0%,transparent 70%)" }}/>
        <div className="absolute pointer-events-none prf-orb"
          style={{ top:"30%", left:"3%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,.055) 0%,transparent 70%)", animationDelay:"2.5s" }}/>
        <div className="absolute pointer-events-none prf-orb"
          style={{ bottom:"18%", right:"28%", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(244,114,182,.045) 0%,transparent 70%)", animationDelay:"5s" }}/>

        {/* Scrolling data stream (right side) */}
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 overflow-hidden pointer-events-none opacity-[0.055]">
          <div className="prf-data-scroll" style={{ fontFamily:"var(--font-mono)", fontSize:7, color:"rgba(0,229,255,1)", lineHeight:1.9, whiteSpace:"nowrap", paddingLeft:6 }}>
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i}>{(hashId(profile.id + i) >>> 0).toString(16).toUpperCase().padStart(8, "0")}</div>
            ))}
          </div>
        </div>

        {/* Scan sweep */}
        <div className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background:"linear-gradient(to right,transparent,rgba(0,229,255,.3),transparent)", animation:"prfScan 10s ease-in-out infinite" }}/>

        {/* HUD brackets */}
        <HudBrackets/>

        {/* Hero content */}
        <div className="relative pt-12 pb-14 px-4 md:px-8 flex flex-col items-center text-center">

          {/* Classification header */}
          <div className="prf-fade-up mb-5" style={{ animationDelay:".05s" }}>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full"
              style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(0,229,255,.18)", backdropFilter:"blur(12px)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:"#00e5ff", boxShadow:"0 0 8px #00e5ff", animation:"prfCursor 1.4s ease-in-out infinite" }}/>
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily:"var(--font-mono)", color:"rgba(0,229,255,.45)" }}>
                <TypeLabel text={`ACCESSING SUBJECT FILE · ${hexId}`} delay={300}/>
              </span>
            </div>
          </div>

          {/* Targeting reticle + avatar */}
          <div className="prf-fade-up mb-5" style={{ animationDelay:".12s" }}>
            <TargetAvatar avatarUrl={profile.avatar_url} initial={initial} isBrilliant={isBrilliant}/>
          </div>

          {/* Subject tag */}
          <div className="flex items-center gap-2 mb-3 prf-fade-up" style={{ animationDelay:".18s" }}>
            <div className="w-10 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(0,229,255,.4))" }}/>
            <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily:"var(--font-mono)", color:"rgba(0,229,255,.3)" }}>
              ◈ SUBJECT #{subjectTag} · NEOLUTION PROTOCOL
            </span>
            <div className="w-10 h-px" style={{ background:"linear-gradient(to left,transparent,rgba(0,229,255,.4))" }}/>
          </div>

          {/* Username with glitch */}
          <h1 className="font-black uppercase tracking-[5px] leading-none mb-3 prf-glitch prf-fade-up"
            style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,6vw,56px)", color:"#00e5ff", animationDelay:".22s" }}>
            {profile.username}
          </h1>

          {/* Brilliant badge */}
          {isBrilliant && (
            <div className="flex justify-center mb-3 prf-fade-up" style={{ animationDelay:".25s" }}>
              <span className="text-[9px] tracking-[2px] uppercase px-4 py-1.5 rounded-full"
                style={{ fontFamily:"var(--font-mono)", color:"#a78bfa", border:"1px solid rgba(167,139,250,.4)", background:"rgba(167,139,250,.08)", textShadow:"0 0 8px rgba(167,139,250,.4)", boxShadow:"0 0 18px rgba(167,139,250,.12)" }}>
                ◈ BRILLIANT CLEARANCE
              </span>
            </div>
          )}

          {/* Bio — classified file panel */}
          {profile.bio && (
            <div className="max-w-md w-full mb-6 prf-fade-up" style={{ animationDelay:".28s" }}>
              <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(6,3,20,.7)", border:"1px solid rgba(124,58,237,.22)", backdropFilter:"blur(14px)" }}>
                <div className="flex items-center gap-2 px-4 py-2 border-b border-purple-900/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-70"/>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 opacity-70"/>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-70"/>
                  <span className="text-[7px] tracking-[3px] uppercase ml-1" style={{ fontFamily:"var(--font-mono)", color:"rgba(124,58,237,.5)" }}>
                    PSYCHOLOGICAL PROFILE · CLASSIFIED
                  </span>
                </div>
                <p className="px-5 py-4 italic text-[13px] leading-relaxed text-left"
                  style={{ fontFamily:"var(--font-body)", color:"rgba(167,139,250,.75)" }}>
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Biometric stats HUD */}
          <div className="prf-fade-up mb-7" style={{ animationDelay:".32s" }}>
            <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(6,3,20,.75)", border:"1px solid rgba(124,58,237,.22)", backdropFilter:"blur(16px)" }}>
              <div className="flex items-center gap-2 px-5 py-2 border-b" style={{ borderColor:"rgba(124,58,237,.15)" }}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,.5)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span className="text-[7px] tracking-[3px] uppercase" style={{ fontFamily:"var(--font-mono)", color:"rgba(0,229,255,.35)" }}>BIOMETRIC READOUT · LIVE</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:"#22c55e", boxShadow:"0 0 6px #22c55e", animation:"prfCursor 2s ease-in-out infinite" }}/>
              </div>
              <div className="flex items-stretch">
                {[
                  { label:"ENTITIES SYNTHESIZED", val: characters.length },
                  { label:"GENETIC MATCHES",       val: followerCount },
                  { label:"NETWORK NODES",         val: followingCount },
                ].map(({ label, val }, i) => (
                  <div key={label} className="flex flex-col items-center justify-center px-6 md:px-8 py-5 relative">
                    {i > 0 && <div className="absolute left-0 top-4 bottom-4 w-px" style={{ background:"linear-gradient(to bottom,transparent,rgba(124,58,237,.35),transparent)" }}/>}
                    <div className="text-[26px] font-black tabular-nums leading-none mb-1"
                      style={{ fontFamily:"var(--font-display)", color:"#00e5ff", textShadow:"0 0 24px rgba(0,229,255,.45)" }}>
                      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </div>
                    <div className="text-[7px] tracking-[1.5px] uppercase text-center max-w-[80px]" style={{ fontFamily:"var(--font-mono)", color:"rgba(122,106,154,.5)", lineHeight:1.4 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-center prf-fade-up" style={{ animationDelay:".36s" }}>
            {!isOwnProfile && viewerId ? (
              <>
                <FollowButton targetId={profile.id} initialFollowing={viewerFollowing} initialCount={followerCount} isOwnProfile={isOwnProfile}/>
                <button onClick={() => setGiftOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily:"var(--font-mono)", background:"rgba(0,229,255,.07)", border:"1px solid rgba(0,229,255,.25)", color:"rgba(0,229,255,.8)" }}>
                  <span style={{ fontSize:13 }}>⟡</span> GIFT MARKS
                </button>
              </>
            ) : isOwnProfile ? (
              <>
                <Link href="/settings/profile"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily:"var(--font-mono)", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.35)", color:"rgba(167,139,250,.85)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  EDIT PROFILE
                </Link>
                <Link href="/create"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily:"var(--font-mono)", background:"linear-gradient(135deg,rgba(0,229,255,.15),rgba(124,58,237,.15))", border:"1px solid rgba(0,229,255,.3)", color:"#00e5ff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  CREATE
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="sticky top-0 z-30 px-4 md:px-8 py-3"
          style={{ background:"rgba(5,2,13,.93)", borderBottom:"1px solid rgba(124,58,237,.12)", backdropFilter:"blur(20px)" }}>
          <div className="max-w-5xl mx-auto flex items-center gap-1.5 p-1 rounded-2xl"
            style={{ background:"rgba(8,4,26,.8)", border:"1px solid rgba(124,58,237,.18)" }}>
            {([
              { key:"entities",   label:"ENTITIES",   count:characters.length, icon:"◈" },
              { key:"favourites", label:"FAVOURITES", count:favorites.length,  icon:"♥" },
            ] as const).map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] tracking-[2px] uppercase transition-all duration-200"
                  style={{ fontFamily:"var(--font-mono)", background:active?"rgba(0,229,255,.09)":"transparent", color:active?"#00e5ff":"rgba(122,106,154,.5)", border:`1px solid ${active?"rgba(0,229,255,.3)":"transparent"}`, boxShadow:active?"0 0 18px rgba(0,229,255,.1)":"none", fontWeight:active?700:400 }}>
                  <span style={{ opacity:.7, fontSize:11 }}>{tab.icon}</span>
                  {tab.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] tabular-nums"
                    style={{ fontFamily:"var(--font-mono)", background:active?"rgba(0,229,255,.12)":"rgba(124,58,237,.1)", color:active?"rgba(0,229,255,.8)":"rgba(122,106,154,.4)", border:`1px solid ${active?"rgba(0,229,255,.2)":"rgba(124,58,237,.15)"}` }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 pb-28 md:pb-16 max-w-5xl mx-auto mt-8">

        {/* Visitor section label */}
        {!isOwnProfile && (
          <div className="flex items-center gap-3 mb-7">
            <span className="w-0.5 h-7 rounded-full flex-shrink-0"
              style={{ background:"linear-gradient(to bottom,rgba(0,229,255,.7),rgba(124,58,237,.35))", boxShadow:"0 0 8px rgba(0,229,255,.35)" }}/>
            <div>
              <h2 className="text-[13px] tracking-[3px] uppercase font-black" style={{ fontFamily:"var(--font-display)", color:"#fff" }}>SYNTHESIZED ENTITIES</h2>
              <p className="text-[9px] tracking-[2px] uppercase mt-0.5" style={{ fontFamily:"var(--font-mono)", color:"rgba(0,229,255,.3)" }}>
                {characters.length} {characters.length===1?"entity":"entities"} on record
              </p>
            </div>
          </div>
        )}

        {/* Entities tab */}
        {(activeTab==="entities" || !isOwnProfile) && (
          characters.length===0 ? (
            <div className="text-center py-24 rounded-3xl" style={{ background:"rgba(9,4,26,.5)", border:"1px dashed rgba(124,58,237,.2)" }}>
              <div className="text-[40px] mb-4 opacity-10">◈</div>
              <p className="text-[12px] tracking-[2px] uppercase mb-2" style={{ fontFamily:"var(--font-mono)", color:"rgba(122,106,154,.4)" }}>
                {isOwnProfile?"No entities synthesized yet":"No public entities"}
              </p>
              {isOwnProfile && (
                <Link href="/create" className="inline-block mt-4 px-6 py-2.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all hover:scale-105"
                  style={{ fontFamily:"var(--font-mono)", background:"rgba(0,229,255,.07)", border:"1px solid rgba(0,229,255,.22)", color:"rgba(0,229,255,.65)" }}>
                  SYNTHESIZE YOUR FIRST →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {characters.map(c => <CharCard key={c.id} c={c} isOwn={isOwnProfile}/>)}
              {isOwnProfile && <AddCard/>}
            </div>
          )
        )}

        {/* Favourites tab */}
        {activeTab==="favourites" && isOwnProfile && (
          favorites.length===0 ? (
            <div className="text-center py-24 rounded-3xl" style={{ background:"rgba(9,4,26,.5)", border:"1px dashed rgba(167,139,250,.2)" }}>
              <div className="text-[40px] mb-4 opacity-10" style={{ color:"#a78bfa" }}>♥</div>
              <p className="text-[12px] tracking-[2px] uppercase mb-2" style={{ fontFamily:"var(--font-mono)", color:"rgba(167,139,250,.4)" }}>No entities archived yet</p>
              <p className="text-[13px] italic mb-6" style={{ fontFamily:"var(--font-body)", color:"rgba(122,106,154,.4)" }}>Tap the heart on any character to save them here.</p>
              <Link href="/explore" className="inline-block px-6 py-2.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all hover:scale-105"
                style={{ fontFamily:"var(--font-mono)", background:"rgba(167,139,250,.1)", border:"1px solid rgba(167,139,250,.3)", color:"rgba(167,139,250,.8)" }}>
                BROWSE CHARACTERS →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {favorites.map(c => <FavCard key={c.id} c={c}/>)}
            </div>
          )
        )}

        {/* Footer stamp */}
        <div className="mt-20 flex flex-col items-center gap-2 opacity-15">
          <div className="flex items-center gap-3">
            <div className="h-px w-16" style={{ background:"linear-gradient(to right,transparent,rgba(124,58,237,.5))" }}/>
            <span className="text-[7px] tracking-[4px] uppercase" style={{ fontFamily:"var(--font-mono)", color:"rgba(124,58,237,1)" }}>
              NEOLUTION SCIENCE DIVISION
            </span>
            <div className="h-px w-16" style={{ background:"linear-gradient(to left,transparent,rgba(124,58,237,.5))" }}/>
          </div>
          <span className="text-[7px] tracking-[3px] uppercase" style={{ fontFamily:"var(--font-mono)", color:"rgba(124,58,237,.6)" }}>
            SESTRA PROTOCOL · SUBJECT FILE {hexId} · 324B21
          </span>
        </div>
      </div>

      {giftOpen && (
        <GiftMarksModal toUserId={profile.id} toUsername={profile.username} senderBalance={balance} onClose={() => setGiftOpen(false)} onSuccess={nb => setBalance(nb)}/>
      )}
    </div>
  );
}
