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
    <div className="sticky top-0 z-20 bg-[#05020d]/95 backdrop-blur-md border-b border-purple-700/15 px-4 md:px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Back + character */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href={`/character/${character.id}`}
            className="flex-shrink-0 text-[#7a6a9a] hover:text-cyan-400 transition-colors"
            aria-label="Back to character profile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-700/30 flex-shrink-0 bg-[#150035] flex items-center justify-center">
            {character.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-[#00e5ff] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {character.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") {
                    setTitleValue(currentTitle);
                    setRenaming(false);
                  }
                }}
                className="text-[13px] bg-transparent border-b border-cyan-400/40 text-white focus:outline-none w-full"
                style={{ fontFamily: "var(--font-body)" }}
                maxLength={80}
              />
            ) : (
              <div
                className="text-[13px] md:text-sm font-medium text-white tracking-wide truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {character.name}
              </div>
            )}
            <div
              className="text-[8px] tracking-[1.5px] text-[#7a6a9a] truncate uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {character.gender_pronouns}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Marks balance */}
          <Link
            href="/store"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#08041a] border border-purple-700/25 text-[10px] tracking-[1.5px] text-cyan-400 hover:border-cyan-400/40 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
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

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More options"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-purple-700/25 hover:border-cyan-400/40 text-[#a78bfa] hover:text-cyan-400 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 z-50 w-48 rounded-xl border border-purple-700/30 bg-[#0c0520]/95 backdrop-blur-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); onNewChat(); }}
                    className="w-full text-left px-4 py-3 text-[11px] tracking-[2px] text-[#c0b8d8] hover:bg-cyan-400/5 hover:text-cyan-400 transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    + NEW CHAT
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onOpenPastChats(); }}
                    className="w-full text-left px-4 py-3 text-[11px] tracking-[2px] text-[#c0b8d8] hover:bg-cyan-400/5 hover:text-cyan-400 transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    PAST CHATS
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setRenaming(true); }}
                    className="w-full text-left px-4 py-3 text-[11px] tracking-[2px] text-[#c0b8d8] hover:bg-cyan-400/5 hover:text-cyan-400 transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    RENAME
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
