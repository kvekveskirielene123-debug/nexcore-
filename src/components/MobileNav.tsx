"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";
import { useSidebar } from "@/components/providers/SidebarProvider";

/* ═══════════════════════════════════════════════════════════
   Page title map
══════════════════════════════════════════════════════════════ */

const PAGE_TITLES: Record<string, string> = {
  "/explore":   "Explore",
  "/feed":      "Feed",
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
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

function IconFeed() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Row 1 */}
      <circle cx="4" cy="5.5" r="1.8" fill="currentColor" stroke="none" className="nx-nav-node" />
      <line x1="8" y1="4.8" x2="20.5" y2="4.8" strokeWidth="1.4" />
      <line x1="8" y1="6.5" x2="16.5" y2="6.5" strokeWidth="1" className="nx-nav-helix" />
      {/* Row 2 */}
      <circle cx="4" cy="12" r="1.8" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "0.6s" }} />
      <line x1="8" y1="11.3" x2="20.5" y2="11.3" strokeWidth="1.4" />
      <line x1="8" y1="13" x2="14.5" y2="13" strokeWidth="1" className="nx-nav-helix" style={{ animationDelay: "0.3s" }} />
      {/* Row 3 */}
      <circle cx="4" cy="18.5" r="1.8" fill="currentColor" stroke="none" className="nx-nav-node" style={{ animationDelay: "1.2s" }} />
      <line x1="8" y1="17.8" x2="20.5" y2="17.8" strokeWidth="1.4" />
      <line x1="8" y1="19.5" x2="18" y2="19.5" strokeWidth="1" className="nx-nav-helix" style={{ animationDelay: "0.9s" }} />
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
  { href: "/explore",  label: "Explore",  Icon: IconExplore,  isCreate: false },
  { href: "/feed",     label: "Feed",     Icon: IconFeed,     isCreate: false },
  { href: "/create",   label: "Create",   Icon: IconCreate,   isCreate: true  },
  { href: "/chats",    label: "Chats",    Icon: IconPersonas, isCreate: false },
  { href: "/settings",  label: "Settings",  Icon: IconSettings,  isCreate: false },
];

/* ═══════════════════════════════════════════════════════════
   MobileNav
══════════════════════════════════════════════════════════════ */

export function MobileNav() {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat/") || pathname.startsWith("/dm/");
  const { toggleMobile } = useSidebar();
  const [marks,     setMarks]     = useState<number | null>(null);
  const [username,  setUsername]  = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("marks, username, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) {
        setMarks(data.marks ?? 0);
        setUsername(data.username ?? null);
        setAvatarUrl(data.avatar_url ?? null);
      }
    });
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════
          Mobile top bar
      ════════════════════════════════════════ */}
      <header
        className={`${isChatPage ? "hidden" : "md:hidden"} fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14`}
        style={{
          background: "rgba(5,2,13,1)",
          borderBottom: "1px solid rgba(124,58,237,0.14)",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        {/* Bottom edge cyan glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.18), transparent)" }}
        />

        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleMobile}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90"
            style={{ color: "rgba(122,106,154,0.6)" }}
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/explore" className="flex items-center gap-1.5">
            <DnaLogo size={20} interactive />
            <span
              className="text-[10px] tracking-[4px] uppercase font-black"
              style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.7)" }}
            >
              N·X·R
            </span>
          </Link>
        </div>

        {/* Center — page title */}
        <h2
          className="absolute left-1/2 -translate-x-1/2 text-[11px] tracking-[3px] uppercase font-bold pointer-events-none"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.6)" }}
        >
          {getTitle(pathname)}
        </h2>

        {/* Right — marks + profile avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Marks pill → store */}
          {marks !== null && (
            <Link
              href="/store"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full active:scale-95 transition-transform duration-150"
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
          )}

          {/* Profile avatar → own profile */}
          {username && (
            <Link
              href={`/profile/${username}`}
              className="flex-shrink-0 active:scale-95 transition-transform duration-150"
              aria-label="My profile"
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-black"
                style={{
                  background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(0,229,255,0.35))",
                  border: "1.5px solid rgba(0,229,255,0.3)",
                  color: "#00e5ff",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 0 8px rgba(0,229,255,0.15)",
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  username[0].toUpperCase()
                )}
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════
          Mobile bottom dock — hidden on chat pages
      ════════════════════════════════════════ */}
      {!isChatPage && (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(5,2,13,1)",
          borderTop: "1px solid rgba(124,58,237,0.2)",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          willChange: "transform",
          /* Extend background into the iOS home-bar safe area */
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Top edge glow — static base + animated pulse */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.2), transparent)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none nx-header-glow"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.45), transparent)" }}
        />

        {/*
          items-end: bottom-aligns all items.
          Create's 48 px icon naturally floats above regular 22 px icons
          without any negative-margin hack — their icon-bottoms align,
          Create's icon-top just extends higher into the dock.
        */}
        <div className="flex items-end justify-around px-2 pt-3 pb-2">
          {NAV.map(({ href, label, Icon, isCreate }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            /* ── Create — premium elevated button ── */
            if (isCreate) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform duration-150"
                >
                  {/* 48 px container — larger than the 22 px regular icons,
                      so with items-end the icon top naturally rises above others */}
                  <span
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center${active ? " nx-icon-active" : ""}`}
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(0,150,255,0.16))"
                        : "linear-gradient(145deg, rgba(0,229,255,0.11), rgba(124,58,237,0.1))",
                      border: `1.5px solid ${active ? "rgba(0,229,255,0.65)" : "rgba(0,229,255,0.3)"}`,
                      color: "#00e5ff",
                      boxShadow: active
                        ? "0 0 28px rgba(0,229,255,0.55), 0 6px 22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)"
                        : "0 0 14px rgba(0,229,255,0.2), 0 4px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon />
                  </span>
                  <span
                    className="text-[9px] tracking-[1.5px] uppercase leading-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: active ? "#00e5ff" : "rgba(0,229,255,0.5)",
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
                style={{
                  color: active ? "#00e5ff" : "rgba(122,106,154,0.6)",
                  background: active ? "rgba(0,229,255,0.07)" : "transparent",
                  transition: "background 0.25s, color 0.25s",
                }}
              >
                {/* Icon with active glow */}
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

                {/* Active indicator dot */}
                {active && (
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,1)" }}
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
