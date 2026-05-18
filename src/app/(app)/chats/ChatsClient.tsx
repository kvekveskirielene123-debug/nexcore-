"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";
import { MODELS, type ModelKey } from "@/lib/ai/modelConfig";
import type { ConversationRow } from "./page";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface DmConversation {
  id: string;
  partner_id: string;
  partner_username: string;
  partner_avatar_url: string | null;
  last_message_content: string | null;
  last_message_is_mine: boolean | null;
  last_message_at: string | null;
}

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
}

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
  if (diffDays < 7)   return `${diffDays}d`;
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

function Avatar({ src, name, active, size = 54 }: { src: string | null; name: string; active: boolean; size?: number }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(124,58,237,0.18)",
          border: active
            ? "2px solid rgba(0,229,255,0.7)"
            : "2px solid rgba(124,58,237,0.25)",
          boxShadow: active ? "0 0 14px rgba(0,229,255,0.25)" : "none",
          flexShrink: 0,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: size * 0.37, fontWeight: 900, fontFamily: "var(--font-display)", color: active ? "#00e5ff" : "#c084fc" }}>
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      {active && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#00e5ff",
            border: "2px solid #05020d",
            boxShadow: "0 0 7px rgba(0,229,255,0.9)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Pin icon ────────────────────────────────────────────────────────────── */

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

/* ─── AI Chat row ─────────────────────────────────────────────────────────── */

function ChatRow({
  conv,
  onDelete,
  onTogglePin,
  deleting,
  pinning,
  defaultModel,
}: {
  conv: ConversationRow;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, current: boolean) => void;
  deleting: boolean;
  pinning: boolean;
  defaultModel: string;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
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
      className="group relative flex items-center gap-3.5 px-4 py-3 transition-all duration-300"
      style={{
        background: confirmDelete
          ? "rgba(239,68,68,0.04)"
          : hovered ? "rgba(124,58,237,0.07)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transform: hovered && !confirmDelete ? "scale(1.01)" : "scale(1)",
        boxShadow: hovered && !confirmDelete ? "0 4px 20px rgba(124,58,237,0.08)" : "none",
        borderRadius: hovered ? 12 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-9 rounded-full"
          style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.9)" }}
        />
      )}

      <Link href={href} className="flex-shrink-0">
        <Avatar src={conv.character_avatar} name={conv.character_name} active={active} />
      </Link>

      <Link href={href} className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-bold leading-snug truncate" style={{ fontFamily: "var(--font-display)", color: active ? "#ffffff" : "rgba(226,217,243,0.9)" }}>
            {conv.character_name}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: active ? "rgba(0,229,255,0.7)" : "rgba(122,106,154,0.5)" }}>
            {formatTimestamp(conv.last_message_at)}
          </span>
        </div>
        <p className="text-[12px] leading-snug line-clamp-1" style={{ fontFamily: "var(--font-body)", color: active ? "rgba(226,217,243,0.5)" : "rgba(122,106,154,0.45)" }}>
          {preview}
        </p>
        {/* Model badge + subtitle */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {defaultModel in MODELS && (
            <span
              className="text-[8px] tracking-[1px] uppercase px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                background: `${MODELS[defaultModel as ModelKey].accentColor}18`,
                color: MODELS[defaultModel as ModelKey].accentColor,
                border: `1px solid ${MODELS[defaultModel as ModelKey].accentColor}35`,
              }}
            >
              {MODELS[defaultModel as ModelKey].label}
            </span>
          )}
          {conv.character_subtitle && (
            <span className="text-[9px] truncate" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.35)" }}>
              {conv.character_subtitle}
            </span>
          )}
        </div>
      </Link>

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
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-1">
          <button
            onClick={() => onTogglePin(conv.id, conv.is_pinned)}
            disabled={pinning}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
            style={{ color: conv.is_pinned ? "rgba(167,139,250,0.9)" : "rgba(122,106,154,0.4)" }}
            aria-label={conv.is_pinned ? "Unpin" : "Pin"}
          >
            <PinIcon filled={conv.is_pinned} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "rgba(122,106,154,0.4)" }}
            aria-label="Delete"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── DM conversation row ─────────────────────────────────────────────────── */

function DmRow({ dm, onClick }: { dm: DmConversation; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const active = isRecent(dm.last_message_at);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3 text-left transition-all duration-300"
      style={{
        background: hovered ? "rgba(124,58,237,0.07)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transform: hovered ? "scale(1.01)" : "scale(1)",
        boxShadow: hovered ? "0 4px 20px rgba(124,58,237,0.08)" : "none",
        borderRadius: hovered ? 12 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar src={dm.partner_avatar_url} name={dm.partner_username} active={active} />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-bold leading-snug truncate" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}>
            @{dm.partner_username}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: active ? "rgba(0,229,255,0.7)" : "rgba(122,106,154,0.5)" }}>
            {formatTimestamp(dm.last_message_at)}
          </span>
        </div>
        {dm.last_message_content && (
          <p className="text-[12px] leading-snug line-clamp-1" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.5)" }}>
            {dm.last_message_is_mine ? "You: " : ""}{dm.last_message_content}
          </p>
        )}
      </div>
    </button>
  );
}

