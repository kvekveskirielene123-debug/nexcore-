"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ConversationRow } from "./page";

/* ═══════════════════════════════════════════════════════════
   Time helpers
══════════════════════════════════════════════════════════════ */

function groupLabel(iso: string | null): string {
  if (!iso) return "Earlier";
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays === 0)  return "Today";
  if (diffDays === 1)  return "Yesterday";
  if (diffDays <= 6)   return "This Week";
  if (diffDays <= 30)  return "This Month";
  return "Earlier";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function isRecent(iso: string | null): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 3 * 60 * 60 * 1000; // 3 hours
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];

/* ═══════════════════════════════════════════════════════════
   Animated orbital SVG — same system as Settings
══════════════════════════════════════════════════════════════ */

function OrbitalLogo() {
  const nodes: [number, number, string][] = [
    [68, 40, "0s"], [54, 64, "0.43s"], [26, 64, "0.86s"],
    [12, 40, "1.29s"], [26, 16, "1.72s"], [54, 16, "2.15s"],
  ];
  return (
    <div className="relative inline-flex items-center justify-center mb-5">
      {/* Breathing glow backdrop */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 120, height: 120,
          background: "radial-gradient(circle, rgba(0,200,255,0.12) 0%, transparent 70%)",
          animation: "mark-ring-breathe 3.5s ease-in-out infinite",
        }}
      />
      <svg width="84" height="84" viewBox="0 0 80 80" fill="none" aria-hidden>
        {/* Outer breathing ring */}
        <circle cx="40" cy="40" r="37" stroke="rgba(0,229,255,0.13)" strokeWidth="0.8" className="settings-logo-ring" />
        {/* Orbiting dashed ring */}
        <g className="settings-logo-orbit">
          <circle cx="40" cy="40" r="30" stroke="rgba(0,229,255,0.12)" strokeWidth="0.7" strokeDasharray="3 9" />
        </g>
        {/* Spoke lines */}
        {[[40,40,68,40],[40,40,54,64],[40,40,26,64],[40,40,12,40],[40,40,26,16],[40,40,54,16]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
        ))}
        {/* Orbital nodes */}
        {nodes.map(([x, y, d], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(0,229,255,0.75)"
            className="settings-logo-node" style={{ animationDelay: d }} />
        ))}
        {/* Outer diamond */}
        <polygon points="40,27 53,40 40,53 27,40" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="1" className="settings-logo-diamond-outer" />
        {/* Inner diamond */}
        <polygon points="40,33 47,40 40,47 33,40" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" className="settings-logo-diamond-inner" />
        {/* Center pulse ripples */}
        <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.38)" strokeWidth="1.5" r="5">
          <animate attributeName="r" values="5;17" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.38;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="1" r="5">
          <animate attributeName="r" values="5;22" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
        </circle>
        {/* Center dot */}
        <circle cx="40" cy="40" r="4.5" fill="rgba(0,200,255,0.92)" />
        <circle cx="40" cy="40" r="2" fill="white" opacity="0.95" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Character avatar with scan line
══════════════════════════════════════════════════════════════ */

