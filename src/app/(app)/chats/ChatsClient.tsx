"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";
import type { ConversationRow } from "./page";

/* ─── Timestamp helper ─────────────────────────────────────────────────────── */

function formatTimestamp(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)   return `${diffDays} days`;
  if (diffDays < 31)  return `${Math.floor(diffDays / 7)}w`;
  if (diffDays < 365) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${m}/${d}`;
  }
  return date.getFullYear().toString();
}

function isRecent(iso: string | null): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 3 * 60 * 60 * 1000;
}

/* ─── Avatar ──────────────────────────────────────────────────────────────── */

function Avatar({ src, name, active }: { src: string | null; name: string; active: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="w-[54px] h-[54px] rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: "rgba(124,58,237,0.18)",
          border: active
            ? "2px solid rgba(0,229,255,0.7)"
            : "2px solid rgba(124,58,237,0.25)",
          boxShadow: active ? "0 0 12px rgba(0,229,255,0.2)" : "none",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span
            className="text-[20px] font-black"
            style={{ fontFamily: "var(--font-display)", color: active ? "#00e5ff" : "#c084fc" }}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      {active && (
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
          style={{
            background: "#00e5ff",
            borderColor: "#05020d",
            boxShadow: "0 0 6px rgba(0,229,255,0.9)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Chat row ────────────────────────────────────────────────────────────── */

function ChatRow({
  conv,
  onDelete,
  deleting,
}: {
  conv: ConversationRow;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const active = isRecent(conv.last_message_at);
  const href = `/chat/${conv.character_id}?conv=${conv.id}`;

  const preview = useMemo(() => {
    if (!conv.last_message_preview) return conv.character_subtitle ?? "Start a conversation";
    const prefix = conv.last_message_role === "user" ? "You: " : "";
    return prefix + conv.last_message_preview.replace(/\n+/g, " ").trim();
  }, [conv]);

  if (deleting) {
    return (
      <div className="flex items-center justify-center px-5 py-4 opacity-40">
        <span className="text-[10px] tracking-[2px] text-[#7a6a9a] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Deleting…
        </span>
      </div>
    );
  }

  return (
    <div
      className="group relative flex items-center gap-3.5 px-4 py-3 transition-colors duration-150"
      style={{
        background: confirmDelete ? "rgba(239,68,68,0.04)" : undefined,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) => { if (!confirmDelete) (e.currentTarget as HTMLDivElement).style.background = "rgba(124,58,237,0.05)"; }}
      onMouseLeave={(e) => { if (!confirmDelete) (e.currentTarget as HTMLDivElement).style.background = ""; }}
    >
      {/* Active accent bar */}
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-9 rounded-full"
          style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.9)" }}
        />
      )}

      {/* Avatar */}
      <Link href={href} className="flex-shrink-0" onClick={() => { if (confirmDelete) return; }}>
        <Avatar src={conv.character_avatar} name={conv.character_name} active={active} />
      </Link>

      {/* Content */}
      <Link
        href={href}
        className="flex-1 min-w-0 flex flex-col gap-0.5"
        onClick={() => { if (confirmDelete) return; }}
      >
        {/* Top row: name + timestamp */}
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[14px] font-bold leading-snug truncate"
            style={{
              fontFamily: "var(--font-display)",
              color: active ? "#ffffff" : "rgba(226,217,243,0.9)",
            }}
          >
            {conv.character_name}
          </span>
          <span
            className="text-[10px] flex-shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: active ? "rgba(0,229,255,0.7)" : "rgba(122,106,154,0.5)",
            }}
          >
            {formatTimestamp(conv.last_message_at)}
          </span>
        </div>

        {/* Preview text */}
        <p
          className="text-[12px] leading-snug line-clamp-2"
          style={{
            fontFamily: "var(--font-body)",
            color: active ? "rgba(226,217,243,0.5)" : "rgba(122,106,154,0.45)",
          }}
        >
          {preview}
        </p>
      </Link>

      {/* Delete controls */}
      {confirmDelete ? (
        <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
          <button
            onClick={() => { onDelete(conv.id); setConfirmDelete(false); }}
            className="px-2.5 py-1 rounded-lg text-[9px] tracking-[1.5px] uppercase font-bold transition-all active:scale-95"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "rgba(239,68,68,0.9)", fontFamily: "var(--font-mono)" }}
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2.5 py-1 rounded-lg text-[9px] tracking-[1.5px] uppercase font-bold transition-all active:scale-95"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.7)", fontFamily: "var(--font-mono)" }}
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pl-1"
          style={{ color: "rgba(122,106,154,0.4)" }}
          aria-label="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Groups empty state ──────────────────────────────────────────────────── */

function GroupsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-300 mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Groups Coming Soon
        </p>
        <p className="text-[12px] text-slate-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Group chats with multiple AI characters are on the roadmap.
        </p>
      </div>
      <span
        className="text-[9px] tracking-[2.5px] uppercase px-3 py-1 rounded-full"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.6)", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        In Development
      </span>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

type TabKey = "chats" | "groups";

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
  const [tab, setTab] = useState<TabKey>("chats");

  const handleDelete = async (id: string) => {
    setDeletingIds((s) => new Set(s).add(id));
    const supabase = createClient();
    await supabase.from("conversations").delete().eq("id", id).eq("user_id", userId);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setDeletingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.character_name.toLowerCase().includes(q) ||
        (c.title?.toLowerCase().includes(q)) ||
        (c.last_message_preview?.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const isEmpty = conversations.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  return (
    <div className="min-h-screen" style={{ background: "#05020d" }}>

      {/* ── Dot-grid background ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-8 pb-3">
          <div>
            <h1
              className="text-[22px] font-black tracking-[1px]"
              style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
            >
              Messages
            </h1>
            <p
              className="text-[10px] tracking-[2.5px] uppercase mt-0.5"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
            >
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}
              title="New chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Link>
            <DnaLogo size={30} interactive />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex px-5 gap-0 mb-4 mt-1">
          {(["chats", "groups"] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-5 py-2.5 text-[11px] tracking-[2px] uppercase font-bold transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color: tab === t ? "#00e5ff" : "rgba(122,106,154,0.45)",
                borderBottom: tab === t ? "2px solid #00e5ff" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
          <div className="flex-1 border-b-2" style={{ borderColor: "rgba(255,255,255,0.05)" }} />
        </div>

        {tab === "groups" ? (
          <GroupsEmptyState />
        ) : (
          <>
            {/* ── Search ── */}
            <div className="px-5 mb-3">
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(122,106,154,0.4)" strokeWidth="2" strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(226,217,243,0.85)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(122,106,154,0.5)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* ── List container ── */}
            <div
              className="mx-4 mb-6 rounded-2xl overflow-hidden flex-1"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.4)",
              }}
            >
              {/* Top accent line */}
              <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25), rgba(124,58,237,0.2), transparent)" }} />

              {/* Empty / no results */}
              {isEmpty && (
                <div className="flex flex-col items-center text-center gap-5 py-14 px-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-300 mb-1" style={{ fontFamily: "var(--font-display)" }}>No conversations yet</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      Head to Explore, pick a character and start chatting.
                    </p>
                  </div>
                  <Link
                    href="/explore"
                    className="px-5 py-2.5 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all active:scale-95"
                    style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.28)", color: "#00e5ff" }}
                  >
                    Browse Characters →
                  </Link>
                </div>
              )}

              {noResults && (
                <div className="flex flex-col items-center text-center gap-3 py-12 px-6">
                  <p className="text-[13px] font-semibold text-slate-400" style={{ fontFamily: "var(--font-display)" }}>
                    No matches for "{search}"
                  </p>
                  <button onClick={() => setSearch("")} className="text-[11px] text-purple-400 hover:text-purple-300 transition">
                    Clear search
                  </button>
                </div>
              )}

              {/* Conversation rows */}
              {!isEmpty && !noResults && filtered.map((conv) => (
                <ChatRow
                  key={conv.id}
                  conv={conv}
                  onDelete={handleDelete}
                  deleting={deletingIds.has(conv.id)}
                />
              ))}
            </div>

            {/* Footer tag */}
            {!isEmpty && (
              <p
                className="text-center text-[8px] tracking-[3px] uppercase pb-6"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}
              >
                NEXCOR · TRANSMISSION LOG · 324B21
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
