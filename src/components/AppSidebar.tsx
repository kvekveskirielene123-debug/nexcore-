"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/providers/SidebarProvider";

// ── Nav icons ──────────────────────────────────────────────────────────────

function IconDiscover() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="5.8" strokeWidth="1.5" />
      <line x1="15" y1="15" x2="20.5" y2="20.5" strokeWidth="1.6" />
      <line x1="7.8" y1="9.2" x2="13.2" y2="9.2" strokeWidth="1" opacity="0.5" />
      <line x1="7.2" y1="10.5" x2="13.8" y2="10.5" strokeWidth="1.4" />
      <line x1="7.8" y1="11.8" x2="13.2" y2="11.8" strokeWidth="1" opacity="0.5" />
      <circle cx="7.2" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFeed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3.5" cy="5.5" r="1.7" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="4.8" x2="21" y2="4.8" strokeWidth="1.3" />
      <line x1="7.5" y1="6.5" x2="16.5" y2="6.5" strokeWidth="1" opacity="0.5" />
      <circle cx="3.5" cy="12" r="1.7" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="11.3" x2="21" y2="11.3" strokeWidth="1.3" />
      <line x1="7.5" y1="13" x2="14.5" y2="13" strokeWidth="1" opacity="0.5" />
      <circle cx="3.5" cy="18.5" r="1.7" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="17.8" x2="21" y2="17.8" strokeWidth="1.3" />
      <line x1="7.5" y1="19.5" x2="18" y2="19.5" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function IconChats() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
      <line x1="8" y1="9" x2="16" y2="9" strokeWidth="1" opacity="0.5" />
      <line x1="8" y1="13" x2="13" y2="13" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function IconCharms() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L22 12L12 22L2 12Z" strokeWidth="1.5" />
      <path d="M12 7L17 12L12 17L7 12Z" strokeWidth="1" opacity="0.45" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="2.8" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="21.2" cy="12" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21.2" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLabs() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3" strokeWidth="0.9" strokeDasharray="3 2.2" opacity="0.4" />
      <circle cx="12" cy="2.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
      <line x1="12" y1="7.5" x2="12" y2="2.5" strokeWidth="1.1" />
      <line x1="15.9" y1="14.3" x2="19.2" y2="16.2" strokeWidth="1.1" />
      <line x1="8.1" y1="14.3" x2="4.8" y2="16.2" strokeWidth="1.1" />
      <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="16.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="16.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Nav config ─────────────────────────────────────────────────────────────

