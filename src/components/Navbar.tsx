"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

// ─── SVG Icons ───────────────────────────────────────────────────────────────
// Stroke-based, inherit currentColor → glow cyan when active, muted otherwise.

function IconExplore({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconFavorites({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconPersonas({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
    </svg>
  );
}

function IconStore({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconCreate({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Nav data ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/explore",   label: "EXPLORE",   desc: "Discover AI characters",  Icon: IconExplore   },
  { href: "/favorites", label: "FAVORITES", desc: "Your saved characters",    Icon: IconFavorites },
  { href: "/personas",  label: "PERSONAS",  desc: "Your roleplay identities", Icon: IconPersonas  },
  { href: "/store",     label: "STORE",     desc: "Buy message marks",        Icon: IconStore     },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat/");

  return (
    <>
      {/* ════════════════════════════════════════════
          TOP HEADER — all screen sizes
      ════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#05020d]/95 backdrop-blur-md border-b border-purple-700/15">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

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

          {/* ── Desktop nav (md+) ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, desc, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <div key={href} className="relative group/nl">
                  <Link
                    href={href}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? "text-cyan-400 bg-cyan-400/5"
                        : "text-[#6a5a8a] hover:text-white hover:bg-white/[0.03]"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {/* Icon with glow on active */}
                    <span
                      style={{
                        filter: active ? "drop-shadow(0 0 5px rgba(0,229,255,0.75))" : "none",
                        transition: "filter 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} />
                    </span>

                    {/* Label */}
                    <span className="text-[9.5px] tracking-[2.5px] uppercase">{label}</span>

                    {/* Active underline dot */}
                    {active && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-px rounded-full"
                        style={{
                          background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.9),transparent)",
                          boxShadow: "0 0 6px rgba(0,229,255,0.6)",
                        }}
                      />
                    )}
                  </Link>

                  {/* Description tooltip — appears on hover */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-3 py-1.5 rounded-lg border whitespace-nowrap pointer-events-none z-[60]
                      opacity-0 translate-y-1 group-hover/nl:opacity-100 group-hover/nl:translate-y-0 transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 8,
                      letterSpacing: "1.5px",
                      color: "#7a6a9a",
                      background: "rgba(8,4,26,0.96)",
                      borderColor: "rgba(124,58,237,0.22)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    {desc}
                    {/* Tiny arrow pointing up */}
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 overflow-hidden"
                      style={{ filter: "drop-shadow(0 -1px 0 rgba(124,58,237,0.22))" }}
                    >
                      <span
                        className="block w-2 h-2 rotate-45 -mt-1"
                        style={{ background: "rgba(8,4,26,0.96)", border: "1px solid rgba(124,58,237,0.22)" }}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[9px] tracking-[3px] uppercase transition-all duration-200 hover:bg-cyan-400/20 hover:shadow-[0_0_16px_rgba(0,229,255,0.25)] hover:border-cyan-400/60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <IconCreate size={10} /> CREATE
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-700/30 text-[#7a6a9a] hover:text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all duration-200"
              aria-label="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className="transition-transform duration-500 hover:rotate-90">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          MOBILE BOTTOM TAB BAR — hidden on md+ and chat pages
      ════════════════════════════════════════════ */}
      {!isChatPage && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-purple-700/15"
          style={{ background: "rgba(5,2,13,0.97)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-stretch">
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 active:scale-90"
                  style={{
                    color: active ? "#00e5ff" : "#4a3a6a",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span
                    style={{
                      filter: active ? "drop-shadow(0 0 6px rgba(0,229,255,0.8))" : "none",
                      transition: "filter 0.2s",
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <span
                    className="text-[7px] tracking-[1.5px] uppercase"
                    style={{ opacity: active ? 1 : 0.6 }}
                  >
                    {label}
                  </span>
                  {/* Active dot */}
                  {active && (
                    <span
                      className="absolute top-0 w-6 h-px"
                      style={{
                        background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.8),transparent)",
                        boxShadow: "0 0 4px rgba(0,229,255,0.5)",
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* CREATE — special highlighted tab */}
            <Link
              href="/create"
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 active:scale-90"
              style={{
                color: pathname.startsWith("/create") ? "#00e5ff" : "#6a5a8a",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: pathname.startsWith("/create")
                    ? "rgba(0,229,255,0.15)"
                    : "rgba(124,58,237,0.12)",
                  border: `1px solid ${pathname.startsWith("/create") ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.25)"}`,
                  boxShadow: pathname.startsWith("/create") ? "0 0 12px rgba(0,229,255,0.3)" : "none",
                }}
              >
                <IconCreate size={15} />
              </span>
              <span
                className="text-[7px] tracking-[1.5px] uppercase"
                style={{ opacity: pathname.startsWith("/create") ? 1 : 0.6 }}
              >
                CREATE
              </span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
