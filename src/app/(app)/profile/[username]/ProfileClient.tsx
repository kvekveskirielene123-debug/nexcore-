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
}

interface Props {
  profile: ProfileData;
  characters: CharacterData[];
  followerCount: number;
  followingCount: number;
  viewerId: string | null;
  viewerFollowing: boolean;
  viewerBalance: number;
}

export function ProfileClient({
  profile,
  characters,
  followerCount,
  followingCount,
  viewerId,
  viewerFollowing,
  viewerBalance,
}: Props) {
  const [giftOpen, setGiftOpen] = useState(false);
  const [balance, setBalance] = useState(viewerBalance);

  const isOwnProfile = viewerId === profile.id;
  const isBrilliant = isSubscriptionActive(profile.subscription_expires_at);
  const initial = (profile.username[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-[#05020d] px-4 md:px-8 pt-8 pb-28 md:pb-8">
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.22) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* ── Profile card ── */}
        <div
          className="rounded-2xl p-6 mb-8 settings-card-enter"
          style={{
            background: "rgba(9,4,26,0.85)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          {/* Top line */}
          <div className="absolute top-0 left-8 right-8 h-px pointer-events-none" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.45), transparent)" }} />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-[28px] font-black relative overflow-hidden"
              style={{
                background: profile.avatar_url ? "transparent" : "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.2))",
                border: "1.5px solid rgba(124,58,237,0.35)",
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : initial}
              {isBrilliant && (
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg flex items-center justify-center text-[9px]"
                  style={{ background: "rgba(167,139,250,0.9)", color: "#05020d" }}
                >
                  ◈
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1
                  className="text-[22px] font-black tracking-[2px] uppercase"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
                >
                  {profile.username}
                </h1>
                {isBrilliant && (
                  <span
                    className="text-[9px] tracking-[2px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "rgba(167,139,250,0.12)",
                      border: "1px solid rgba(167,139,250,0.35)",
                      color: "rgba(167,139,250,0.9)",
                    }}
                  >
                    ◈ BRILLIANT
                  </span>
                )}
              </div>

              {profile.bio && (
                <p
                  className="text-[13px] italic mb-3 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.75)" }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                {[
                  { label: "CHARACTERS", val: characters.length },
                  { label: "FOLLOWERS", val: followerCount },
                  { label: "FOLLOWING", val: followingCount },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div
                      className="text-[16px] font-black tabular-nums"
                      style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.9)" }}
                    >
                      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </div>
                    <div
                      className="text-[8px] tracking-[1.5px] uppercase"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.55)" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              {!isOwnProfile && viewerId && (
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <FollowButton
                    targetId={profile.id}
                    initialFollowing={viewerFollowing}
                    initialCount={followerCount}
                    isOwnProfile={isOwnProfile}
                  />
                  <button
                    onClick={() => setGiftOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "rgba(0,229,255,0.07)",
                      border: "1px solid rgba(0,229,255,0.25)",
                      color: "rgba(0,229,255,0.8)",
                    }}
                  >
                    <span style={{ color: "rgba(0,229,255,0.6)", fontSize: 12 }}>⟡</span>
                    GIFT MARKS
                  </button>
                </div>
              )}

              {isOwnProfile && (
                <Link
                  href="/settings/profile"
                  className="inline-block px-4 py-2 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "rgba(167,139,250,0.8)",
                  }}
                >
                  EDIT PROFILE
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Characters section ── */}
        <div
          className="text-[10px] tracking-[4px] uppercase mb-4"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
        >
          ◈ CREATED ENTITIES · {characters.length}
        </div>

        {characters.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl settings-card-enter"
            style={{ background: "rgba(9,4,26,0.5)", border: "1px solid rgba(124,58,237,0.1)" }}
          >
            <p className="text-[12px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>
              No public characters yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {characters.map((c, i) => (
              <Link
                key={c.id}
                href={`/character/${c.id}`}
                className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] settings-card-enter"
                style={{
                  background: "rgba(9,4,26,0.85)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  animationDelay: `${i * 0.03}s`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = "1px solid rgba(124,58,237,0.4)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = "1px solid rgba(124,58,237,0.15)"; }}
              >
                {/* Top line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25), transparent)" }} />

                {/* Avatar */}
                <div className="aspect-square bg-[#0c0720] overflow-hidden relative">
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(124,58,237,0.5)" }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {c.is_nsfw && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] tracking-[1px] font-bold"
                      style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "rgba(245,158,11,0.85)" }}>
                      NSFW
                    </span>
                  )}
                  {c.chat_count > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded"
                      style={{ fontFamily: "var(--font-mono)", background: "rgba(0,0,0,0.5)", color: "rgba(0,229,255,0.6)" }}>
                      {c.chat_count >= 1000 ? `${(c.chat_count / 1000).toFixed(1)}k` : c.chat_count} chats
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="p-2.5">
                  <div
                    className="text-[12px] font-bold tracking-[1px] truncate"
                    style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}
                  >
                    {c.name}
                  </div>
                  {c.subtitle && (
                    <p className="text-[10px] italic truncate mt-0.5" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.6)" }}>
                      {c.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Gift modal */}
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
