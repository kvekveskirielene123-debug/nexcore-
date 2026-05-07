"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

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

function getTitle(p: string): string {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (p === key || p.startsWith(key + "/")) return val;
  }
  return "Nexcor";
}

function IconExplore() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconFavorites() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconPersonas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
    </svg>
  );
}
function IconCreate() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

const NAV = [
  { href: "/explore",   label: "Explore",   Icon: IconExplore,   isCreate: false },
  { href: "/favorites", label: "Favorites", Icon: IconFavorites, isCreate: false },
  { href: "/create",    label: "Create",    Icon: IconCreate,    isCreate: true  },
  { href: "/personas",  label: "Personas",  Icon: IconPersonas,  isCreate: false },
  { href: "/settings",  label: "Settings",  Icon: IconSettings,  isCreate: false },
];

export function MobileNav() {
  const pathname = usePathname();
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
      {/* ── Mobile top bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(5,2,13,0.94)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <Link href="/explore" className="flex items-center gap-2">
          <DnaLogo size={22} />
          <span
            className="text-[10px] tracking-[4px] text-[#00e5ff]/70 uppercase font-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            N·X·R
          </span>
        </Link>

        <h2
          className="text-[11px] tracking-[3px] uppercase font-bold"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.6)" }}
        >
          {getTitle(pathname)}
        </h2>

        {marks !== null ? (
          <Link
            href="/store"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.15)",
            }}
          >
            <span style={{ color: "rgba(0,229,255,0.6)", fontSize: 10 }}>⟡</span>
            <span
              className="text-[11px] font-black tabular-nums"
              style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.85)" }}
            >
              {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
            </span>
          </Link>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(5,2,13,0.97)",
          borderTop: "1px solid rgba(124,58,237,0.18)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25), transparent)" }}
        />

        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {NAV.map(({ href, label, Icon, isCreate }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            if (isCreate) {
              return (
                <Link key={href} href={href} className="flex flex-col items-center gap-1 -mt-5 px-2">
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,229,255,0.25), rgba(0,180,255,0.15))"
                        : "linear-gradient(135deg, rgba(0,229,255,0.14), rgba(124,58,237,0.1))",
                      border: `1.5px solid ${active ? "rgba(0,229,255,0.6)" : "rgba(0,229,255,0.28)"}`,
                      color: "#00e5ff",
                      boxShadow: active
                        ? "0 0 22px rgba(0,229,255,0.45), 0 6px 20px rgba(0,0,0,0.5)"
                        : "0 0 12px rgba(0,229,255,0.18), 0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Icon />
                  </span>
                  <span
                    className="text-[9px] tracking-[1.5px] uppercase"
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

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 active:scale-95 min-w-[52px]"
                style={{ color: active ? "#00e5ff" : "rgba(122,106,154,0.6)" }}
              >
                <span
                  style={{
                    filter: active ? "drop-shadow(0 0 6px rgba(0,229,255,0.7))" : "none",
                    transition: "filter 0.2s ease",
                  }}
                >
                  <Icon />
                </span>
                <span
                  className="text-[9px] tracking-[1.5px] uppercase leading-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: active ? "#00e5ff" : "rgba(122,106,154,0.5)",
                  }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.9)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
