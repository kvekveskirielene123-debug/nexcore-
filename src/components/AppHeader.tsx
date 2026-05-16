"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/providers/SidebarProvider";

const PAGE_TITLES: Record<string, string> = {
  "/explore":   "Explore",
  "/favorites": "Favorites",
  "/chats":     "Chats",
  "/personas":  "Personas",
  "/store":     "Mark Store",
  "/subscribe": "Go Brilliant",
  "/create":    "Create",
  "/settings":  "Settings",
  "/chat":      "Chat",
  "/profile":   "Profile",
};

function getTitle(pathname: string): string {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "Nexcor";
}

interface Particle {
  id: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  delay: number;
}

const PARTICLE_COLORS = [
  "#00e5ff", "#00cfff", "#00bfff", "#38bdf8",
  "#7dd3fc", "#a5f3fc", "#ffffff",
];

function BoltIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24" fill="currentColor"
      style={{
        flexShrink: 0,
        animation: spinning ? "bolt-spin 0.45s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
        filter: "drop-shadow(0 0 5px rgba(0,229,255,1))",
      }}
    >
      <path d="M13 2L4 14h7l-1 8 11-12h-7L13 2z" />
    </svg>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const { isExpanded } = useSidebar();

  const [marks,      setMarks]      = useState<number | null>(null);
  const [username,   setUsername]   = useState<string | null>(null);
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null);
  const [claiming,   setClaiming]   = useState(false);
  const [canClaim,   setCanClaim]   = useState(false);
  const [claimFlash, setClaimFlash] = useState(false);
  const [claimText,  setClaimText]  = useState<"CLAIM" | "..." | "CLAIMED!">("CLAIM");
  const [particles,  setParticles]  = useState<Particle[]>([]);
  const [showRing,   setShowRing]   = useState(false);
  const [iconSpin,   setIconSpin]   = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("marks, username, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) { setMarks(data.marks ?? 0); setUsername(data.username); setAvatarUrl(data.avatar_url ?? null); }
    });

    fetch("/api/marks/claim-daily")
      .then((r) => r.json())
      .then((d) => setCanClaim(!!d.available))
      .catch(() => {});
  }, []);

  const triggerBurst = () => {
    const burst: Particle[] = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist  = 26 + Math.random() * 42;
      return {
        id:    Date.now() + i,
        dx:    Math.cos(angle) * dist,
        dy:    Math.sin(angle) * dist,
        size:  2 + Math.random() * 4,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        delay: Math.random() * 0.07,
      };
    });
    setParticles(burst);
    setShowRing(true);
    setIconSpin(true);
    setTimeout(() => setParticles([]),  750);
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
          setClaimText("CLAIM");
        }, 1800);
      } else {
        setClaimText("CLAIM");
      }
    } finally {
      setClaiming(false);
    }
  };

  const claimed = claimText === "CLAIMED!";

  return (
    <header
      className="hidden md:flex fixed top-0 z-40 items-center justify-between px-6 h-14 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{
        left: isExpanded ? 240 : 72,
        right: 0,
        background: "rgba(5,2,13,0.92)",
        borderBottom: "1px solid rgba(124,58,237,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* Bottom border ambient glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none nx-header-glow"
        style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.35), transparent)" }}
      />
      {/* Page title */}
      <h2
        className="text-[13px] tracking-[3px] uppercase font-bold"
        style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.7)" }}
      >
        {getTitle(pathname)}
      </h2>

      {/* ── Right side ── */}
      <div className="flex items-center gap-2">

        {marks !== null && (
          <>
            {/* Marks balance pill → store */}
            <Link
              href="/store"
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: claimFlash ? "rgba(0,229,255,0.14)" : "rgba(0,229,255,0.06)",
                border: `1px solid ${claimFlash ? "rgba(0,229,255,0.5)" : "rgba(0,229,255,0.15)"}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(0,229,255,0.12)";
                el.style.borderColor = "rgba(0,229,255,0.45)";
                el.style.transform = "scale(1.02)";
                el.style.boxShadow = "0 0 14px rgba(0,229,255,0.18)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = claimFlash ? "rgba(0,229,255,0.14)" : "rgba(0,229,255,0.06)";
                el.style.borderColor = claimFlash ? "rgba(0,229,255,0.5)" : "rgba(0,229,255,0.15)";
                el.style.transform = "";
                el.style.boxShadow = "";
              }}
            >
              <span style={{ color: "rgba(0,229,255,0.6)", fontSize: 10 }}>⟡</span>
              <span
                className="text-[12px] font-black tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  color: claimFlash ? "#00e5ff" : "rgba(0,229,255,0.85)",
                  textShadow: claimFlash ? "0 0 14px rgba(0,229,255,0.9)" : "none",
                  transition: "color 0.3s, text-shadow 0.3s",
                }}
              >
                {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
              </span>
              <span
                className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                style={{ color: "#00e5ff" }}
              >
                →
              </span>
            </Link>

            {/* ── Claim button ── */}
            {canClaim && (
              <div className="relative" style={{ isolation: "isolate" }}>

                {/* Expanding ring on burst */}
                {showRing && (
                  <span
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 32,
                      height: 32,
                      left: "50%",
                      top: "50%",
                      border: "1.5px solid rgba(0,229,255,0.9)",
                      animation: "claim-ring 0.55s ease-out forwards",
                      zIndex: 50,
                    }}
                  />
                )}

                {/* Particles */}
                {particles.map((p) => (
                  <span
                    key={p.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width:  p.size,
                      height: p.size,
                      left:   "50%",
                      top:    "50%",
                      background: p.color,
                      boxShadow:  `0 0 ${p.size * 2.5}px ${p.color}`,
                      animation:  `particle-fly 0.65s ease-out forwards`,
                      animationDelay: `${p.delay}s`,
                      zIndex: 60,
                      ["--pdx" as string]: `${p.dx}px`,
                      ["--pdy" as string]: `${p.dy}px`,
                    } as React.CSSProperties}
                  />
                ))}

                {/* Button */}
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase select-none disabled:cursor-default"
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
                    transform: claimed ? "scale(1.06)" : undefined,
                    transition: "all 0.25s ease",
                    animation: (!claimed && !claiming)
                      ? "claim-idle-glow 2.2s ease-in-out infinite"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!claimed) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.05)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 22px rgba(0,229,255,0.45), 0 0 44px rgba(0,229,255,0.12)";
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
            )}
          </>
        )}

        {/* Username avatar → own profile */}
        {username && (
          <Link
            href={`/profile/${username}`}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(0,229,255,0.08)";
              el.style.borderColor = "rgba(0,229,255,0.35)";
              el.style.transform = "scale(1.02)";
              el.style.boxShadow = "0 0 14px rgba(0,229,255,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(124,58,237,0.08)";
              el.style.borderColor = "rgba(124,58,237,0.2)";
              el.style.transform = "";
              el.style.boxShadow = "";
            }}
          >
            {/* Avatar circle — real photo if available, else initial */}
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-[9px] font-black transition-all duration-200"
              style={{
                background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(0,229,255,0.35))",
                border: "1.5px solid rgba(0,229,255,0.25)",
                color: "#00e5ff",
                fontFamily: "var(--font-display)",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                username[0].toUpperCase()
              )}
            </div>

            {/* Username text */}
            <span
              className="text-[10px] tracking-[1.5px] uppercase transition-colors duration-200 group-hover:text-[#00e5ff]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.6)" }}
            >
              {username}
            </span>

            {/* Arrow hint on hover */}
            <span
              className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity duration-200 -ml-0.5"
              style={{ color: "#00e5ff" }}
            >
              →
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
