"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PAGE_TITLES: Record<string, string> = {
  "/explore":   "Explore",
  "/favorites": "Favorites",
  "/personas":  "Personas",
  "/store":     "Mark Store",
  "/subscribe": "Go Brilliant",
  "/create":    "Create",
  "/settings":  "Settings",
  "/chat":      "Chat",
};

function getTitle(pathname: string): string {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "Nexcor";
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [marks, setMarks] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [claimFlash, setClaimFlash] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("marks, username").eq("id", user.id).single();
      if (data) { setMarks(data.marks ?? 0); setUsername(data.username); }
    });

    fetch("/api/marks/claim-daily")
      .then((r) => r.json())
      .then((d) => setCanClaim(!!d.available))
      .catch(() => {});
  }, []);

  const handleClaim = async () => {
    if (claiming || !canClaim) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/marks/claim-daily", { method: "POST" });
      const data = await res.json();
      if (data.claimed) {
        setMarks(data.new_balance ?? null);
        setCanClaim(false);
        setClaimFlash(true);
        setTimeout(() => setClaimFlash(false), 1500);
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <header
      className="hidden md:flex fixed top-0 z-40 items-center justify-between px-6 h-14"
      style={{
        left: 72,
        right: 0,
        background: "rgba(5,2,13,0.92)",
        borderBottom: "1px solid rgba(124,58,237,0.1)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Page title */}
      <h2
        className="text-[13px] tracking-[3px] uppercase font-bold"
        style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.7)" }}
      >
        {getTitle(pathname)}
      </h2>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Marks chip */}
        {marks !== null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: claimFlash ? "rgba(0,229,255,0.15)" : "rgba(0,229,255,0.06)",
              border: `1px solid ${claimFlash ? "rgba(0,229,255,0.5)" : "rgba(0,229,255,0.15)"}`,
              transition: "all 0.3s",
            }}
          >
            <span
              className="text-[10px]"
              style={{ color: "rgba(0,229,255,0.6)" }}
            >
              ⟡
            </span>
            <span
              className="text-[12px] font-black tabular-nums"
              style={{
                fontFamily: "var(--font-display)",
                color: claimFlash ? "#00e5ff" : "rgba(0,229,255,0.85)",
                textShadow: claimFlash ? "0 0 12px rgba(0,229,255,0.8)" : "none",
              }}
            >
              {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
            </span>
          </div>
        )}

        {/* Daily claim button */}
        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(167,139,250,0.12)",
              border: "1px solid rgba(167,139,250,0.35)",
              color: "#a78bfa",
              boxShadow: "0 0 12px rgba(167,139,250,0.15)",
            }}
          >
            {claiming ? "..." : "◇ CLAIM"}
          </button>
        )}

        {/* Username / avatar */}
        {username && (
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:border-cyan-400/30"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(0,229,255,0.3))",
                border: "1px solid rgba(0,229,255,0.25)",
                color: "#00e5ff",
                fontFamily: "var(--font-display)",
              }}
            >
              {username[0].toUpperCase()}
            </div>
            <span
              className="text-[10px] tracking-[1px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.6)" }}
            >
              {username}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
