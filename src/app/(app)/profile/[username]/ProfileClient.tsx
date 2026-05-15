"use client";

import { useState } from "react";
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

/* ─── palette system (same as explore) ──────────────────────────────────── */

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

/* ─── CharCard ───────────────────────────────────────────────────────────── */

function CharCard({ c, isOwn }: { c: CharacterData; isOwn?: boolean }) {
  const pal = palette(c.id);
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={`/character/${c.id}`}
      className="relative block overflow-hidden rounded-2xl select-none"
      style={{
        aspectRatio: "2/3",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? 0.5 : 0.14})`,
        boxShadow: hov ? `0 24px 50px rgba(0,0,0,.7),0 0 42px rgba(${pal.glow},.16)` : "0 4px 20px rgba(0,0,0,.4)",
        transform: hov ? "translateY(-5px) scale(1.012)" : "none",
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.85),transparent)`, opacity: hov ? 1 : .3 }} />

      {/* Image */}
      {c.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.avatar_url} alt={c.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .7s ease", filter: c.is_nsfw ? "blur(18px) saturate(0.4)" : "none" }}
          loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 55%,rgba(${pal.glow},.13) 0%,transparent 70%)` }} />
          <span className="relative z-10 font-black select-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,9cqi,5.5rem)", color: pal.fg, textShadow: `0 0 40px rgba(${pal.glow},.6)`, opacity: .75 }}>
            {c.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "62%", background: "linear-gradient(to top,rgba(5,2,13,.97) 0%,rgba(5,2,13,.48) 55%,transparent 100%)" }} />

      {/* NSFW badge */}
      {c.is_nsfw && (
        <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.45)", color: "#f59e0b", backdropFilter: "blur(6px)" }}>
          NSFW
        </span>
      )}

      {/* Private badge */}
      {isOwn && c.visibility === "private" && (
        <span className="absolute top-2.5 right-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.5)", color: "#a78bfa", backdropFilter: "blur(6px)" }}>
          PRIVATE
        </span>
      )}

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6">
        <div className="font-black tracking-wide leading-tight truncate transition-all duration-250"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(12px,3cqi,15px)", color: hov ? pal.fg : "#fff", textShadow: hov ? `0 0 18px rgba(${pal.glow},.7)` : "none" }}>
          {c.name}
        </div>
        {c.subtitle && (
          <p className="text-[9px] leading-relaxed truncate mt-0.5"
            style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.55)" }}>
            {c.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[7px] tracking-[1.5px] uppercase truncate"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.5)` }}>
            {c.is_platform ? "◈ nexcor" : "◈ community"}
          </span>
          {c.chat_count > 0 && (
            <span className="text-[7px] tabular-nums flex-shrink-0"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.4)` }}>
              {fmt(c.chat_count)} chats
            </span>
          )}
        </div>
        <div className="mt-2 transition-all duration-300"
          style={{ opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(5px)" }}>
          <span className="inline-flex items-center gap-1 text-[8px] tracking-[2.5px] font-bold px-3 py-1.5 rounded-full"
            style={{ fontFamily: "var(--font-mono)", color: pal.fg, background: `rgba(${pal.glow},.12)`, border: `1px solid rgba(${pal.glow},.45)`, boxShadow: `0 0 14px rgba(${pal.glow},.28)` }}>
            CHAT NOW →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── FavCard ────────────────────────────────────────────────────────────── */

function FavCard({ c }: { c: FavCharacter }) {
  const pal = palette(c.id);
  const [hov, setHov] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl select-none"
      style={{
        aspectRatio: "2/3",
        background: pal.bg,
        border: `1px solid rgba(${pal.glow},${hov ? 0.5 : 0.14})`,
        boxShadow: hov ? `0 24px 50px rgba(0,0,0,.7),0 0 42px rgba(${pal.glow},.16)` : "0 4px 20px rgba(0,0,0,.4)",
        transform: hov ? "translateY(-5px) scale(1.012)" : "none",
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${pal.glow},.85),transparent)`, opacity: hov ? 1 : .3, transition: "opacity .25s" }} />

      <Link href={`/character/${c.id}`} className="absolute inset-0">
        {c.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatar_url} alt={c.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .7s ease", filter: c.is_nsfw ? "blur(18px) saturate(0.4)" : "none" }}
            loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 55%,rgba(${pal.glow},.13) 0%,transparent 70%)` }} />
            <span className="relative z-10 font-black select-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,9cqi,5.5rem)", color: pal.fg, textShadow: `0 0 40px rgba(${pal.glow},.6)`, opacity: .75 }}>
              {c.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: "62%", background: "linear-gradient(to top,rgba(5,2,13,.97) 0%,rgba(5,2,13,.48) 55%,transparent 100%)" }} />

      {c.is_nsfw && (
        <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded text-[7px] tracking-[1.5px] font-bold"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.45)", color: "#f59e0b", backdropFilter: "blur(6px)" }}>
          NSFW
        </span>
      )}

      {/* Heart */}
      <div className="absolute top-2.5 right-2.5 z-30">
        <FavoriteHeart characterId={c.id} initialFavorited={true} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6">
        <Link href={`/character/${c.id}`}>
          <div className="font-black tracking-wide leading-tight truncate transition-all duration-250"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(12px,3cqi,15px)", color: hov ? pal.fg : "#fff", textShadow: hov ? `0 0 18px rgba(${pal.glow},.7)` : "none" }}>
            {c.name}
          </div>
          {c.subtitle ? (
            <p className="text-[9px] leading-relaxed truncate mt-0.5"
              style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.55)" }}>
              {c.subtitle}
            </p>
          ) : c.creator_username && !c.is_platform ? (
            <p className="text-[9px] tracking-[1px] mt-0.5 truncate"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${pal.glow},.4)` }}>
              by {c.creator_username}
            </p>
          ) : null}
        </Link>
        <Link href={`/chat/${c.id}`}
          className="mt-2 flex items-center justify-center gap-1 py-1.5 rounded-full text-[8px] tracking-[2px] font-bold uppercase transition-all duration-200"
          style={{ fontFamily: "var(--font-mono)", background: `rgba(${pal.glow},.1)`, border: `1px solid rgba(${pal.glow},.3)`, color: `rgba(${pal.glow},.85)` }}
          onClick={e => e.stopPropagation()}>
          CHAT →
        </Link>
      </div>
    </div>
  );
}

