"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";
import { createClient } from "@/lib/supabase/client";

/* ═══════════════════════════════════════════════════════════
   Genetic / Neolution Nav Icons
   Each SVG uses:
     .nx-nav-node  — dot nodes that pulse (opacity + scale)
     .nx-nav-helix — helix detail lines that wave (opacity)
     .nx-nav-ring  — orbital/ring elements that slowly spin
   Animations are defined in globals.css and accelerate on
   hover (.group:hover) and active (.nx-icon-active).
══════════════════════════════════════════════════════════════ */

/* Explore — molecular scan lens: magnifying glass with DNA base-pair rungs */
function IconExplore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Lens ring */}
      <circle cx="10.5" cy="10.5" r="5.8" strokeWidth="1.5" />
      {/* Handle */}
      <line x1="15" y1="15" x2="20.5" y2="20.5" strokeWidth="1.6" />
      {/* Base-pair rungs — inner helix cross-section */}
      <line x1="7.8" y1="9.2"  x2="13.2" y2="9.2"  strokeWidth="1"   className="nx-nav-helix" />
      <line x1="7.2" y1="10.5" x2="13.8" y2="10.5" strokeWidth="1.45" />
      <line x1="7.8" y1="11.8" x2="13.2" y2="11.8" strokeWidth="1"   className="nx-nav-helix" style={{ animationDelay: "0.9s" }} />
      {/* Node endpoints on center rung */}
      <circle cx="7.2"  cy="10.5" r="1.15" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="13.8" cy="10.5" r="1.15" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.5s" }} />
    </svg>
  );
}

/* Favorites — helix heart: heart outline with a DNA S-curve strand inside */
function IconFavorites() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Heart */}
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" />
      {/* Helix S-curve strand inside */}
      <path d="M12 8.5 C10 10.5 14 12.5 12 14.5" strokeWidth="1.1" fill="none" className="nx-nav-helix" />
      {/* Nodes on strand ends */}
      <circle cx="12" cy="8.1"  r="1"   fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="12" cy="14.9" r="0.9" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.7s" }} />
    </svg>
  );
}

/* Personas — neural profile: head + shoulders with orbital scan ring */
function IconPersonas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="12" cy="7.5" r="3.5" strokeWidth="1.5" />
      {/* Shoulders arc */}
      <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" strokeWidth="1.5" />
      {/* Orbital ring + nodes — all rotate together as a group */}
      <g className="nx-nav-ring" style={{ animationDuration: "11s" }}>
        <ellipse cx="12" cy="7.5" rx="6.5" ry="2.3" strokeWidth="1.1" strokeDasharray="2.5 1.5" />
        <circle cx="18.5" cy="7.5" r="1"   fill="currentColor" stroke="none" className="nx-nav-node" />
        <circle cx="5.5"  cy="7.5" r="1"   fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.1s" }} />
      </g>
    </svg>
  );
}

/* Store — crystal node: ⟡ diamond lattice with inner diamond and pulsing nodes */
function IconStore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer diamond */}
      <path d="M12 2L22 12L12 22L2 12Z" strokeWidth="1.5" />
      {/* Inner diamond */}
      <path d="M12 7L17 12L12 17L7 12Z" strokeWidth="1" opacity="0.5" />
      {/* Horizontal axis — subtle lattice line */}
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="0.85" opacity="0.3" />
      {/* Center core */}
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" className="nx-nav-node" />
      {/* Cardinal vertex nodes — staggered pulse */}
      <circle cx="12"  cy="2.8"  r="0.9" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.6s" }} />
      <circle cx="21.2" cy="12"  r="0.9" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.2s" }} />
      <circle cx="12"  cy="21.2" r="0.9" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.8s" }} />
    </svg>
  );
}

/* Create — synthesis cross: plus with DNA rung marks and terminal nodes */
function IconCreate() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
      {/* Cross arms */}
      <line x1="12" y1="4.5"  x2="12" y2="19.5" strokeWidth="1.6" />
      <line x1="4.5" y1="12" x2="19.5" y2="12"  strokeWidth="1.6" />
      {/* DNA rung ticks on vertical arm */}
      <line x1="10.3" y1="8.5"  x2="13.7" y2="8.5"  strokeWidth="1.05" className="nx-nav-helix" />
      <line x1="10.3" y1="15.5" x2="13.7" y2="15.5" strokeWidth="1.05" className="nx-nav-helix" style={{ animationDelay: "0.7s" }} />
      {/* Terminal nodes — staggered wave */}
      <circle cx="12"  cy="4.5"  r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="12"  cy="19.5" r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.5s" }} />
      <circle cx="4.5" cy="12"   r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1s" }} />
      <circle cx="19.5" cy="12"  r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.5s" }} />
    </svg>
  );
}

/* Brilliant — stellar constellation: star with orbital sweep and tip nodes */
function IconSubscribe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Star */}
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="1.5" />
      {/* Orbital sweep — slow ellipse across the star */}
      <ellipse cx="12" cy="12" rx="8.5" ry="3" strokeWidth="0.9" strokeDasharray="3 2.2" className="nx-nav-ring" style={{ animationDuration: "16s" }} />
      {/* Nodes at 3 star tips — staggered */}
      <circle cx="12"  cy="2.5" r="1"    fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="21.5" cy="9.5" r="0.85" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.8s" }} />
      <circle cx="2.5" cy="9.5"  r="0.85" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.6s" }} />
    </svg>
  );
}

