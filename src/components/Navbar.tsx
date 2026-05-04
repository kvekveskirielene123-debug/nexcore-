"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconExplore({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconFavorites({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconPersonas({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
    </svg>
  );
}

function IconStore({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconCreate({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconSettings({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/explore",   label: "EXPLORE",   Icon: IconExplore   },
  { href: "/favorites", label: "FAVORITES", Icon: IconFavorites },
  { href: "/personas",  label: "PERSONAS",  Icon: IconPersonas  },
  { href: "/store",     label: "STORE",     Icon: IconStore     },
] as const;

// ─── Dock item ────────────────────────────────────────────────────────────────

function DockItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-90 select-none"
      style={{
        color: active ? "#00e5ff" : hovered ? "#c4b5fd" : "#4a3a6a",
        transform: hovered ? "translateY(-3px) scale(1.08)" : "translateY(0) scale(1)",
        transition: "color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        background: active
          ? "rgba(0,229,255,0.06)"
          : hovered
          ? "rgba(124,58,237,0.08)"
          : "transparent",
      }}
      aria-label={label}
    >
      {/* Icon */}
      <span
        style={{
          filter: active
            ? "drop-shadow(0 0 7px rgba(0,229,255,0.85))"
            : hovered
            ? "drop-shadow(0 0 5px rgba(167,139,250,0.6))"
            : "none",
          transition: "filter 0.2s",
        }}
      >
        <Icon size={20} />
      </span>

      {/* Label */}
      <span
        className="text-[7px] tracking-[2px] uppercase leading-none"
        style={{ fontFamily: "var(--font-mono)", opacity: active || hovered ? 1 : 0.5 }}
      >
        {label}
      </span>

      {/* Active indicator dot */}
      {active && (
        <span
          className="absolute -bottom-px left-1/2 -translate-x-1/2 w-5 h-px rounded-full"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.9),transparent)",
            boxShadow: "0 0 6px rgba(0,229,255,0.7)",
          }}
        />
      )}
    </Link>
  );
}

// ─── Create dock button ───────────────────────────────────────────────────────

function CreateDockButton({ active }: { active: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/create"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-90 select-none"
      style={{
        color: active ? "#00e5ff" : hovered ? "#00e5ff" : "#6a5a8a",
        transform: hovered ? "translateY(-4px) scale(1.12)" : "translateY(0) scale(1)",
        transition: "color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}
      aria-label="Create"
    >
      {/* Circle button */}
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: active || hovered
            ? "rgba(0,229,255,0.12)"
            : "rgba(124,58,237,0.12)",
          border: `1.5px solid ${active || hovered ? "rgba(0,229,255,0.55)" : "rgba(124,58,237,0.3)"}`,
          boxShadow: active || hovered
            ? "0 0 16px rgba(0,229,255,0.35), inset 0 0 8px rgba(0,229,255,0.06)"
            : "none",
          transition: "all 0.2s",
        }}
      >
        <IconCreate size={16} />
      </span>

      <span
        className="text-[7px] tracking-[2px] uppercase leading-none"
        style={{ fontFamily: "var(--font-mono)", opacity: active || hovered ? 1 : 0.5 }}
      >
        CREATE
      </span>
    </Link>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat/");

  return (
    <>
      {/* ── Minimal top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#05020d]/95 backdrop-blur-md border-b border-purple-700/15">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/explore" className="flex items-center gap-2.5 flex-shrink-0 group">
            <DnaLogo size={28} interactive />
            <span
              className="text-sm font-black tracking-[4px] text-white group-hover:text-cyan-400"
              style={{ fontFamily: "var(--font-display)", transition: "color 0.3s, text-shadow 0.3s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.textShadow =
                  "0 0 12px rgba(0,229,255,0.6), 0 0 24px rgba(0,229,255,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.textShadow = "none";
              }}
            >
              NEXCOR
            </span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-700/30 text-[#7a6a9a] hover:text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all duration-200"
            aria-label="Settings"
          >
            <IconSettings size={14} />
          </Link>
        </div>
      </header>

      {/* ── Floating center dock ── */}
      {!isChatPage && (
        <nav
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
          style={{ willChange: "transform" }}
        >
          <div
            className="flex items-end gap-1 px-3 pt-2 pb-1 rounded-2xl"
            style={{
              background: "rgba(8,4,26,0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(124,58,237,0.22)",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.4), 0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Subtle top-edge highlight */}
            <div
              className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
              style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.15),transparent)" }}
            />

            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <DockItem
                  key={href}
                  href={href}
                  label={label}
                  Icon={Icon}
                  active={active}
                />
              );
            })}

            {/* Separator */}
            <span
              className="w-px mx-1 self-stretch my-2 flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.25)" }}
            />

            <CreateDockButton active={pathname.startsWith("/create")} />
          </div>
        </nav>
      )}
    </>
  );
}