/* ─── Column card wrapper ──────────────────────────────────────────────────── */

function ColumnCard({
  title,
  titleColor = "#00e5ff",
  accentColor = "rgba(0,229,255,0.2)",
  count,
  action,
  children,
}: {
  title: string;
  titleColor?: string;
  accentColor?: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.45)",
        minHeight: 400,
      }}
    >
      <div className="h-px flex-shrink-0" style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: titleColor, boxShadow: `0 0 6px ${titleColor}` }} />
          <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: titleColor }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-[9px] tracking-[1.5px] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {count}
            </span>
          )}
          {action}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState({ message, sub, actionLabel, actionHref }: {
  message: string;
  sub: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}>{message}</p>
        <p className="text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}>{sub}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="px-5 py-2.5 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all active:scale-95" style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.28)", color: "#00e5ff" }}>
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

/* ─── Sort type ───────────────────────────────────────────────────────────── */

type SortOrder = "newest" | "oldest";

/* ─── Main component ──────────────────────────────────────────────────────── */

export function ChatsClient({
  conversations: initial,
  userId,
  defaultModel,
}: {
  conversations: ConversationRow[];
  userId: string;
  defaultModel: string;
}) {
  const router = useRouter();

  // ── AI chat state ──
  const [conversations, setConversations] = useState(initial);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [pinningIds, setPinningIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [greetings, setGreetings] = useState(true);

  // ── DM state ──
  const [dmConversations, setDmConversations] = useState<DmConversation[]>([]);
  const [dmLoading, setDmLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [startingDm, setStartingDm] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [dmError, setDmError] = useState<string | null>(null);

  // Load DM conversations
  useEffect(() => {
    fetch("/api/dm")
      .then((r) => r.json() as Promise<{ conversations?: DmConversation[] }>)
      .then((d) => setDmConversations(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setDmLoading(false));
  }, []);

  // User search debounce
  useEffect(() => {
    if (!userSearch.trim()) { setUserResults([]); return; }
    const timer = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const res = await fetch(`/api/dm/users?q=${encodeURIComponent(userSearch)}`);
        const d = await res.json() as { users?: UserResult[] };
        setUserResults(d.users ?? []);
      } catch { setUserResults([]); }
      finally { setUserSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleStartDm = useCallback(async (partnerId: string) => {
    setStartingDm(partnerId);
    setDmError(null);
    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      const d = await res.json() as { conversationId?: string; error?: string };
      if (d.conversationId) {
        router.push(`/dm/${d.conversationId}`);
      } else {
        setDmError(d.error ?? "Could not open DM. Make sure the database tables are set up.");
      }
    } catch {
      setDmError("Network error — could not start DM.");
    } finally {
      setStartingDm(null);
    }
  }, [router]);

  // ── AI chat handlers ──
  const handleDelete = async (id: string) => {
    setDeletingIds((s) => new Set(s).add(id));
    const supabase = createClient();
    await supabase.from("conversations").delete().eq("id", id).eq("user_id", userId);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setDeletingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    setPinningIds((s) => new Set(s).add(id));
    setConversations((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, is_pinned: !currentlyPinned } : c))
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return tb - ta;
        })
    );
    await fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, pinned: !currentlyPinned }),
    });
    setPinningIds((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? conversations.filter(
          (c) =>
            c.character_name.toLowerCase().includes(q) ||
            (c.title?.toLowerCase().includes(q)) ||
            (c.last_message_preview?.toLowerCase().includes(q))
        )
      : [...conversations];

    return base.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });
  }, [conversations, search, sortOrder]);

  const pinned   = filtered.filter((c) => c.is_pinned);
  const unpinned = filtered.filter((c) => !c.is_pinned);
  const isEmpty   = conversations.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  const rowProps = (conv: ConversationRow) => ({
    conv,
    onDelete: handleDelete,
    onTogglePin: handleTogglePin,
    deleting: deletingIds.has(conv.id),
    pinning: pinningIds.has(conv.id),
    defaultModel,
  });

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-black tracking-[1px]" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}>
              Messages
            </h1>
            <p className="text-[10px] tracking-[2.5px] uppercase mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}>
              {conversations.length} AI · {dmConversations.length} DM
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}
              title="New AI chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Link>
            <DnaLogo size={30} interactive />
          </div>
        </div>

        {/* ── Controls row ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Greetings toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.55)" }}>
              Receive Greetings
            </span>
            <button
              onClick={() => setGreetings((v) => !v)}
              className="relative flex-shrink-0 transition-all duration-300 active:scale-95"
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: greetings ? "rgba(34,197,94,0.25)" : "rgba(122,106,154,0.15)",
                border: greetings ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(122,106,154,0.25)",
              }}
              aria-label="Toggle greetings"
            >
              <span
                className="absolute top-0.5 transition-all duration-300"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: greetings ? "#22c55e" : "rgba(122,106,154,0.5)",
                  boxShadow: greetings ? "0 0 8px rgba(34,197,94,0.6)" : "none",
                  left: greetings ? 20 : 2,
                }}
              />
            </button>
            <span className="text-[10px] tracking-[1px]" style={{ fontFamily: "var(--font-mono)", color: greetings ? "rgba(34,197,94,0.8)" : "rgba(122,106,154,0.4)" }}>
              {greetings ? "ON" : "OFF"}
            </span>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.4)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search AI chats…"
                className="pl-8 pr-7 py-2 rounded-xl text-[12px] outline-none transition-all w-36 sm:w-44"
                style={{ fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,217,243,0.85)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(122,106,154,0.5)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => setSortOrder((v) => v === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.18)", color: "rgba(0,229,255,0.7)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {sortOrder === "newest"
                  ? <><path d="M3 4h13M3 8h9M3 12h5"/><path d="m15 4 5 5-5 5"/></>
                  : <><path d="M3 4h13M3 8h9M3 12h5"/><path d="m20 4-5 5 5 5"/></>
                }
              </svg>
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* LEFT: Continue Chatting (AI) */}
          <ColumnCard
            title="Continue Chatting"
            titleColor="#00e5ff"
            accentColor="rgba(0,229,255,0.22)"
            count={conversations.length}
          >
            {isEmpty ? (
              <EmptyState
                message="No conversations yet"
                sub="Head to Explore, pick a character and start chatting."
                actionLabel="Browse Characters"
                actionHref="/explore"
              />
            ) : noResults ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                <p className="text-[13px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.7)" }}>
                  No matches for &ldquo;{search}&rdquo;
                </p>
                <button onClick={() => setSearch("")} className="text-[11px] transition" style={{ color: "rgba(167,139,250,0.7)" }}>
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {pinned.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                      <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.6)" }}>Pinned</span>
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(124,58,237,0.25), transparent)" }} />
                    </div>
                    {pinned.map((conv) => <ChatRow key={conv.id} {...rowProps(conv)} />)}
                  </>
                )}
                {unpinned.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                      <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.3)" }}>
                        {pinned.length > 0 ? "All Chats" : "Recent"}
                      </span>
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.15), transparent)" }} />
                    </div>
                    {unpinned.map((conv) => <ChatRow key={conv.id} {...rowProps(conv)} />)}
                  </>
                )}
                <p className="text-center text-[8px] tracking-[3px] uppercase py-3" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}>
                  NEXCOR · TRANSMISSION LOG
                </p>
              </div>
            )}
          </ColumnCard>

          {/* RIGHT: Chat with Real Users */}
          <ColumnCard
            title="Chat with Real Users"
            titleColor="#c084fc"
            accentColor="rgba(124,58,237,0.22)"
            count={dmConversations.length}
            action={
              <button
                onClick={() => setShowUserSearch((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", color: "rgba(192,132,252,0.8)" }}
                title="Find a user"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New DM
              </button>
            }
          >
            {/* User search */}
            {showUserSearch && (
              <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.4)" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by username…"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2 rounded-xl text-[12px] outline-none transition-all"
                    style={{ fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(192,132,252,0.25)", color: "rgba(226,217,243,0.85)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(192,132,252,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(192,132,252,0.25)")}
                  />
                </div>

                {userSearchLoading && (
                  <p className="text-[10px] text-center py-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}>Searching…</p>
                )}

                {!userSearchLoading && userSearch.trim() && userResults.length === 0 && (
                  <p className="text-[11px] text-center py-2" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.5)" }}>No users found</p>
                )}

                {userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartDm(u.id)}
                    disabled={startingDm === u.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-98 disabled:opacity-50 text-left w-full"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "rgba(124,58,237,0.18)",
                        border: "2px solid rgba(124,58,237,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar_url} alt={u.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "var(--font-display)", color: "#c084fc" }}>
                          {u.username.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}>
                        @{u.username}
                      </p>
                    </div>
                    <span className="text-[9px] tracking-[1.5px] uppercase flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: "rgba(192,132,252,0.7)" }}>
                      {startingDm === u.id ? "Opening…" : "Chat →"}
                    </span>
                  </button>
                ))}

                {dmError && (
                  <p className="text-[11px] px-1 py-1 rounded-lg text-center" style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.8)", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {dmError}
                  </p>
                )}

                <div className="h-px mt-1" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            )}

            {/* DM conversation list */}
            {dmLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>Loading…</p>
              </div>
            ) : dmConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.8)" }}>
                    No DMs yet
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.55)" }}>
                    Hit &ldquo;New DM&rdquo; to find a user and start chatting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                  <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(192,132,252,0.4)" }}>Recent</span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(124,58,237,0.2), transparent)" }} />
                </div>
                {dmConversations.map((dm) => (
                  <DmRow key={dm.id} dm={dm} onClick={() => router.push(`/dm/${dm.id}`)} />
                ))}
                <p className="text-center text-[8px] tracking-[3px] uppercase py-3" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}>
                  NEXCOR · DIRECT LINK
                </p>
              </div>
            )}
          </ColumnCard>

        </div>
      </div>
    </div>
  );
}
