"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PARTICLE_COLORS = ["#00e5ff","#00bfff","#38bdf8","#7dd3fc","#a5f3fc","#ffffff"];

interface Particle { id: number; dx: number; dy: number; size: number; color: string; delay: number }

function BoltIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{
      flexShrink: 0,
      animation: spinning ? "bolt-spin 0.45s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
      filter: "drop-shadow(0 0 5px rgba(0,229,255,1))",
    }}>
      <path d="M13 2L4 14h7l-1 8 11-12h-7L13 2z" />
    </svg>
  );
}

export function ExploreRightSidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [marks,       setMarks]       = useState<number | null>(null);
  const [username,    setUsername]    = useState<string | null>(null);
  const [isSubscribed,setIsSubscribed]= useState(false);
  const [canClaim,    setCanClaim]    = useState(false);
  const [claiming,    setClaiming]    = useState(false);
  const [claimFlash,  setClaimFlash]  = useState(false);
  const [claimText,   setClaimText]   = useState<"CLAIM DAILY" | "..." | "CLAIMED!">("CLAIM DAILY");
  const [particles,   setParticles]   = useState<Particle[]>([]);
  const [showRing,    setShowRing]    = useState(false);
  const [iconSpin,    setIconSpin]    = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("marks, username, subscription_expires_at")
        .eq("id", user.id)
        .single();
      if (data) {
        setMarks(data.marks ?? 0);
        setUsername(data.username);
        setIsSubscribed(
          !!data.subscription_expires_at && new Date(data.subscription_expires_at) > new Date()
        );
      }
    });
    fetch("/api/marks/claim-daily")
      .then((r) => r.json())
      .then((d) => setCanClaim(!!d.available))
      .catch(() => {});
  }, [isLoggedIn]);

  const triggerBurst = () => {
    const burst: Particle[] = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist  = 30 + Math.random() * 50;
      return {
        id:    Date.now() + i,
        dx:    Math.cos(angle) * dist,
        dy:    Math.sin(angle) * dist,
        size:  2.5 + Math.random() * 4,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        delay: Math.random() * 0.07,
      };
    });
    setParticles(burst);
    setShowRing(true);
    setIconSpin(true);
    setTimeout(() => setParticles([]),   750);
    setTimeout(() => setShowRing(false), 600);
    setTimeout(() => setIconSpin(false), 500);
  };

  const handleClaim = async () => {
    if (claiming || !canClaim) return;
    setClaiming(true);
    setClaimText("...");
    triggerBurst();
    try {
      const res  = await fetch("/api/marks/claim-daily", { method: "POST" });
      const data = await res.json();
      if (data.claimed) {
        setMarks(data.new_balance ?? null);
        setClaimText("CLAIMED!");
        setClaimFlash(true);
        setTimeout(() => {
          setClaimFlash(false);
          setCanClaim(false);
          setClaimText("CLAIM DAILY");
        }, 1800);
      } else {
        setClaimText("CLAIM DAILY");
      }
    } finally {
      setClaiming(false);
    }
  };

  const claimed = claimText === "CLAIMED!";

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[260px] flex-shrink-0">

      {/* ── User profile card ── */}
      {isLoggedIn && username ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(12,5,32,0.8)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="p-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(0,229,255,0.3))",
                  border: "1.5px solid rgba(0,229,255,0.3)",
                  color: "#00e5ff",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 0 16px rgba(0,229,255,0.2)",
                }}
              >
                {username[0].toUpperCase()}
              </div>
              <div>
                <div
                  className="text-[12px] font-bold tracking-[2px] uppercase text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {username}
                </div>
                {isSubscribed ? (
                  <span
                    className="text-[8px] tracking-[2px] px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#a78bfa",
                      background: "rgba(167,139,250,0.1)",
                      border: "1px solid rgba(167,139,250,0.3)",
                    }}
                  >
                    ◈ BRILLIANT
                  </span>
                ) : (
                  <span
                    className="text-[8px] tracking-[1.5px]"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                  >
                    FREE TIER
                  </span>
                )}
              </div>
            </div>

            {/* Marks balance */}
            {marks !== null && (
              <div
                className="rounded-xl px-4 py-3 mb-4 text-center transition-all duration-300"
                style={{
                  background: claimFlash ? "rgba(0,229,255,0.1)" : "rgba(0,229,255,0.04)",
                  border: `1px solid ${claimFlash ? "rgba(0,229,255,0.4)" : "rgba(0,229,255,0.12)"}`,
                }}
              >
                <div
                  className="text-[26px] font-black leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#00e5ff",
                    textShadow: claimFlash
                      ? "0 0 20px rgba(0,229,255,1), 0 0 40px rgba(0,229,255,0.5)"
                      : "0 0 15px rgba(0,229,255,0.6)",
                  }}
                >
                  {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
                </div>
                <div
                  className="text-[8px] tracking-[2.5px] mt-1 uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
                >
                  ⟡ MARKS
                </div>
              </div>
            )}

            {/* Daily claim */}
            {canClaim ? (
              <div className="relative" style={{ isolation: "isolate" }}>
                {/* Expanding ring */}
                {showRing && (
                  <span className="absolute rounded-full pointer-events-none" style={{
                    width: 40, height: 40,
                    left: "50%", top: "50%",
                    border: "1.5px solid rgba(0,229,255,0.9)",
                    animation: "claim-ring 0.55s ease-out forwards",
                    zIndex: 50,
                  }} />
                )}
                {/* Particles */}
                {particles.map((p) => (
                  <span key={p.id} className="absolute rounded-full pointer-events-none" style={{
                    width: p.size, height: p.size,
                    left: "50%", top: "50%",
                    background: p.color,
                    boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
                    animation: "particle-fly 0.65s ease-out forwards",
                    animationDelay: `${p.delay}s`,
                    zIndex: 60,
                    ["--pdx" as string]: `${p.dx}px`,
                    ["--pdy" as string]: `${p.dy}px`,
                  } as React.CSSProperties} />
                ))}
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-2.5 rounded-xl text-[10px] tracking-[2.5px] font-bold uppercase flex items-center justify-center gap-2 disabled:cursor-default"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: claimed
                      ? "linear-gradient(135deg, rgba(0,229,255,0.28), rgba(0,120,255,0.18))"
                      : "linear-gradient(135deg, rgba(0,229,255,0.14), rgba(0,100,255,0.1))",
                    border: `1px solid rgba(0,229,255,${claimed ? 0.7 : 0.4})`,
                    color: "rgba(0,229,255,0.95)",
                    boxShadow: claimed
                      ? "0 0 22px rgba(0,229,255,0.55), 0 0 50px rgba(0,229,255,0.15)"
                      : undefined,
                    transform: claimed ? "scale(1.04)" : undefined,
                    transition: "all 0.25s ease",
                    animation: !claimed && !claiming ? "claim-idle-glow 2.2s ease-in-out infinite" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!claimed) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.03)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 22px rgba(0,229,255,0.4), 0 0 44px rgba(0,229,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!claimed) {
                      (e.currentTarget as HTMLElement).style.transform = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }
                  }}
                >
                  <BoltIcon spinning={iconSpin} />
                  {claimText}
                </button>
              </div>
            ) : (
              <div
                className="w-full py-2.5 rounded-xl text-[9px] tracking-[2px] text-center"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "rgba(122,106,154,0.4)",
                  border: "1px solid rgba(122,106,154,0.1)",
                }}
              >
                DAILY BONUS CLAIMED ✓
              </div>
            )}
          </div>
        </div>
      ) : !isLoggedIn ? (
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "rgba(12,5,32,0.8)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div
            className="text-[10px] tracking-[3px] uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            ◈ JOIN NEXCOR
          </div>
          <p
            className="text-[11px] italic text-[#7a6a9a] mb-4 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Create an account to save favorites, earn marks, and unlock the full catalog.
          </p>
          <Link
            href="/signup"
            className="block w-full py-2.5 rounded-xl text-[10px] tracking-[2.5px] font-bold uppercase text-center transition-all hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-mono)",
              background: "#00e5ff",
              color: "#000",
            }}
          >
            SIGN UP FREE →
          </Link>
          <Link
            href="/login"
            className="block w-full py-2 mt-2 text-[9px] tracking-[2px] text-center"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            Already have an account? Log in
          </Link>
        </div>
      ) : null}

      {/* ── Create character CTA ── */}
      <Link
        href="/create"
        className="group rounded-2xl p-5 transition-all duration-300 hover:border-cyan-400/40 hover:scale-[1.01]"
        style={{
          background: "rgba(12,5,32,0.7)",
          border: "1px solid rgba(0,229,255,0.15)",
        }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent -mt-5 -mx-5 mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(0,229,255,0.4)]"
            style={{
              background: "rgba(0,229,255,0.1)",
              border: "1.5px solid rgba(0,229,255,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div
            className="text-[11px] tracking-[2px] uppercase font-bold"
            style={{ fontFamily: "var(--font-display)", color: "#00e5ff" }}
          >
            CREATE CHARACTER
          </div>
        </div>
        <p
          className="text-[10px] italic leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}
        >
          Design your own AI persona. Set the backstory, the tone, the world.
        </p>
        <div
          className="mt-3 text-[9px] tracking-[2px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
        >
          START BUILDING →
        </div>
      </Link>

      {/* ── Go Brilliant CTA (non-subscribers) ── */}
      {!isSubscribed && (
        <Link
          href="/subscribe"
          className="group rounded-2xl p-5 transition-all duration-300 hover:border-purple-400/50 hover:scale-[1.01]"
          style={{
            background: "rgba(12,5,32,0.7)",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent -mt-5 -mx-5 mb-4" />
          <div
            className="text-[8px] tracking-[3px] uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.6)" }}
          >
            ◈ NEXCOR BRILLIANT
          </div>
          <div
            className="text-[13px] font-black tracking-[2px] uppercase mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#a78bfa", textShadow: "0 0 15px rgba(167,139,250,0.5)" }}
          >
            FREE HAIKU · SAVE 24%
          </div>
          <p
            className="text-[10px] italic leading-relaxed mb-3"
            style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}
          >
            Haiku messages at zero cost. Deep discounts on Sonnet & Opus.
          </p>
          <div
            className="text-[9px] tracking-[2px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.6)" }}
          >
            FROM $4.99 →
          </div>
        </Link>
      )}

      {/* ── Quick stats strip ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(12,5,32,0.6)",
          border: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <div
          className="text-[8px] tracking-[3px] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
        >
          ◈ CATALOG STATS
        </div>
        {[
          { label: "CHARACTERS", value: "100+" },
          { label: "ACTIVE USERS", value: "∞" },
          { label: "MODELS", value: "3" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
            <span
              className="text-[9px] tracking-[1.5px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              {label}
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.7)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