function ConvAvatar({ src, name, recent }: { src: string | null; name: string; recent: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="w-12 h-12 rounded-xl overflow-hidden relative"
        style={{
          background: "rgba(9,4,26,0.9)",
          border: `1px solid ${recent ? "rgba(0,229,255,0.35)" : "rgba(124,58,237,0.2)"}`,
          boxShadow: recent ? "0 0 14px rgba(0,229,255,0.15)" : "none",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[12px] font-black"
              style={{ fontFamily: "var(--font-display)", color: "#00e5ff" }}
            >
              {name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {/* Scan line */}
        <div
          className="animate-card-scan pointer-events-none"
          style={{ height: "1.5px", background: "rgba(0,229,255,0.5)", width: "100%", left: 0 }}
        />
      </div>
      {/* Active pulse dot */}
      {recent && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            background: "#00e5ff",
            borderColor: "#05020d",
            boxShadow: "0 0 6px rgba(0,229,255,0.9)",
            animation: "nx-nav-node-pulse 1.8s ease-in-out infinite",
            transformBox: "fill-box",
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Conversation row
══════════════════════════════════════════════════════════════ */

function ConvRow({
  conv,
  onDelete,
  deleting,
}: {
  conv: ConversationRow;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const recent = isRecent(conv.last_message_at);
  const href = `/chat/${conv.character_id}?conv=${conv.id}`;
  const subtitle = conv.title && conv.title !== conv.character_name
    ? conv.title
    : (conv.character_subtitle ?? "Continue conversation");

  if (deleting) {
    return (
      <div
        className="flex items-center justify-center px-4 py-3.5 gap-3"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.08)", opacity: 0.4 }}
      >
        <span className="text-[10px] tracking-[2px] text-[#7a6a9a] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Deleting…
        </span>
      </div>
    );
  }

  return (
    <div
      className="group relative flex items-center gap-3 px-4 transition-colors duration-200"
      style={{
        borderBottom: "1px solid rgba(124,58,237,0.08)",
        background: confirmDelete ? "rgba(239,68,68,0.05)" : undefined,
      }}
    >
      {/* Active left bar */}
      {recent && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full"
          style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.8)" }}
        />
      )}

      {/* Main link area */}
      <Link
        href={href}
        className="flex items-center gap-3 flex-1 min-w-0 py-3.5"
        onClick={() => { if (confirmDelete) return; }}
      >
        <ConvAvatar src={conv.character_avatar} name={conv.character_name} recent={recent} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span
              className="text-[13px] font-semibold truncate transition-colors duration-200"
              style={{
                fontFamily: "var(--font-display)",
                color: recent ? "#00e5ff" : "rgba(226,217,243,0.88)",
                textShadow: recent ? "0 0 10px rgba(0,229,255,0.4)" : "none",
              }}
            >
              {conv.character_name}
            </span>
            <span
              className="text-[9px] tracking-[1px] flex-shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                color: recent ? "rgba(0,229,255,0.6)" : "rgba(122,106,154,0.5)",
              }}
            >
              {relativeTime(conv.last_message_at)}
            </span>
          </div>
          <p
            className="text-[11px] truncate"
            style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}
          >
            {subtitle}
          </p>
        </div>

        {/* Chevron */}
        {!confirmDelete && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="rgba(0,229,255,0.25)" strokeWidth="2" strokeLinecap="round"
            className="flex-shrink-0 transition-all duration-200 group-hover:stroke-[rgba(0,229,255,0.6)] group-hover:translate-x-0.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </Link>

      {/* Delete controls */}
      {confirmDelete ? (
        <div className="flex items-center gap-2 py-3.5 flex-shrink-0">
          <button
            onClick={() => { onDelete(conv.id); setConfirmDelete(false); }}
            className="px-3 py-1 rounded-lg text-[9px] tracking-[1.5px] uppercase font-bold transition-all duration-150 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "rgba(239,68,68,0.9)",
            }}
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1 rounded-lg text-[9px] tracking-[1.5px] uppercase font-bold transition-all duration-150 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "rgba(167,139,250,0.7)",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1"
          style={{ color: "rgba(122,106,154,0.5)" }}
          aria-label="Delete conversation"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main client
══════════════════════════════════════════════════════════════ */

type SortKey = "recent" | "character";

export function ChatsClient({
  conversations: initial,
  userId,
}: {
  conversations: ConversationRow[];
  userId: string;
}) {
  const [conversations, setConversations] = useState(initial);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  /* ── Delete handler ── */
  const handleDelete = async (id: string) => {
    setDeletingIds((s) => new Set(s).add(id));
    const supabase = createClient();
    await supabase.from("conversations").delete().eq("id", id).eq("user_id", userId);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setDeletingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q
      ? conversations.filter(
          (c) =>
            c.character_name.toLowerCase().includes(q) ||
            (c.title?.toLowerCase().includes(q))
        )
      : conversations;

    if (sort === "character") {
      list = [...list].sort((a, b) => a.character_name.localeCompare(b.character_name));
    }
    return list;
  }, [conversations, search, sort]);

  /* ── Group ── */
  const groups = useMemo(() => {
    const g: Record<string, ConversationRow[]> = {};
    const useGroups = sort === "recent";
    for (const conv of filtered) {
      const label = useGroups ? groupLabel(conv.last_message_at) : conv.character_name[0].toUpperCase();
      if (!g[label]) g[label] = [];
      g[label].push(conv);
    }
    return g;
  }, [filtered, sort]);

  const groupKeys = sort === "recent"
    ? GROUP_ORDER.filter((g) => groups[g]?.length)
    : Object.keys(groups).sort();

  const uniqueChars = new Set(conversations.map((c) => c.character_id)).size;
  const isEmpty = conversations.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  return (
    <div className="min-h-screen bg-[#05020d]">

      {/* ── Dot-grid background ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 pt-8 pb-8">

        {/* ════════════════════════════════════════
            Hero header
        ════════════════════════════════════════ */}
        <header className="text-center mb-8 settings-card-enter" style={{ animationDelay: "0s" }}>
          <OrbitalLogo />

          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ TRANSMISSION LOG · 324B21
          </div>

          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[6px] uppercase mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {"CHATS".split("").map((letter, i) => (
              <span key={i} className="settings-letter" style={{ animationDelay: `${i * 0.15}s` }}>
                {letter}
              </span>
            ))}
          </h1>

          {/* Stats bar */}
          {!isEmpty && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <StatBadge value={conversations.length} label="conversations" />
              <span style={{ color: "rgba(124,58,237,0.3)" }}>·</span>
              <StatBadge value={uniqueChars} label="characters" />
              {conversations.some((c) => isRecent(c.last_message_at)) && (
                <>
                  <span style={{ color: "rgba(124,58,237,0.3)" }}>·</span>
                  <span
                    className="flex items-center gap-1.5 text-[9px] tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#00e5ff",
                        boxShadow: "0 0 6px rgba(0,229,255,1)",
                        animation: "nx-nav-node-pulse 1.8s ease-in-out infinite",
                      }}
                    />
                    Active
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        {/* ════════════════════════════════════════
            Search + sort controls
        ════════════════════════════════════════ */}
        {!isEmpty && (
          <div className="flex gap-2 mb-6 settings-card-enter" style={{ animationDelay: "0.08s" }}>
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(0,229,255,0.4)" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH TRANSMISSIONS…"
                className="w-full pl-9 pr-4 py-2.5 text-[11px] tracking-[1.5px] uppercase rounded-xl outline-none transition-all duration-200 placeholder:text-[rgba(122,106,154,0.4)]"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(9,4,26,0.8)",
                  border: "1px solid rgba(0,229,255,0.12)",
                  color: "rgba(226,217,243,0.8)",
                  backdropFilter: "blur(12px)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.35)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.12)")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(122,106,154,0.5)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort toggle */}
            <div
              className="flex rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(9,4,26,0.8)" }}
            >
              {(["recent", "character"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className="px-3 py-2.5 text-[9px] tracking-[1.5px] uppercase transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: sort === key ? "rgba(0,229,255,0.1)" : "transparent",
                    color: sort === key ? "#00e5ff" : "rgba(122,106,154,0.5)",
                    borderRight: key === "recent" ? "1px solid rgba(124,58,237,0.2)" : "none",
                  }}
                >
                  {key === "recent" ? "Recent" : "A–Z"}
                </button>
              ))}
            </div>

            {/* New chat */}
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] tracking-[1.5px] uppercase transition-all duration-200 active:scale-95 flex-shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(0,229,255,0.07)",
                border: "1px solid rgba(0,229,255,0.2)",
                color: "rgba(0,229,255,0.8)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New
            </Link>
          </div>
        )}

        {/* ════════════════════════════════════════
            Empty state
        ════════════════════════════════════════ */}
        {(isEmpty || noResults) && (
          <div className="flex flex-col items-center text-center gap-6 py-16 settings-card-enter" style={{ animationDelay: "0.1s" }}>
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center relative"
              style={{
                background: "rgba(9,4,26,0.85)",
                border: "1px solid rgba(0,229,255,0.12)",
                boxShadow: "0 0 40px rgba(0,0,0,0.5), 0 0 24px rgba(0,229,255,0.05)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="35" stroke="rgba(0,229,255,0.1)" strokeWidth="1.2" className="settings-logo-ring" />
                <circle cx="40" cy="40" r="24" stroke="rgba(0,229,255,0.08)" strokeWidth="1" strokeDasharray="4 8" className="settings-logo-orbit" />
                <circle cx="40" cy="40" r="3.5" fill="rgba(0,200,255,0.8)" />
                <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="1" r="4">
                  <animate attributeName="r" values="4;18" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div>
              <p
                className="text-[15px] font-black tracking-[3px] uppercase mb-2"
                style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.7)" }}
              >
                {noResults ? "No matches found" : "No transmissions"}
              </p>
              <p
                className="text-[12px] text-[#7a6a9a] leading-relaxed max-w-xs"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {noResults
                  ? `Nothing matched "${search}". Try a different name.`
                  : "Head to Explore, pick a character and start your first conversation."}
              </p>
            </div>
            {!noResults && (
              <Link
                href="/explore"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all duration-200 active:scale-95"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.28)",
                  color: "#00e5ff",
                  boxShadow: "0 0 24px rgba(0,229,255,0.08)",
                }}
              >
                Browse Characters →
              </Link>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            Grouped conversation list
        ════════════════════════════════════════ */}
        {!isEmpty && !noResults && (
          <div className="space-y-5">
            {groupKeys.map((groupName, gi) => (
              <section key={groupName} className="settings-card-enter" style={{ animationDelay: `${0.1 + gi * 0.06}s` }}>

                {/* Group label */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span
                    className="text-[9px] tracking-[3px] uppercase flex-shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
                  >
                    {groupName}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.12), transparent)" }} />
                  <span
                    className="text-[8px] tracking-[1px] flex-shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
                  >
                    {groups[groupName].length}
                  </span>
                </div>

                {/* Glass card */}
                <div className="settings-section-card rounded-2xl overflow-hidden">
                  {/* Top glow line */}
                  <div
                    className="h-px w-full settings-top-line"
                    style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25), transparent)" }}
                  />
                  {groups[groupName].map((conv) => (
                    <ConvRow
                      key={conv.id}
                      conv={conv}
                      onDelete={handleDelete}
                      deleting={deletingIds.has(conv.id)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <p
              className="text-[8px] tracking-[3px] text-purple-500/20 text-center uppercase pt-2 pb-6"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              NEXCOR · TRANSMISSION LOG · 324B21
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tiny stat badge ── */
function StatBadge({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[9px] tracking-[2px] uppercase"
      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
    >
      <span
        className="text-[13px] font-black"
        style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.8)" }}
      >
        {value}
      </span>
      {label}
    </span>
  );
}
