"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

/* ═══════════════════════════════════════════════════════════
   Page title map
══════════════════════════════════════════════════════════════ */

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
};

function getTitle(p: string): string {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (p === key || p.startsWith(key + "/")) return val;
  }
  return "Nexcor";
}

/* ═══════════════════════════════════════════════════════════
   Genetic / Neolution Nav Icons  (22px mobile size)
   Same animation classes as AppSidebar:
     .nx-nav-node  — nodes pulse
     .nx-nav-helix — helix lines wave
     .nx-nav-ring  — orbitals spin
   Active glow via .nx-icon-active on the wrapper.
══════════════════════════════════════════════════════════════ */

function IconExplore() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="5.8" strokeWidth="1.5" />
      <line x1="15" y1="15" x2="20.5" y2="20.5" strokeWidth="1.6" />
      <line x1="7.8" y1="9.2"  x2="13.2" y2="9.2"  strokeWidth="1"   className="nx-nav-helix" />
      <line x1="7.2" y1="10.5" x2="13.8" y2="10.5" strokeWidth="1.45" />
      <line x1="7.8" y1="11.8" x2="13.2" y2="11.8" strokeWidth="1"   className="nx-nav-helix" style={{ animationDelay: "0.9s" }} />
      <circle cx="7.2"  cy="10.5" r="1.15" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="13.8" cy="10.5" r="1.15" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.5s" }} />
    </svg>
  );
}

function IconFavorites() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" />
      <path d="M12 8.5 C10 10.5 14 12.5 12 14.5" strokeWidth="1.1" fill="none" className="nx-nav-helix" />
      <circle cx="12" cy="8.1"  r="1"   fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="12" cy="14.9" r="0.9" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.7s" }} />
    </svg>
  );
}

function IconPersonas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7.5" r="3.5" strokeWidth="1.5" />
      <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" strokeWidth="1.5" />
      <g className="nx-nav-ring" style={{ animationDuration: "11s" }}>
        <ellipse cx="12" cy="7.5" rx="6.5" ry="2.3" strokeWidth="1.1" strokeDasharray="2.5 1.5" />
        <circle cx="18.5" cy="7.5" r="1"   fill="currentColor" stroke="none" className="nx-nav-node" />
        <circle cx="5.5"  cy="7.5" r="1"   fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.1s" }} />
      </g>
    </svg>
  );
}

function IconCreate() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="12" y1="4.5"  x2="12" y2="19.5" strokeWidth="1.7" />
      <line x1="4.5" y1="12" x2="19.5" y2="12"  strokeWidth="1.7" />
      <line x1="10.3" y1="8.5"  x2="13.7" y2="8.5"  strokeWidth="1.1" className="nx-nav-helix" />
      <line x1="10.3" y1="15.5" x2="13.7" y2="15.5" strokeWidth="1.1" className="nx-nav-helix" style={{ animationDelay: "0.7s" }} />
      <circle cx="12"   cy="4.5"  r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="12"   cy="19.5" r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.5s" }} />
      <circle cx="4.5"  cy="12"   r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1s" }} />
      <circle cx="19.5" cy="12"   r="1.25" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.5s" }} />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"  strokeWidth="1.2" strokeDasharray="4.5 2.8" className="nx-nav-ring" style={{ animationDuration: "18s" }} />
      <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
      <line x1="12"   y1="7.5"  x2="12"   y2="2.5"  strokeWidth="1.15" />
      <line x1="15.9" y1="14.3" x2="19.2" y2="16.2" strokeWidth="1.15" />
      <line x1="8.1"  y1="14.3" x2="4.8"  y2="16.2" strokeWidth="1.15" />
      <circle cx="12" cy="2"    r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" />
      <circle cx="20" cy="16.8" r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.1s" }} />
      <circle cx="4"  cy="16.8" r="1.1" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "2.2s" }} />
      <circle cx="12" cy="12"   r="1.8" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.55s" }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Nav config
══════════════════════════════════════════════════════════════ */

const NAV = [
  { href: "/explore",   label: "Explore",   Icon: IconExplore,   isCreate: false },
  { href: "/favorites", label: "Favorites", Icon: IconFavorites, isCreate: false },
  { href: "/create",    label: "Create",    Icon: IconCreate,    isCreate: true  },
  { href: "/chats",     label: "Chats",     Icon: IconPersonas,  isCreate: false },
  { href: "/settings",  label: "Settings",  Icon: IconSettings,  isCreate: false },
];

