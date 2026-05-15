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
    <header className="sticky top-0 z-20" style={{ background: "rgba(5,2,13,0.97)", backdropFilter: "blur(20px)" }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.35), rgba(124,58,237,0.35), transparent)" }} />
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.2), transparent)" }} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Left: back arrow + avatar + identity */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/character/${character.id}`}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-purple-700/25 hover:border-cyan-400/40 text-[#7a6a9a] hover:text-cyan-400 transition-all"
              aria-label="Back to character profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            {/* Avatar with status dot */}
            <div className="relative flex-shrink-0">
              <div
                className="w-11 h-11 rounded-full overflow-hidden"
                style={{
                  border: "1.5px solid rgba(124,58,237,0.5)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.2)",
                  background: "#0d0824",
                }}
              >
                {character.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#00e5ff] font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                      {character.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Online / status dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#05020d]"
                style={{ animation: "chatStatusPulse 2.8s ease-in-out infinite" }}
              />
            </div>

            {/* Name + status */}
            <div className="min-w-0 flex-1">
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
                  className="text-[13px] bg-transparent border-b border-cyan-400/40 text-white focus:outline-none w-full"
                  style={{ fontFamily: "var(--font-body)" }}
                  maxLength={80}
                />
              ) : (
                <div
                  className="text-[14px] font-bold text-white tracking-wide truncate leading-tight"
                  style={{ fontFamily: "var(--font-display)", textShadow: "0 0 12px rgba(0,229,255,0.15)" }}
                >
                  {character.name}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0"
                  style={{ boxShadow: "0 0 4px rgba(0,229,255,0.9)" }}
                />
                <span
                  className="text-[8px] tracking-[2px] text-cyan-400/55 uppercase truncate"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  TRANSMISSION ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Marks balance */}
            <Link
              href="/store"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] tracking-[1.5px] text-cyan-400 hover:border-cyan-400/40 transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(0,229,255,0.04)",
                borderColor: "rgba(0,229,255,0.18)",
              }}
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
                className="w-9 h-9 flex items-center justify-center rounded-full border border-purple-700/25 hover:border-cyan-400/40 text-[#a78bfa] hover:text-cyan-400 transition-all"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 w-52 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.3)", background: "rgba(10,4,24,0.97)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                    {/* Top accent */}
                    <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.4), transparent)" }} />
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
                      RENAME SESSION
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