/* ─── AddCard ────────────────────────────────────────────────────────────── */

function AddCard() {
  const [hov, setHov] = useState(false);
  return (
    <Link href="/create"
      className="relative block overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "2/3",
        background: hov ? "rgba(0,229,255,.04)" : "rgba(0,229,255,.02)",
        border: `1px dashed rgba(0,229,255,${hov ? .45 : .15})`,
        boxShadow: hov ? "0 24px 50px rgba(0,0,0,.5),0 0 30px rgba(0,229,255,.08)" : "none",
        transform: hov ? "translateY(-5px) scale(1.012)" : "none",
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{ background: "rgba(0,229,255,.07)", border: "1.5px solid rgba(0,229,255,.25)", boxShadow: hov ? "0 0 24px rgba(0,229,255,.35)" : "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span className="text-[8px] tracking-[2.5px] uppercase text-center"
          style={{ fontFamily: "var(--font-mono)", color: hov ? "rgba(0,229,255,.75)" : "rgba(0,229,255,.35)" }}>
          NEW ENTITY
        </span>
      </div>
    </Link>
  );
}

/* ─── ProfileClient ──────────────────────────────────────────────────────── */

export function ProfileClient({
  profile,
  characters,
  followerCount,
  followingCount,
  viewerId,
  viewerFollowing,
  viewerBalance,
  isOwnProfile: isOwnProfileProp,
  favorites = [],
}: Props) {
  const [giftOpen,  setGiftOpen]  = useState(false);
  const [balance,   setBalance]   = useState(viewerBalance);
  const [activeTab, setActiveTab] = useState<"entities" | "favourites">("entities");

  const isOwnProfile = isOwnProfileProp ?? (viewerId === profile.id);
  const isBrilliant  = isSubscriptionActive(profile.subscription_expires_at);
  const initial      = (profile.username[0] ?? "?").toUpperCase();
  const subjectTag   = profile.username.slice(0, 4).toUpperCase().padEnd(4, "X");

  return (
    <div className="min-h-screen bg-[#05020d]">
      <style>{`
        @keyframes prfRing   { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.9;transform:scale(1.06)} }
        @keyframes prfScan   { 0%{top:-2px;opacity:0} 8%{opacity:.5} 92%{opacity:.15} 100%{top:100%;opacity:0} }
        @keyframes prfOrb    { 0%,100%{transform:translate(0,0) scale(1);opacity:.65} 40%{transform:translate(14px,-18px) scale(1.05);opacity:.9} 70%{transform:translate(-10px,12px) scale(.96);opacity:.7} }
        @keyframes prfGlow   { 0%,100%{box-shadow:0 0 40px rgba(0,229,255,.18),0 0 80px rgba(124,58,237,.09)} 50%{box-shadow:0 0 60px rgba(0,229,255,.32),0 0 100px rgba(124,58,237,.16)} }
        @keyframes prfFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .prf-ring-1 { animation: prfRing 3.5s ease-in-out infinite; }
        .prf-ring-2 { animation: prfRing 3.5s ease-in-out 1.3s infinite; }
        .prf-ring-3 { animation: prfRing 3.5s ease-in-out 2.6s infinite; }
        .prf-orb    { animation: prfOrb  10s  ease-in-out infinite; }
        .prf-glow   { animation: prfGlow  4s  ease-in-out infinite; }
        .prf-fade-up { animation: prfFadeUp .5s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 400 }}>

        {/* Blurred avatar backdrop */}
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: "blur(64px) brightness(0.22) saturate(1.6)", transform: "scale(1.1)" }} />
        )}

        {/* Gradient layers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: [
            "radial-gradient(ellipse 100% 60% at 50% 0%,rgba(0,212,255,.12) 0%,transparent 65%)",
            "radial-gradient(ellipse 60% 50% at 10% 70%,rgba(124,58,237,.09) 0%,transparent 60%)",
            "radial-gradient(ellipse 50% 45% at 90% 60%,rgba(244,114,182,.06) 0%,transparent 55%)",
          ].join(",")
        }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg,rgba(5,2,13,.55) 0%,rgba(5,2,13,.82) 60%,rgba(5,2,13,1) 100%)" }} />

        {/* Ambient grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(0,229,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,1) 1px,transparent 1px)", backgroundSize: "38px 38px" }} />

        {/* Floating orbs */}
        <div className="absolute pointer-events-none prf-orb"
          style={{ top: "12%", right: "9%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,.06) 0%,transparent 70%)" }} />
        <div className="absolute pointer-events-none prf-orb"
          style={{ top: "40%", left: "4%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.06) 0%,transparent 70%)", animationDelay: "3.5s" }} />

        {/* Scan sweep */}
        <div className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,.28),transparent)", animation: "prfScan 9s ease-in-out infinite" }} />

        <div className="relative pt-14 pb-12 px-4 md:px-8 flex flex-col items-center text-center">

          {/* Subject tag */}
          <div className="mb-6 prf-fade-up" style={{ animationDelay: ".05s" }}>
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,.4))" }} />
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.3)" }}>
                ◈ SUBJECT #{subjectTag} · NEOLUTION PROTOCOL
              </span>
              <div className="w-8 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(0,229,255,.4))" }} />
            </div>
          </div>

          {/* Avatar */}
          <div className="relative mb-7 prf-fade-up" style={{ animationDelay: ".1s" }}>
            <div className="absolute rounded-full pointer-events-none prf-ring-1"
              style={{ inset: -14, border: "1px solid rgba(0,229,255,.35)" }} />
            <div className="absolute rounded-full pointer-events-none prf-ring-2"
              style={{ inset: -24, border: "1px solid rgba(124,58,237,.2)" }} />
            <div className="absolute rounded-full pointer-events-none prf-ring-3"
              style={{ inset: -36, border: "1px dashed rgba(0,229,255,.1)" }} />

            <div
              className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden relative flex items-center justify-center prf-glow"
              style={{ border: "2px solid rgba(0,229,255,.4)", background: "#0c0520" }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[46px] font-black"
                  style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 24px rgba(0,229,255,.7)" }}>
                  {initial}
                </span>
              )}
            </div>

            {isBrilliant && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold z-10"
                style={{ background: "rgba(167,139,250,.95)", color: "#05020d", boxShadow: "0 0 12px rgba(167,139,250,.6)", border: "2px solid rgba(167,139,250,.5)" }}>
                ◈
              </div>
            )}
          </div>

          {/* Username */}
          <h1
            className="font-black uppercase tracking-[5px] leading-none mb-3 prf-fade-up"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,6vw,54px)", color: "#00e5ff", textShadow: "0 0 48px rgba(0,229,255,.45),0 0 90px rgba(124,58,237,.2)", animationDelay: ".15s" }}
          >
            {profile.username}
          </h1>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-4 prf-fade-up" style={{ animationDelay: ".2s" }}>
            {isBrilliant && (
              <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full"
                style={{ fontFamily: "var(--font-mono)", color: "#a78bfa", border: "1px solid rgba(167,139,250,.4)", background: "rgba(167,139,250,.08)", textShadow: "0 0 6px rgba(167,139,250,.3)" }}>
                ◈ BRILLIANT
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6 max-w-md w-full prf-fade-up" style={{ animationDelay: ".22s" }}>
              <div className="px-5 py-3 rounded-2xl text-center"
                style={{ background: "rgba(12,5,32,.65)", border: "1px solid rgba(124,58,237,.2)", backdropFilter: "blur(12px)" }}>
                <p className="italic text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,.75)" }}>
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Stats HUD */}
          <div className="flex items-stretch mb-7 rounded-2xl overflow-hidden prf-fade-up" style={{ animationDelay: ".25s", border: "1px solid rgba(124,58,237,.2)", background: "rgba(8,4,26,.75)", backdropFilter: "blur(16px)" }}>
            {[
              { label: "ENTITIES",  val: characters.length },
              { label: "FOLLOWERS", val: followerCount },
              { label: "FOLLOWING", val: followingCount },
            ].map(({ label, val }, i) => (
              <div key={label} className="flex flex-col items-center justify-center px-7 py-4 relative">
                {i > 0 && (
                  <div className="absolute left-0 top-3 bottom-3 w-px"
                    style={{ background: "linear-gradient(to bottom,transparent,rgba(124,58,237,.35),transparent)" }} />
                )}
                <div className="text-[24px] font-black tabular-nums leading-none mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 22px rgba(0,229,255,.4)" }}>
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </div>
                <div className="text-[8px] tracking-[2px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.5)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center prf-fade-up" style={{ animationDelay: ".3s" }}>
            {!isOwnProfile && viewerId ? (
              <>
                <FollowButton
                  targetId={profile.id}
                  initialFollowing={viewerFollowing}
                  initialCount={followerCount}
                  isOwnProfile={isOwnProfile}
                />
                <button
                  onClick={() => setGiftOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.25)", color: "rgba(0,229,255,.8)" }}
                >
                  <span style={{ fontSize: 13 }}>⟡</span> GIFT MARKS
                </button>
              </>
            ) : isOwnProfile ? (
              <>
                <Link href="/settings/profile"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.35)", color: "rgba(167,139,250,.85)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  EDIT PROFILE
                </Link>
                <Link href="/create"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", background: "linear-gradient(135deg,rgba(0,229,255,.15),rgba(124,58,237,.15))", border: "1px solid rgba(0,229,255,.3)", color: "#00e5ff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  CREATE
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="sticky top-0 z-30 px-4 md:px-8 py-3 max-w-5xl mx-auto"
          style={{ background: "rgba(5,2,13,.92)", borderBottom: "1px solid rgba(124,58,237,.12)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl"
            style={{ background: "rgba(8,4,26,.8)", border: "1px solid rgba(124,58,237,.18)" }}>
            {([
              { key: "entities",   label: "ENTITIES",   count: characters.length, icon: "◈" },
              { key: "favourites", label: "FAVOURITES", count: favorites.length,  icon: "♥" },
            ] as const).map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] tracking-[2px] uppercase transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: active ? "rgba(0,229,255,.09)" : "transparent",
                    color: active ? "#00e5ff" : "rgba(122,106,154,.5)",
                    border: `1px solid ${active ? "rgba(0,229,255,.3)" : "transparent"}`,
                    boxShadow: active ? "0 0 18px rgba(0,229,255,.1)" : "none",
                    fontWeight: active ? 700 : 400,
                  }}>
                  <span style={{ opacity: .7, fontSize: 11 }}>{tab.icon}</span>
                  {tab.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] tabular-nums"
                    style={{ fontFamily: "var(--font-mono)", background: active ? "rgba(0,229,255,.12)" : "rgba(124,58,237,.1)", color: active ? "rgba(0,229,255,.8)" : "rgba(122,106,154,.4)", border: `1px solid ${active ? "rgba(0,229,255,.2)" : "rgba(124,58,237,.15)"}` }}>
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

        {/* Section label (visitor view) */}
        {!isOwnProfile && (
          <div className="flex items-center gap-3 mb-7">
            <span className="w-0.5 h-7 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(to bottom,rgba(0,229,255,.7),rgba(124,58,237,.35))", boxShadow: "0 0 8px rgba(0,229,255,.35)" }} />
            <div>
              <h2 className="text-[13px] tracking-[3px] uppercase font-black"
                style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
                CREATED ENTITIES
              </h2>
              <p className="text-[9px] tracking-[2px] uppercase mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.3)" }}>
                {characters.length} {characters.length === 1 ? "entity" : "entities"} synthesized
              </p>
            </div>
          </div>
        )}

        {/* ── ENTITIES tab ── */}
        {(activeTab === "entities" || !isOwnProfile) && (
          characters.length === 0 ? (
            <div className="text-center py-24 rounded-3xl"
              style={{ background: "rgba(9,4,26,.5)", border: "1px dashed rgba(124,58,237,.2)" }}>
              <div className="text-[40px] mb-4 opacity-15">◈</div>
              <p className="text-[12px] tracking-[2px] uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.4)" }}>
                {isOwnProfile ? "No entities yet" : "No public entities"}
              </p>
              {isOwnProfile && (
                <Link href="/create"
                  className="inline-block mt-4 px-6 py-2.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all hover:scale-105"
                  style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.22)", color: "rgba(0,229,255,.65)" }}>
                  CREATE YOUR FIRST →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {characters.map(c => (
                <CharCard key={c.id} c={c} isOwn={isOwnProfile} />
              ))}
              {isOwnProfile && <AddCard />}
            </div>
          )
        )}

        {/* ── FAVOURITES tab ── */}
        {activeTab === "favourites" && isOwnProfile && (
          favorites.length === 0 ? (
            <div className="text-center py-24 rounded-3xl"
              style={{ background: "rgba(9,4,26,.5)", border: "1px dashed rgba(167,139,250,.2)" }}>
              <div className="text-[40px] mb-4 opacity-15" style={{ color: "#a78bfa" }}>♥</div>
              <p className="text-[12px] tracking-[2px] uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,.4)" }}>
                No entities favourited yet
              </p>
              <p className="text-[13px] italic mb-6"
                style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,.45)" }}>
                Tap the heart on any character to save them here.
              </p>
              <Link href="/explore"
                className="inline-block px-6 py-2.5 rounded-full text-[10px] tracking-[2px] uppercase transition-all hover:scale-105"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(167,139,250,.1)", border: "1px solid rgba(167,139,250,.3)", color: "rgba(167,139,250,.8)" }}>
                BROWSE CHARACTERS →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {favorites.map(c => <FavCard key={c.id} c={c} />)}
            </div>
          )
        )}

        {/* Footer */}
        <p className="text-[8px] tracking-[3px] text-center uppercase mt-20 opacity-20"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,1)" }}>
          NEOLUTION SCIENCE DIVISION · SESTRA PROTOCOL · 324B21
        </p>
      </div>

      {giftOpen && (
        <GiftMarksModal
          toUserId={profile.id}
          toUsername={profile.username}
          senderBalance={balance}
          onClose={() => setGiftOpen(false)}
          onSuccess={(nb) => { setBalance(nb); }}
        />
      )}
    </div>
  );
}
