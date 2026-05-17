"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ReportButton } from "@/components/ReportButton";

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
  onOpenBackground?: () => void;
}

export function ChatHeader({
  character,
  marksBalance,
  currentTitle,
  onRename,
  onToggleSidebar,
  sidebarOpen,
  onOpenBackground,
}: ChatHeaderProps) {
  const [renaming, setRenaming] = useState(false);
  const [titleValue, setTitleValue] = useState(currentTitle);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler as EventListener);
    document.addEventListener("touchstart", handler as EventListener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler as EventListener);
      document.removeEventListener("touchstart", handler as EventListener);
    };
  }, [menuOpen]);

  const handleRenameSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== currentTitle) onRename(trimmed);
    setRenaming(false);
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-3 sm:px-4 gap-2.5 flex-shrink-0"
      style={{
        background: "rgba(10,8,20,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(124,58,237,0.15)",
        boxShadow: "0 1px 0 rgba(124,58,237,0.08), 0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Back */}
      <Link
        href={`/character/${character.id}`}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90"
        style={{ color: "rgba(167,139,250,0.7)", background: "rgba(124,58,237,0.08)" }}
        aria-label="Back"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>

      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden"
        style={{ boxShadow: "0 0 0 2px rgba(124,58,237,0.5), 0 0 10px rgba(124,58,237,0.2)" }}
      >
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b1d8a, #1d1535)" }}>
            <span className="text-[11px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
              {character.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
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
            className="text-sm bg-transparent border-b text-white focus:outline-none w-full max-w-[200px]"
            style={{ borderColor: "rgba(124,58,237,0.5)", fontFamily: "var(--font-display)" }}
            maxLength={80}
          />
        ) : (
          <button
            onClick={() => { setTitleValue(currentTitle); setRenaming(true); }}
            className="text-sm font-bold truncate leading-none text-left transition-colors hover:text-purple-300"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}
            title="Click to rename"
          >
            {character.name}
          </button>
        )}
        <span
          className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest"
          style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          AI
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Marks balance */}
        <Link
          href="/store"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "#c084fc",
            fontFamily: "var(--font-mono)",
          }}
          title="Your Marks"
        >
          <span style={{ color: "#00e5ff" }}>⟡</span>
          {marksBalance.toLocaleString()}
        </Link>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90"
            style={{
              color: menuOpen ? "#c084fc" : "rgba(148,163,184,0.7)",
              background: menuOpen ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.04)",
              border: menuOpen ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: menuOpen ? "0 0 12px rgba(124,58,237,0.2)" : "none",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute top-full right-0 mt-1.5 w-52 rounded-xl overflow-hidden z-50"
              style={{
                background: "rgba(12,5,32,0.97)",
                border: "1px solid rgba(124,58,237,0.2)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.06)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Top accent */}
              <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />

              {/* Character Info (sidebar toggle) */}
              <button
                onClick={() => { onToggleSidebar(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all active:bg-purple-900/20"
                style={{ color: "rgba(226,217,243,0.8)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
                </svg>
                <span style={{ fontFamily: "var(--font-body)" }}>
                  {sidebarOpen ? "Hide Character Info" : "Character Info"}
                </span>
              </button>

              <div className="mx-3 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />

              {/* Rename conversation */}
              <button
                onClick={() => { setRenaming(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all active:bg-purple-900/20"
                style={{ color: "rgba(226,217,243,0.8)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span style={{ fontFamily: "var(--font-body)" }}>Rename Chat</span>
              </button>

              <div className="mx-3 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />

              {/* Set Background */}
              {onOpenBackground && (
                <button
                  onClick={() => { onOpenBackground(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all active:bg-purple-900/20"
                  style={{ color: "rgba(226,217,243,0.8)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-body)" }}>Set Background</span>
                </button>
              )}

              <div className="mx-3 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />

              {/* Report Character */}
              <div
                className="flex items-center gap-3 px-4 py-3 transition-all cursor-pointer"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                <ReportButton
                  contentType="character"
                  contentId={character.id}
                  variant="row"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
