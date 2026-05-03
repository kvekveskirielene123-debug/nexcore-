"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

const NAV_LINKS = [
  { href: "/explore", label: "EXPLORE" },
  { href: "/favorites", label: "FAVORITES" },
  { href: "/personas", label: "PERSONAS" },
  { href: "/store", label: "STORE" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#05020d]/95 backdrop-blur-md border-b border-purple-700/15"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/explore"
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <DnaLogo size={28} />
          <span
            className="text-sm font-black tracking-[4px] text-white group-hover:text-cyan-400 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NEXCOR
          </span>
        </Link>

        {/* Nav links – hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`text-[10px] tracking-[3px] uppercase transition-colors ${
                  active
                    ? "text-cyan-400"
                    : "text-[#7a6a9a] hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[9px] tracking-[3px] uppercase hover:bg-cyan-400/20 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-base leading-none">+</span> CREATE
          </Link>
          <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-700/30 text-[#7a6a9a] hover:text-white hover:border-purple-700/60 transition-colors"
            aria-label="Settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
