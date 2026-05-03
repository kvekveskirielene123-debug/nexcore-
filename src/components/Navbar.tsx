"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

const NAV_LINKS = [
  { href: "/explore",   label: "EXPLORE"   },
  { href: "/favorites", label: "FAVORITES" },
  { href: "/personas",  label: "PERSONAS"  },
  { href: "/store",     label: "STORE"     },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#05020d]/95 backdrop-blur-md border-b border-purple-700/15">
      {/* Faint top-edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <Link href="/explore" className="flex items-center gap-2.5 flex-shrink-0 group">
          <DnaLogo size={28} interactive />
          <span
            className="text-sm font-black tracking-[4px] text-white transition-all duration-300 group-hover:text-cyan-400"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 0px rgba(0,229,255,0)",
              transition: "color 0.3s, text-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.textShadow =
                "0 0 12px rgba(0,229,255,0.6), 0 0 24px rgba(0,229,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.textShadow =
                "0 0 0px rgba(0,229,255,0)";
            }}
          >
            NEXCOR
          </span>
        </Link>

        {/* ── Nav links – hidden on mobile ── */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 group/navlink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span
                  className={`text-[10px] tracking-[3px] uppercase transition-colors duration-200 ${
                    active ? "text-cyan-400" : "text-[#7a6a9a] group-hover/navlink:text-white"
                  }`}
                >
                  {label}
                </span>
                {/* Active underline glow dot */}
                <span
                  className="h-px w-full rounded-full transition-all duration-300"
                  style={{
                    background: active
                      ? "linear-gradient(90deg, transparent, rgba(0,229,255,0.8), transparent)"
                      : "transparent",
                    boxShadow: active ? "0 0 6px rgba(0,229,255,0.6)" : "none",
                  }}
                />
              </Link>
            );
          })}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[9px] tracking-[3px] uppercase transition-all duration-200 hover:bg-cyan-400/20 hover:shadow-[0_0_16px_rgba(0,229,255,0.25)] hover:border-cyan-400/60"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-base leading-none">+</span> CREATE
          </Link>
          <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-700/30 text-[#7a6a9a] hover:text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all duration-200"
            aria-label="Settings"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className="transition-transform duration-500 hover:rotate-90"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