const NAV = [
  { href: "/explore",   label: "Discover", Icon: IconDiscover },
  { href: "/feed",      label: "Feed",     Icon: IconFeed     },
  { href: "/chats",     label: "Chats",    Icon: IconChats    },
  { href: "/store",     label: "Charms",   Icon: IconCharms   },
  { href: "/subscribe", label: "Labs",     Icon: IconLabs     },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────

interface RecentConvo {
  id: string;
  title: string | null;
  character_id: string;
  character_name: string;
  character_avatar: string | null;
}

// ── AppSidebar ─────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isExpanded, toggleExpanded, mobileOpen, closeMobile } = useSidebar();

  const [marks,       setMarks]       = useState<number | null>(null);
  const [username,    setUsername]    = useState<string | null>(null);
  const [avatarUrl,   setAvatarUrl]   = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [recentConvos, setRecentConvos] = useState<RecentConvo[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Fetch user data + recent conversations
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("marks, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setMarks(profile.marks ?? 0);
        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url ?? null);
      }

      // Recent conversations with character info
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, title, character_id, characters!inner(name, avatar_url)")
        .eq("user_id", user.id)
        .not("last_message_at", "is", null)
        .order("last_message_at", { ascending: false })
        .limit(5);

      if (convos) {
        setRecentConvos(
          convos.map((c: any) => ({
            id: c.id,
            title: c.title,
            character_id: c.character_id,
            character_name: c.characters?.name ?? "Unknown",
            character_avatar: c.characters?.avatar_url ?? null,
          }))
        );
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navLinkClick = () => {
    closeMobile();
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[49] md:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50 flex flex-col select-none overflow-hidden
          w-[240px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isExpanded ? "md:w-[240px]" : "md:w-[72px]"}
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        `}
        style={{
          background: "rgba(5,2,13,0.98)",
          borderRight: "1px solid rgba(124,58,237,0.14)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Right edge glow */}
        <div
          className="absolute top-0 right-0 w-px bottom-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.18), rgba(124,58,237,0.12) 40%, transparent 80%)" }}
        />

        {/* ── Logo / Header ── */}
        <div
          className="flex items-center h-14 px-3 flex-shrink-0 gap-3"
          style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
        >
          <Link
            href="/explore"
            onClick={navLinkClick}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <DnaLogo size={24} interactive />
            {isExpanded && (
              <span
                className="text-[13px] font-black tracking-[3px] uppercase truncate"
                style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.75)" }}
              >
                NEXCOR
              </span>
            )}
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleExpanded}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg transition-all flex-shrink-0"
            style={{ color: "rgba(122,106,154,0.45)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#c084fc")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.45)")}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {isExpanded ? (
                <polyline points="15 18 9 12 15 6" />
              ) : (
                <polyline points="9 18 15 12 9 6" />
              )}
            </svg>
          </button>

          {/* Mobile close */}
          <button
            onClick={closeMobile}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
            style={{ color: "rgba(122,106,154,0.45)" }}
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">

          {/* ── Create button ── */}
          <div className={`px-3 pt-4 pb-2 flex-shrink-0 ${isExpanded ? "" : "flex justify-center"}`}>
            <Link
              href="/create"
              onClick={navLinkClick}
              className={`flex items-center gap-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                isExpanded ? "w-full px-4 py-2.5" : "w-10 h-10 justify-center"
              }`}
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12))",
                border: "1px solid rgba(0,229,255,0.28)",
                color: "#00e5ff",
                boxShadow: "0 0 16px rgba(0,229,255,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,229,255,0.2)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,229,255,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.28)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {isExpanded && <span style={{ fontFamily: "var(--font-display)" }}>Create</span>}
            </Link>
          </div>

          {/* ── Search bar (expanded only) ── */}
          {isExpanded && (
            <div className="px-3 pb-2 flex-shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(124,58,237,0.12)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.5)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "rgba(226,217,243,0.7)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Nav items ── */}
          <nav className={`flex flex-col gap-0.5 flex-shrink-0 ${isExpanded ? "px-2" : "px-2"}`}>
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={navLinkClick}
                  className={`relative flex items-center rounded-xl transition-all duration-200 group ${
                    isExpanded ? "gap-3 px-3 py-2.5" : "justify-center py-3"
                  }`}
                  style={{
                    color: active ? "#00e5ff" : "rgba(148,163,184,0.6)",
                    background: active ? "rgba(0,229,255,0.07)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Active left bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: "#00e5ff", boxShadow: "0 0 10px rgba(0,229,255,0.8)" }}
                    />
                  )}
                  <span className={active ? "text-[#00e5ff]" : ""}>
                    <Icon />
                  </span>
                  {isExpanded && (
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {label}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <span
                      className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                      style={{
                        background: "rgba(12,5,32,0.95)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        color: "rgba(226,217,243,0.9)",
                        fontFamily: "var(--font-display)",
                        zIndex: 100,
                      }}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Today / Recent chats (expanded only) ── */}
          {isExpanded && recentConvos.length > 0 && (
            <div className="flex-shrink-0 mt-4 px-3">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-[2px]"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
                >
                  Today
                </span>
                <Link
                  href="/chats"
                  onClick={navLinkClick}
                  className="text-[9px] transition-colors"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#c084fc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.35)")}
                >
                  See all →
                </Link>
              </div>
              <div className="flex flex-col gap-0.5">
                {recentConvos.map((c) => (
                  <Link
                    key={c.id}
                    href={`/chat/${c.character_id}`}
                    onClick={navLinkClick}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,0.9)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.7)";
                    }}
                  >
                    {/* Character avatar */}
                    <div
                      className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.25)" }}
                    >
                      {c.character_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.character_avatar} alt={c.character_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                          {(c.character_name[0] ?? "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs truncate" style={{ fontFamily: "var(--font-body)" }}>
                      {c.title || c.character_name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── Marks chip (expanded) ── */}
          {marks !== null && isExpanded && (
            <div className="px-3 pb-2 flex-shrink-0">
              <Link
                href="/store"
                onClick={navLinkClick}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: "rgba(0,229,255,0.05)",
                  border: "1px solid rgba(0,229,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.09)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.1)";
                }}
              >
                <div>
                  <p
                    className="text-[11px] font-black leading-none"
                    style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 8px rgba(0,229,255,0.5)" }}
                  >
                    {marks >= 10000 ? `${(marks / 1000).toFixed(1)}k` : marks.toLocaleString()}
                  </p>
                  <p
                    className="text-[8px] tracking-[2px] uppercase mt-0.5"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
                  >
                    ⟡ marks
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.35)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          )}

          {/* ── Marks chip (collapsed) ── */}
          {marks !== null && !isExpanded && (
            <div className="px-2 pb-2 flex justify-center flex-shrink-0">
              <Link
                href="/store"
                onClick={navLinkClick}
                className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl w-full group relative"
                style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.1)" }}
                title="Marks balance"
              >
                <span className="text-[11px] font-black" style={{ color: "#00e5ff", fontFamily: "var(--font-display)" }}>
                  {marks >= 10000 ? `${(marks / 1000).toFixed(0)}k` : marks}
                </span>
                <span className="text-[7px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}>⟡</span>
                <span
                  className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                  style={{ background: "rgba(12,5,32,0.95)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(226,217,243,0.9)", fontFamily: "var(--font-display)", zIndex: 100 }}
                >
                  {marks.toLocaleString()} Marks
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ── User profile (bottom) ── */}
        <div
          className="flex-shrink-0 relative"
          style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}
          ref={profileRef}
        >
          {/* Profile dropdown */}
          {profileOpen && (
            <div
              className={`absolute bottom-full w-full rounded-t-xl overflow-hidden ${isExpanded ? "" : "left-full bottom-0 top-auto w-48 rounded-xl rounded-bl-none ml-1"}`}
              style={{
                background: "rgba(10,5,25,0.98)",
                border: "1px solid rgba(124,58,237,0.2)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
              }}
            >
              <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />
              {username && (
                <Link
                  href={`/profile/${username}`}
                  onClick={() => { setProfileOpen(false); navLinkClick(); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                  style={{ color: "rgba(226,217,243,0.8)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-body)" }}>View Profile</span>
                </Link>
              )}
              <Link
                href="/settings"
                onClick={() => { setProfileOpen(false); navLinkClick(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                style={{ color: "rgba(226,217,243,0.8)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <IconSettings />
                <span style={{ fontFamily: "var(--font-body)" }}>Settings</span>
              </Link>
              <div className="mx-4 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
                style={{ color: "rgba(239,68,68,0.6)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.9)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.6)"; }}
              >
                <IconSignOut />
                <span style={{ fontFamily: "var(--font-body)" }}>Sign Out</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={`w-full flex items-center gap-3 py-3 transition-all ${isExpanded ? "px-4" : "justify-center px-2"}`}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.06)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-black"
              style={{
                background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(0,229,255,0.35))",
                border: "1.5px solid rgba(0,229,255,0.22)",
                color: "#00e5ff",
                fontFamily: "var(--font-display)",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={username ?? "User"} className="w-full h-full object-cover" />
              ) : (
                (username?.[0] ?? "?").toUpperCase()
              )}
            </div>

            {isExpanded && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}
                  >
                    {username ?? "User"}
                  </p>
                  <p
                    className="text-[9px] truncate"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
                  >
                    @{username ?? "..."}
                  </p>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(122,106,154,0.45)" strokeWidth="2"
                  className={`flex-shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
