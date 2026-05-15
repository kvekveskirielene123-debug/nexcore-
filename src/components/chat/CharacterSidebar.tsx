"use client";

import { useState } from "react";

interface CharacterSidebarProps {
  character: {
    id: string;
    name: string;
    subtitle: string | null;
    avatar_url: string;
    creator_username?: string | null;
    is_platform: boolean;
  };
  onNewChat: () => void;
  onOpenPastChats: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ThumbUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function CharacterSidebar({
  character,
  onNewChat,
  onOpenPastChats,
  isOpen,
  onClose,
}: CharacterSidebarProps) {
  const [starred, setStarred] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bgEnabled, setBgEnabled] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed right-0 top-0 bottom-0 z-40 w-[280px] flex flex-col
          bg-[#12141c] border-l overflow-y-auto
          transition-transform duration-300 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0 lg:flex-shrink-0
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Mobile header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b lg:hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="text-sm font-medium text-white">Character Info</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* ── Profile section ── */}
          <div className="flex flex-col items-center px-5 pt-8 pb-5 gap-3">
            {/* Large avatar */}
            <div
              className="w-[88px] h-[88px] rounded-full overflow-hidden flex-shrink-0"
              style={{ boxShadow: "0 0 0 3px rgba(124,58,237,0.3), 0 8px 24px rgba(0,0,0,0.5)" }}
            >
              {character.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                    {(character.name[0] ?? "?").toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="text-center">
              <h2 className="text-white font-semibold text-base leading-tight">{character.name}</h2>
              {character.creator_username && (
                <p className="text-slate-500 text-xs mt-0.5">by @{character.creator_username}</p>
              )}
              {!character.creator_username && character.is_platform && (
                <p className="text-purple-400/70 text-xs mt-0.5">by @Nexcor</p>
              )}
            </div>

            {/* Tags/subtitle */}
            {character.subtitle && (
              <p className="text-slate-400 text-xs text-center leading-relaxed px-1">
                {character.subtitle}
              </p>
            )}

            {/* Rating buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setStarred((s) => !s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  starred
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/8 hover:text-yellow-400 border border-transparent"
                }`}
              >
                <StarIcon filled={starred} />
                Star
              </button>
              <button
                onClick={() => setLiked((l) => !l)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  liked
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/8 hover:text-green-400 border border-transparent"
                }`}
              >
                <ThumbUpIcon filled={liked} />
                Like
              </button>
            </div>
          </div>

          <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* ── Settings rows ── */}
          <div className="px-5">
            <button className="w-full flex items-center justify-between py-3.5 text-slate-300 hover:text-white transition group">
              <span className="text-sm">Chat Settings</span>
              <span className="text-slate-600 group-hover:text-slate-400 transition">
                <ChevronRight />
              </span>
            </button>
            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <button className="w-full flex items-center justify-between py-3.5 text-slate-300 hover:text-white transition group">
              <span className="text-sm">Persona</span>
              <span className="text-slate-600 group-hover:text-slate-400 transition">
                <ChevronRight />
              </span>
            </button>
          </div>

          <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* ── Action buttons ── */}
          <div className="px-5 py-4 flex flex-col gap-2.5">
            <button
              onClick={onNewChat}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: "#7c3aed" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
            >
              Save and Start New Chat
            </button>
            <button
              onClick={onOpenPastChats}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              View Saved Chats
            </button>
          </div>

          <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* ── Background section ── */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-300">Background</span>
              <button
                onClick={() => setBgEnabled((v) => !v)}
                className="relative rounded-full transition-colors flex-shrink-0"
                style={{
                  width: 38,
                  height: 22,
                  background: bgEnabled ? "#7c3aed" : "rgba(255,255,255,0.1)",
                }}
                aria-label="Toggle background"
              >
                <div
                  className="absolute rounded-full bg-white shadow transition-transform"
                  style={{
                    width: 16,
                    height: 16,
                    top: 3,
                    left: bgEnabled ? 19 : 3,
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>
            <button
              className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-400 transition-colors"
              style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            >
              + Add Background
            </button>
          </div>

          <div className="pb-6" />
        </div>
      </aside>
    </>
  );
}
