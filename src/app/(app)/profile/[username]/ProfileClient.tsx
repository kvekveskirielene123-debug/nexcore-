"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/profile/FollowButton";
import { GiftMarksModal } from "@/components/profile/GiftMarksModal";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

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
}

export function ProfileClient({
  profile,
  characters,
  followerCount,
  followingCount,
  viewerId,
  viewerFollowing,
  viewerBalance,
  isOwnProfile: isOwnProfileProp,
}: Props) {
  const [giftOpen, setGiftOpen] = useState(false);
  const [balance, setBalance] = useState(viewerBalance);

  const isOwnProfile = isOwnProfileProp ?? (viewerId === profile.id);
  const isBrilliant = isSubscriptionActive(profile.subscription_expires_at);
  const initial = (profile.username[0] ?? "?").toUpperCase();
  const subjectTag = profile.username.slice(0, 4).toUpperCase().padEnd(4, "X");

  return (
    <div className="min-h-screen bg-[#05020d]">
      <style>{`
        @keyframes profileRing {
          0%,100%{opacity:0.4;transform:scale(1)}
          50%{opacity:1;transform:scale(1.05)}
        }
        @keyframes profileScan {
          0%{top:0;opacity:0} 10%{opacity:0.6} 90%{opacity:0.2} 100%{top:100%;opacity:0}
        }
        @keyframes profilePulse {
          0%,100%{opacity:0.15} 50%{opacity:0.35}
        }
      `}</style>

      {/* ── Hero background ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
        {/* Blurred avatar bg */}
        <div className="absolute inset-0 -z-10">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "blur(56px) brightness(0.3) saturate(1.4)" }}
              aria-hidden
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#05020d]/60 via-[#05020d]/80 to-[#05020d]" />
        </div>

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)" }}
        />

        {/* Scan sweep */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3), transparent)", animation: "profileScan 8s ease-in-out infinite" }}
        />

        {/* Ambient grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative pt-16 pb-10 px-4 md:px-8 flex flex-col items-center text-center">

          {/* Subject tag */}
          <div className="mb-5 text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.25)" }}>
            ◈ SUBJECT #{subjectTag} · NEOLUTION PROTOCOL
          </div>

          {/* Avatar with rings */}
          <div className="relative mb-6">
            <div className="absolute inset-[-16px] rounded-full border border-cyan-400/40" style={{ animation: "profileRing 3.5s ease-in-out infinite" }} />
            <div className="absolute inset-[-28px] rounded-full border border-purple-500/20" style={{ animation: "profileRing 3.5s ease-in-out 1.2s infinite" }} />

            <div
              className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden relative flex items-center justify-center"
              style={{ border: "2px solid rgba(0,229,255,0.35)", boxShadow: "0 0 50px rgba(0,229,255,0.2), 0 0 100px rgba(124,58,237,0.1)", background: "#0c0520" }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[42px] font-black" style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.6)" }}>
                  {initial}
                </span>
              )}
            </div>

            {isBrilliant && (
              <div
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "rgba(167,139,250,0.95)", color: "#05020d", boxShadow: "0 0 10px rgba(167,139,250,0.6)", border: "1.5px solid rgba(167,139,250,0.5)" }}
              >
                ◈
              </div>
            )}
          </div>

          {/* Username */}
          <h1
            className="font-black uppercase tracking-[5px] leading-none mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 6vw, 52px)",
              color: "#00e5ff",
              textShadow: "0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(124,58,237,0.2)",
            }}
          >
            {profile.username}
          </h1>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
            {isBrilliant && (
              <span
                className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full border"
                style={{ fontFamily: "var(--font-mono)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.08)", textShadow: "0 0 6px rgba(167,139,250,0.3)" }}
              >
                ◈ BRILLIANT
              </span>
            )}
            <span
              className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full border border-purple-700/30 bg-purple-900/15 text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {characters.length} {characters.length === 1 ? "ENTITY" : "ENTITIES"}
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="italic max-w-md text-[14px] leading-relaxed mb-5" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.75)" }}>
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-8 mb-6">
            {[
              { label: "ENTITIES", val: characters.length },
              { label: "FOLLOWERS", val: followerCount },
              { label: "FOLLOWING", val: followingCount },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="text-[22px] font-black tabular-nums" style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.4)" }}>
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </div>
                <div className="text-[8px] tracking-[2px] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {!isOwnProfile && viewerId && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <FollowButton
                targetId={profile.id}
                initialFollowing={viewerFollowing}
                initialCount={followerCount}
                isOwnProfile={isOwnProfile}
              />
              <button
                onClick={() => setGiftOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.25)", color: "rgba(0,229,255,0.8)" }}
              >
                <span style={{ fontSize: 13 }}>⟡</span>
                GIFT MARKS
              </button>
            </div>
          )}

          {isOwnProfile && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.35)", color: "rgba(167,139,250,0.85)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                EDIT PROFILE
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all hover:scale-105 active:scale-95 hover:brightness-110"
                style={{ fontFamily: "var(--font-mono)", background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                CREATE
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Characters grid ── */}
      <div className="px-4 md:px-8 pb-24 max-w-5xl mx-auto mt-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-0.5 h-6 rounded-full flex-shrink-0" style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.7), rgba(124,58,237,0.35))", boxShadow: "0 0 8px rgba(0,229,255,0.4)" }} />
          <div>
            <h2 className="text-[13px] tracking-[3px] text-white uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              CREATED ENTITIES
            </h2>
            <p className="text-[9px] tracking-[2px] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.3)" }}>
              {characters.length} {characters.length === 1 ? "entity" : "entities"} synthesized
            </p>
          </div>
        </div>

        {characters.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(9,4,26,0.5)", border: "1px dashed rgba(124,58,237,0.2)" }}
          >
            <div className="text-[32px] mb-3 opacity-20">◈</div>
            <p className="text-[12px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>
              {isOwnProfile ? "No entities yet" : "No public entities"}
            </p>
            {isOwnProfile && (
              <Link
                href="/create"
                className="inline-block mt-4 px-5 py-2 rounded-full text-[10px] tracking-[2px] uppercase transition-all hover:scale-105"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.2)", color: "rgba(0,229,255,0.6)" }}
              >
                CREATE YOUR FIRST →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {characters.map((c, i) => (
              <Link
                key={c.id}
                href={`/character/${c.id}`}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(9,4,26,0.85)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  animationDelay: `${i * 0.04}s`,
                  transform: "translateY(0)",
                  transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px solid rgba(0,229,255,0.35)";
                  el.style.transform = "translateY(-4px) scale(1.02)";
                  el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,229,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px solid rgba(124,58,237,0.15)";
                  el.style.transform = "translateY(0) scale(1)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3), transparent)" }} />

                {/* Avatar */}
                <div className="aspect-square bg-[#0c0720] overflow-hidden relative">
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar_url}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={c.is_nsfw ? { filter: "blur(12px)", transform: "scale(1.08)" } : undefined}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                      <span className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(124,58,237,0.5)" }}>
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(5,2,13,0.7) 0%, transparent 50%)" }} />

                  {/* Badges */}
                  {c.is_nsfw && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] tracking-[1px] font-bold z-10"
                      style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b" }}>
                      NSFW
                    </span>
                  )}
                  {c.visibility === "private" && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] tracking-[1px] font-bold z-10"
                      style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.45)", color: "#a78bfa" }}>
                      PRIVATE
                    </span>
                  )}
                  {c.chat_count > 0 && (
                    <span className="absolute bottom-2 right-2 text-[8px] px-1.5 py-0.5 rounded z-10"
                      style={{ fontFamily: "var(--font-mono)", background: "rgba(0,0,0,0.6)", color: "rgba(0,229,255,0.65)", backdropFilter: "blur(4px)" }}>
                      {c.chat_count >= 1000 ? `${(c.chat_count / 1000).toFixed(1)}k` : c.chat_count} chats
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="text-[12px] font-bold tracking-[0.5px] truncate" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.92)" }}>
                    {c.name}
                  </div>
                  {c.subtitle ? (
                    <p className="text-[10px] italic truncate mt-0.5" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.55)" }}>
                      {c.subtitle}
                    </p>
                  ) : (
                    <p className="text-[9px] tracking-[1px] mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}>
                      {c.tier === "brilliant" ? "◈ BRILLIANT" : "STANDARD"}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {/* Create new card (own profile only) */}
            {isOwnProfile && (
              <Link
                href="/create"
                className="group relative rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  aspectRatio: "auto",
                  minHeight: 180,
                  background: "rgba(9,4,26,0.5)",
                  border: "1px dashed rgba(0,229,255,0.15)",
                  transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px dashed rgba(0,229,255,0.4)";
                  el.style.background = "rgba(0,229,255,0.03)";
                  el.style.transform = "translateY(-4px) scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px dashed rgba(0,229,255,0.15)";
                  el.style.background = "rgba(9,4,26,0.5)";
                  el.style.transform = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                  style={{ background: "rgba(0,229,255,0.07)", border: "1.5px solid rgba(0,229,255,0.25)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span className="text-[9px] tracking-[2.5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}>
                  NEW ENTITY
                </span>
              </Link>
            )}
          </div>
        )}

        <p className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase mt-16" style={{ fontFamily: "var(--font-mono)" }}>
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
