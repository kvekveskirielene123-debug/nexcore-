"use client";

import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";
import type { ConversationRow } from "./page";

/* ── Time helpers ─────────────────────────────────────────── */

function groupLabel(iso: string | null): string {
  if (!iso) return "Earlier";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) return "This Week";
  if (diffDays <= 30) return "This Month";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

/* ── Avatar ───────────────────────────────────────────────── */

function ConvAvatar({ src, name }: { src: string | null; name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className="relative flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(9,4,26,0.9)",
        border: "1px solid rgba(0,229,255,0.15)",
        boxShadow: "0 0 12px rgba(0,0,0,0.4)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-[11px] font-black"
            style={{ fontFamily: "var(--font-display)", color: "#00e5ff" }}
          >
            {initials}
          </span>
        </div>
      )}
      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none animate-card-scan"
        style={{ height: "1.5px", background: "rgba(0,229,255,0.45)", width: "100%" }}
      />
    </div>
  );
}

/* ── Conversation row ─────────────────────────────────────── */

function ConvRow({ conv }: { conv: ConversationRow }) {
  const href = `/chat/${conv.character_id}?conv=${conv.id}`;
  const displayTitle = conv.title ?? conv.character_name;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition-all duration-200 active:scale-[0.99] group"
      style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}
    >
      <ConvAvatar src={conv.character_avatar} name={conv.character_name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-[13px] font-semibold truncate text-white/90 group-hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {conv.character_name}
          </span>
          <span
            className="text-[9px] tracking-[1px] flex-shrink-0"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
          >
            {relativeTime(conv.last_message_at)}
          </span>
        </div>
        <p
          className="text-[11px] truncate"
          style={{
            fontFamily: "var(--font-body)",
            color: displayTitle === conv.character_name
              ? "rgba(122,106,154,0.5)"
              : "rgba(180,160,220,0.65)",
          }}
        >
          {displayTitle === conv.character_name
            ? (conv.character_subtitle ?? "Tap to continue chat")
            : displayTitle}
        </p>
      </div>

      {/* Chevron */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="rgba(0,229,255,0.3)" strokeWidth="2" strokeLinecap="round"
        className="flex-shrink-0 transition-all duration-200 group-hover:stroke-[rgba(0,229,255,0.7)] group-hover:translate-x-0.5"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

/* ── Main client ──────────────────────────────────────────── */

export function ChatsClient({ conversations }: { conversations: ConversationRow[] }) {
  /* Group by time bucket */
  const groups: Record<string, ConversationRow[]> = {};
  for (const conv of conversations) {
    const label = groupLabel(conv.last_message_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  const isEmpty = conversations.length === 0;

  return (
    <div className="min-h-screen bg-[#05020d] pb-4">

      {/* ── Page header ── */}
      <div className="pt-6 pb-5 px-4 md:px-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-8 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5))" }}
          />
          <span
            className="text-[9px] tracking-[4px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            ◈ TRANSMISSION LOG · 324B21
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-[32px] md:text-[40px] font-black tracking-[5px] text-white uppercase"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 40px rgba(0,229,255,0.15)",
              }}
            >
              CHATS
            </h1>
            <p
              className="text-sm text-[#7a6a9a] italic mt-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {isEmpty
                ? "No transmissions yet."
                : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-[2px] uppercase transition-all duration-200 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.07)",
              border: "1px solid rgba(0,229,255,0.2)",
              color: "rgba(0,229,255,0.8)",
              boxShadow: "0 0 16px rgba(0,229,255,0.06)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </Link>
        </div>
      </div>

      {/* ── Empty state ── */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(9,4,26,0.8)",
              border: "1px solid rgba(0,229,255,0.12)",
              boxShadow: "0 0 32px rgba(0,0,0,0.4)",
            }}
          >
            <DnaLogo size={36} />
          </div>
          <div>
            <p
              className="text-[15px] font-bold text-white/80 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No transmissions yet
            </p>
            <p
              className="text-[12px] text-[#7a6a9a] leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Head to Explore to find a character and start your first conversation.
            </p>
          </div>
          <Link
            href="/explore"
            className="px-6 py-3 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all duration-200 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
              boxShadow: "0 0 20px rgba(0,229,255,0.1)",
            }}
          >
            Browse Characters →
          </Link>
        </div>
      )}

      {/* ── Grouped conversation list ── */}
      {!isEmpty && (
        <div className="px-4 md:px-8 space-y-6">
          {GROUP_ORDER.filter((g) => groups[g]?.length).map((groupName) => (
            <section key={groupName}>
              {/* Group label */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <span
                  className="text-[9px] tracking-[3px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                >
                  {groupName}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgba(124,58,237,0.15)" }}
                />
              </div>

              {/* Cards */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(9,4,26,0.75)",
                  border: "1px solid rgba(124,58,237,0.12)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top glow line */}
                <div
                  className="h-px w-full"
                  style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.18), transparent)" }}
                />
                {groups[groupName].map((conv) => (
                  <ConvRow key={conv.id} conv={conv} />
                ))}
              </div>
            </section>
          ))}

          <p
            className="text-[8px] tracking-[3px] text-purple-500/20 text-center uppercase pt-2 pb-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR · TRANSMISSION LOG · 324B21
          </p>
        </div>
      )}
    </div>
  );
}
