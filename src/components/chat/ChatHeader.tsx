"use client";

import Link from "next/link";
import { useState } from "react";
import { ModelPicker } from "./ModelPicker";
import type { ModelKey } from "@/lib/ai/modelConfig";

interface ChatHeaderProps {
  character: {
    id: string;
    name: string;
    subtitle?: string | null;
    avatar_url: string;
    gender_pronouns: string;
  };
  currentModel: ModelKey;
  onModelChange: (m: ModelKey) => void;
  marksBalance: number;
  isSubscriber: boolean;
  onNewChat: () => void;
  onOpenPastChats: () => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  character,
  currentModel,
  onModelChange,
  marksBalance,
  isSubscriber,
  onNewChat,
  onOpenPastChats,
  currentTitle,
  onRename,
  onToggleSidebar,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleValue, setTitleValue] = useState(currentTitle);

  const handleRenameSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== currentTitle) onRename(trimmed);
    setRenaming(false);
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-4 gap-3"
      style={{ background: "#0d0f14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Back arrow */}
      <Link
        href={`/character/${character.id}`}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
        aria-label="Back to character"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>

      {/* Character avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden"
        style={{ boxShadow: "0 0 0 2px rgba(124,58,237,0.35)" }}
      >
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-purple-900/60 flex items-center justify-center">
            <span className="text-[10px] font-bold text-purple-300">{character.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Name + AI badge — or rename input */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {renaming ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleRenameSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSave();
              if (e.key === "Escape") { setTitleValue(currentTitle); setRenaming(false); }
            }}
            className="text-sm bg-transparent border-b border-purple-500/50 text-white focus:outline-none w-full max-w-[200px]"
            maxLength={80}
          />
        ) : (
          <>
            <span className="text-sm font-semibold text-white truncate leading-none">
              {character.name}
            </span>
            <span
              className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
              style={{ background: "rgba(124,58,237,0.3)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              AI
            </span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Marks balance */}
        <Link
          href="/store"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-purple-300 hover:text-purple-200 transition"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          title="Your Marks balance"
        >
          ⟡ {marksBalance.toLocaleString()}
        </Link>

        <ModelPicker
          value={currentModel}
          onChange={onModelChange}
          isSubscriber={isSubscriber}
          currentBalance={marksBalance}
        />

        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More options"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute top-full right-0 mt-1.5 z-50 w-48 rounded-xl overflow-hidden shadow-xl"
                style={{ background: "#1a1d28", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <button
                  onClick={() => { setMenuOpen(false); onNewChat(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  New Chat
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onOpenPastChats(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  Past Chats
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setRenaming(true); setTitleValue(currentTitle); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  Rename
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
      </div>
    </header>
  );
}