/* ═══════════════════════════════════════════════════════════
   MobileNav
══════════════════════════════════════════════════════════════ */

export function MobileNav() {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat/");
  const [marks, setMarks] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("marks").eq("id", user.id).single();
      if (data) setMarks(data.marks ?? 0);
    });
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════
          Mobile top bar
      ════════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(5,2,13,0.96)",
          borderBottom: "1px solid rgba(124,58,237,0.14)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Bottom edge cyan glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.18), transparent)" }}
        />

        {/* Left — logo + brand */}
        <Link href="/explore" className="flex items-center gap-2 flex-shrink-0">
          <DnaLogo size={22} interactive />
          <span
            className="text-[10px] tracking-[4px] uppercase font-black"
            style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.7)" }}
          >
            N·X·R
          </span>
        </Link>

        {/* Center — page title */}
        <h2
          className="absolute left-1/2 -translate-x-1/2 text-[11px] tracking-[3px] uppercase font-bold pointer-events-none"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.6)" }}
        >
          {getTitle(pathname)}
        </h2>

        {/* Right — marks balance */}
        {marks !== null ? (
          <Link
            href="/store"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0 transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.18)",
            }}
          >
            <span style={{ color: "rgba(0,229,255,0.65)", fontSize: 10 }}>⟡</span>
            <span
              className="text-[11px] font-black tabular-nums"
              style={{
                fontFamily: "var(--font-display)",
                color: "rgba(0,229,255,0.88)",
                textShadow: "0 0 8px rgba(0,229,255,0.4)",
              }}
            >
              {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
            </span>
          </Link>
        ) : (
          <div className="w-16 flex-shrink-0" />
        )}
      </header>

      {/* ════════════════════════════════════════
          Mobile bottom dock — hidden on chat pages
      ════════════════════════════════════════ */}
      {!isChatPage && (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(5,2,13,0.97)",
          borderTop: "1px solid rgba(124,58,237,0.2)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Top edge glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.28), transparent)" }}
        />

        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {NAV.map(({ href, label, Icon, isCreate }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            /* ── Create — elevated pill button ── */
            if (isCreate) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1 -mt-5 px-2 active:scale-95 transition-transform duration-150"
                >
                  <span
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center${active ? " nx-icon-active" : ""}`}
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,229,255,0.22), rgba(0,160,255,0.14))"
                        : "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.09))",
                      border: `1.5px solid ${active ? "rgba(0,229,255,0.6)" : "rgba(0,229,255,0.28)"}`,
                      color: "#00e5ff",
                      boxShadow: active
                        ? "0 0 24px rgba(0,229,255,0.5), 0 6px 20px rgba(0,0,0,0.5)"
                        : "0 0 12px rgba(0,229,255,0.16), 0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Icon />
                  </span>
                  <span
                    className="text-[9px] tracking-[1.5px] uppercase leading-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: active ? "#00e5ff" : "rgba(0,229,255,0.45)",
                    }}
                  >
                    {label}
                  </span>
                </Link>
              );
            }

            /* ── Regular nav item ── */
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors duration-200 active:scale-95 min-w-[52px]"
                style={{ color: active ? "#00e5ff" : "rgba(122,106,154,0.6)" }}
              >
                {/* Icon with active glow class */}
                <span
                  className={`nx-icon-wrap${active ? " nx-icon-active" : ""}`}
                  style={{
                    filter: active ? "drop-shadow(0 0 6px rgba(0,229,255,0.75))" : undefined,
                    transition: "filter 0.2s ease",
                  }}
                >
                  <Icon />
                </span>

                {/* Label */}
                <span
                  className="text-[9px] tracking-[1.5px] uppercase leading-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: active ? "#00e5ff" : "rgba(122,106,154,0.5)",
                  }}
                >
                  {label}
                </span>

                {/* Active dot indicator */}
                {active && (
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{
                      background: "#00e5ff",
                      boxShadow: "0 0 6px rgba(0,229,255,0.9)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </>
  );
}
