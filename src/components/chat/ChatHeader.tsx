"use client";

import Link from "next/link";
import { useState } from "react";

interface ChatHeaderProps {
  character: {
    id: string;
    name: string;
    avatar_url: string;
  };
  marksBalance: number;
  currentTitle: string;
  onRename: (newTitle: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function ChatHeader({
  character,
  marksBalance,
  currentTitle,
  onRename,
  onToggleSidebar,
  sidebarOpen,
}: ChatHeaderProps) {
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

      {/* Name + AI badge — title is click-to-rename */}
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
            <button
              onClick={() => { setTitleValue(currentTitle); setRenaming(true); }}
              className="text-sm font-semibold text-white truncate leading-none hover:text-slate-200 transition text-left"
              title="Click to rename"
            >
              {character.name}
            </button>
            <span
              className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
              style={{ background: "rgba(124,58,237,0.3)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              AI
            </span>
          </>
        )}
      </div>

      {/* Right: marks + sidebar toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/store"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-purple-300 hover:text-purple-200 transition"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          title="Your Marks balance"
        >
          ⟡ {marksBalance.toLocaleString()}
        </Link>

        {/* ⋮ toggles the sidebar */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition"
          style={{
            color: sidebarOpen ? "#c084fc" : "rgba(148,163,184,0.8)",
            background: sidebarOpen ? "rgba(124,58,237,0.15)" : "transparent",
            border: sidebarOpen ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