/* Settings — atomic control: segmented outer ring + inner circle + 3 spokes + nucleus */
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
      {/* Segmented outer ring — slowly spins */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.2" strokeDasharray="4.5 2.8" className="nx-nav-ring" style={{ animationDuration: "18s" }} />
      {/* Inner precision ring */}
      <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
      {/* 3 radial spokes (0°, 120°, 240°) — inner ring edge to near outer ring */}
      <line x1="12"   y1="7.5"  x2="12"   y2="2.5"  strokeWidth="1.15" />
      <line x1="15.9" y1="14.3" x2="19.2" y2="16.2" strokeWidth="1.15" />
      <line x1="8.1"  y1="14.3" x2="4.8"  y2="16.2" strokeWidth="1.15" />
      {/* Outer spoke-end nodes */}
      <circle cx="12"  cy="2"   r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="20"  cy="16.8" r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.1s" }} />
      <circle cx="4"   cy="16.8" r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "2.2s" }} />
      {/* Center nucleus */}
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.55s" }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Nav item config
══════════════════════════════════════════════════════════════ */

const NAV = [
  { href: "/explore",   label: "Explore",   Icon: IconExplore,   isBrilliant: false },
  { href: "/favorites", label: "Favorites", Icon: IconFavorites, isBrilliant: false },
  { href: "/chats",     label: "Chats",     Icon: IconPersonas,  isBrilliant: false },
  { href: "/store",     label: "Store",     Icon: IconStore,     isBrilliant: false },
  { href: "/subscribe", label: "Brilliant", Icon: IconSubscribe, isBrilliant: true  },
  { href: "/create",    label: "Create",    Icon: IconCreate,    isBrilliant: false },
] as const;

/* ═══════════════════════════════════════════════════════════
   AppSidebar
══════════════════════════════════════════════════════════════ */

export function AppSidebar() {
  const pathname = usePathname();
  const [marks,    setMarks]    = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("marks, username")
        .eq("id", user.id)
        .single();
      if (data) { setMarks(data.marks ?? 0); setUsername(data.username); }
    });
  }, []);

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 w-[72px] select-none"
      style={{
        background: "rgba(5,2,13,0.97)",
        borderRight: "1px solid rgba(124,58,237,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* Top edge glow */}
      <div
        className="absolute top-0 right-0 w-px h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.2), transparent)" }}
      />

      {/* Logo */}
      <Link href="/explore" className="flex flex-col items-center py-5 gap-1.5 group flex-shrink-0">
        <DnaLogo size={28} interactive />
        <span
          className="text-[7px] tracking-[3px] uppercase font-black"
          style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.6)" }}
        >
          N·X·R
        </span>
      </Link>

      {/* Divider */}
      <div className="mx-4 h-px mb-2" style={{ background: "rgba(124,58,237,0.2)" }} />

      {/* ── Nav items ── */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV.map(({ href, label, Icon, isBrilliant }) => {
          const active   = pathname === href || pathname.startsWith(href + "/");
          const isCreate = href === "/create";

          const accentColor  = isBrilliant ? "#a78bfa" : "#00e5ff";
          const accentRgba   = isBrilliant ? "rgba(167,139,250," : "rgba(0,229,255,";

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 py-3 rounded-xl transition-colors duration-200 group"
              style={{
                color: active ? accentColor : "rgba(122,106,154,0.7)",
                background: active ? `${accentRgba}0.07)` : "transparent",
              }}
            >
              {/* Active left accent bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 10px ${accentRgba}0.9)`,
                  }}
                />
              )}

              {/* Icon wrapper — drives hover/active CSS animation cascade */}
              {isCreate ? (
                <span
                  className={`nx-icon-wrap w-10 h-10 rounded-xl flex items-center justify-center${active ? " nx-icon-active" : ""}`}
                  style={{
                    background: active
                      ? "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,150,255,0.13))"
                      : "linear-gradient(145deg, rgba(0,229,255,0.09), rgba(124,58,237,0.1))",
                    border: `1.5px solid ${active ? "rgba(0,229,255,0.55)" : "rgba(0,229,255,0.22)"}`,
                    boxShadow: active
                      ? "0 0 20px rgba(0,229,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                      : "0 0 10px rgba(0,229,255,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
                    transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, filter 0.3s ease, transform 0.3s ease",
                  }}
                >
                  <Icon />
                </span>
              ) : (
                <span
                  className={`nx-icon-wrap${active ? (isBrilliant ? " nx-icon-active nx-icon-brilliant" : " nx-icon-active") : ""}`}
                >
                  <Icon />
                </span>
              )}

              {/* Label */}
              <span
                className="text-[8px] tracking-[1.5px] uppercase leading-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? accentColor : "rgba(122,106,154,0.5)",
                  transition: "color 0.2s ease",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="flex flex-col items-center gap-2 pb-5 px-2">

        {/* Marks chip */}
        {marks !== null && (
          <div
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl w-full"
            style={{
              background: "rgba(0,229,255,0.05)",
              border: "1px solid rgba(0,229,255,0.12)",
            }}
          >
            <span
              className="text-[13px] font-black leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
                textShadow: "0 0 10px rgba(0,229,255,0.55)",
              }}
            >
              {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
            </span>
            <span
              className="text-[7px] tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
            >
              ⟡ marks
            </span>
          </div>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          className="relative flex flex-col items-center gap-1 py-2 w-full rounded-xl transition-colors duration-200 group"
          style={{
            color: pathname.startsWith("/settings") ? "#00e5ff" : "rgba(122,106,154,0.5)",
            background: pathname.startsWith("/settings") ? "rgba(0,229,255,0.07)" : "transparent",
          }}
        >
          {pathname.startsWith("/settings") && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
              style={{ background: "#00e5ff", boxShadow: "0 0 10px rgba(0,229,255,0.9)" }}
            />
          )}
          <span
            className={`nx-icon-wrap${pathname.startsWith("/settings") ? " nx-icon-active" : ""}`}
          >
            <IconSettings />
          </span>
          <span
            className="text-[8px] tracking-[1.5px] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
