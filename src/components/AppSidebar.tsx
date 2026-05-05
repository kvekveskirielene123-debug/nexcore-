"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";
import { createClient } from "@/lib/supabase/client";

function IconExplore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconFavorites() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconPersonas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconCreate() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function IconSubscribe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const NAV = [
  { href: "/explore",   label: "Explore",   Icon: IconExplore   },
  { href: "/favorites", label: "Favorites", Icon: IconFavorites },
  { href: "/personas",  label: "Personas",  Icon: IconPersonas  },
  { href: "/store",     label: "Store",     Icon: IconStore     },
  { href: "/subscribe", label: "Brilliant", Icon: IconSubscribe },
  { href: "/create",    label: "Create",    Icon: IconCreate    },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const [marks, setMarks] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("marks, username").eq("id", user.id).single();
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
      }}
    >
      {/* Top glow */}
      <div className="absolute top-0 right-0 w-px h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.2), transparent)" }} />

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

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isCreate = href === "/create";
          const isBrilliant = href === "/subscribe";
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200 group"
              style={{
                color: active
                  ? (isCreate ? "#00e5ff" : isBrilliant ? "#a78bfa" : "#00e5ff")
                  : "rgba(122,106,154,0.7)",
                background: active
                  ? (isCreate ? "rgba(0,229,255,0.08)" : isBrilliant ? "rgba(167,139,250,0.08)" : "rgba(0,229,255,0.06)")
                  : "transparent",
              }}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                  style={{
                    background: isCreate || !isBrilliant ? "#00e5ff" : "#a78bfa",
                    boxShadow: `0 0 8px ${isCreate || !isBrilliant ? "rgba(0,229,255,0.8)" : "rgba(167,139,250,0.8)"}`,
                  }}
                />
              )}
              <span
                className="transition-all duration-200"
                style={{
                  filter: active
                    ? `drop-shadow(0 0 6px ${isBrilliant ? "rgba(167,139,250,0.8)" : "rgba(0,229,255,0.8)"})`
                    : "none",
                }}
              >
                {isCreate ? (
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: active ? "rgba(0,229,255,0.15)" : "rgba(124,58,237,0.1)",
                      border: `1.5px solid ${active ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.3)"}`,
                      color: active ? "#00e5ff" : "rgba(122,106,154,0.7)",
                    }}
                  >
                    <Icon />
                  </span>
                ) : (
                  <Icon />
                )}
              </span>
              <span
                className="text-[8px] tracking-[1.5px] uppercase leading-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active
                    ? (isBrilliant ? "#a78bfa" : "#00e5ff")
                    : "rgba(122,106,154,0.5)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-3 pb-5 px-2">
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
              style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 10px rgba(0,229,255,0.6)" }}
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
          className="flex flex-col items-center gap-1 py-2 w-full rounded-xl transition-all duration-200"
          style={{
            color: pathname.startsWith("/settings") ? "#00e5ff" : "rgba(122,106,154,0.5)",
          }}
        >
          <IconSettings />
          <span className="text-[8px] tracking-[1.5px] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
