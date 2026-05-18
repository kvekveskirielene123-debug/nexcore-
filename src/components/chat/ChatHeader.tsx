"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ReportButton } from "@/components/ReportButton";
import type { ModelKey } from "@/lib/ai/modelConfig";


interface ChatHeaderProps {
  character: {
    id: string;
    name: string;
    avatar_url: string;
  };
  marksBalance: number;
  currentTitle: string;
  onArchiveSession?: (title: string) => Promise<void>;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenBackground?: () => void;
  onNewChat?: () => void;
  onOpenPastChats?: () => void;
  onBulkDelete?: () => void;
  onOpenPersona?: () => void;
  currentModel?: ModelKey;
  onModelChange?: (model: ModelKey) => void;
  isSubscriber?: boolean;
}

export function ChatHeader({
  character,
  marksBalance,
  currentTitle,
  onArchiveSession,
  onToggleSidebar,
  sidebarOpen,
  onBulkDelete,
}: ChatHeaderProps) {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "bulk-delete" | "archive-session">(null);
  const [archiveTitle,  setArchiveTitle]  = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) setConfirmAction(null);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler as EventListener);
    document.addEventListener("touchstart", handler as EventListener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler as EventListener);
      document.removeEventListener("touchstart", handler as EventListener);
    };
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/character/${character.id}`;
    if (navigator.share) {
      navigator.share({ title: character.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setMenuOpen(false);
  };

  const handleConfirm = async () => {
    if (confirmAction === "bulk-delete") {
      onBulkDelete?.();
    }
    if (confirmAction === "archive-session") {
      const title = archiveTitle.trim() || currentTitle || `Chat with ${character.name}`;
      await onArchiveSession?.(title);
    }
    setConfirmAction(null);
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-3 sm:px-4 flex-shrink-0"
      style={{
        background:          "rgba(10,8,20,0.95)",
        backdropFilter:      "blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
        borderBottom:        "1px solid rgba(124,58,237,0.15)",
        boxShadow:           "0 1px 0 rgba(124,58,237,0.08), 0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Left: back */}
      <div className="flex-shrink-0">
        <Link
          href={`/character/${character.id}`}
          className="flex w-8 h-8 items-center justify-center rounded-xl transition-all active:scale-90"
          style={{ color: "rgba(167,139,250,0.7)", background: "rgba(124,58,237,0.08)" }}
          aria-label="Back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      </div>

      {/* Center: character pill + three-dots */}
      <div className="flex-1 flex justify-center min-w-0 px-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full min-w-0"
          style={{
            background: "rgba(124,58,237,0.08)",
            border:     "1px solid rgba(124,58,237,0.18)",
            maxWidth:   300,
          }}
        >
          {/* Avatar */}
          <Link
            href={`/character/${character.id}`}
            className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden"
            style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.5)" }}
          >
            {character.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b1d8a, #1d1535)" }}>
                <span className="text-[10px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                  {character.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </Link>

          {/* Name */}
          <Link
            href={`/character/${character.id}`}
            className="text-sm font-bold truncate leading-none transition-all"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.92)", maxWidth: 140 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#c084fc"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(226,217,243,0.92)"; }}
          >
            {character.name}
          </Link>

          {/* AI badge */}
          <span
            className="flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest"
            style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            AI
          </span>

          {/* Three-dots */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90"
              style={{
                color:      menuOpen ? "#c084fc" : "rgba(148,163,184,0.6)",
                background: menuOpen ? "rgba(124,58,237,0.18)" : "transparent",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5"  r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute top-full right-0 mt-2 z-50 overflow-hidden"
                style={{
                  width:              "min(260px, calc(100vw - 16px))",
                  background:         "rgba(10,5,28,0.98)",
                  border:             "1px solid rgba(124,58,237,0.22)",
                  borderRadius:       14,
                  boxShadow:          "0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(124,58,237,0.06)",
                  backdropFilter:     "blur(20px)",
                  WebkitBackdropFilter:"blur(20px)",
                  animation:          "nx-dd-in 0.22s cubic-bezier(0.34,1.3,0.64,1) both",
                }}
              >
                <style>{`
                  @keyframes nx-dd-in {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                  }
                `}</style>
                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.65),transparent)" }} />

                <div className="py-1.5">
                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[44px]"
                    style={{ color: "rgba(226,217,243,0.85)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.12)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Share This Character</span>
                  </button>

                  {/* Report — no onClick on wrapper; closing the menu unmounts ReportButton
                      before its portal state fires. The menu auto-closes via the mousedown
                      listener when the user clicks the modal backdrop. */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] transition-all cursor-pointer"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 pointer-events-none" style={{ background: "rgba(239,68,68,0.08)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                    </div>
                    <ReportButton contentType="character" contentId={character.id} variant="row" />
                  </div>

                  <div className="mx-3 h-px my-0.5" style={{ background: "rgba(124,58,237,0.1)" }} />

                  {/* Bulk Delete */}
                  {confirmAction === "bulk-delete" ? (
                    <div className="px-4 py-3 flex flex-col gap-2" style={{ background: "rgba(239,68,68,0.04)" }}>
                      <p className="text-xs text-center" style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-body)" }}>
                        Delete all messages? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmAction(null)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.32)" }}
                        >
                          Delete All
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmAction("bulk-delete")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[44px]"
                      style={{ color: "rgba(248,113,113,0.85)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Bulk Delete</span>
                    </button>
                  )}

                  {/* Archive Session */}
                  {confirmAction === "archive-session" ? (
                    <div className="px-4 py-3 flex flex-col gap-2.5 mb-1" style={{ background: "rgba(124,58,237,0.04)" }}>
                      <p className="text-xs" style={{ color: "rgba(196,181,253,0.8)", fontFamily: "var(--font-body)" }}>
                        Give this session a name so you can find it in Saved Chats:
                      </p>
                      <input
                        autoFocus
                        type="text"
                        value={archiveTitle}
                        onChange={(e) => setArchiveTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") setConfirmAction(null); }}
                        placeholder={currentTitle || `Chat with ${character.name}`}
                        className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(124,58,237,0.3)",
                          color: "rgba(226,217,243,0.9)",
                          fontFamily: "var(--font-body)",
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmAction(null)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: "rgba(124,58,237,0.25)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.4)" }}
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setArchiveTitle(currentTitle || ""); setConfirmAction("archive-session"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[44px]"
                      style={{ color: "rgba(196,181,253,0.85)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                          <polyline points="21 8 21 21 3 21 3 8"/>
                          <rect x="1" y="3" width="22" height="5"/>
                          <line x1="10" y1="12" x2="14" y2="12"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Archive Session</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: marks + collapse */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Marks balance */}
        <Link
          href="/store"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all active:scale-95"
          style={{
            background: "rgba(0,229,255,0.06)",
            border:     "1px solid rgba(0,229,255,0.15)",
          }}
          title="Your Marks"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(0,229,255,0.12)";
            el.style.borderColor = "rgba(0,229,255,0.4)";
            el.style.boxShadow = "0 0 12px rgba(0,229,255,0.15)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(0,229,255,0.06)";
            el.style.borderColor = "rgba(0,229,255,0.15)";
            el.style.boxShadow = "";
          }}
        >
          <span style={{ color: "rgba(0,229,255,0.6)", fontSize: 11 }}>⟡</span>
          <span
            className="text-[11px] font-black tabular-nums"
            style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.85)" }}
          >
            {marksBalance >= 10000 ? `${(marksBalance / 1000).toFixed(1)}k` : marksBalance.toLocaleString()}
          </span>
          <span style={{ color: "rgba(0,229,255,0.35)", fontSize: 10 }}>+</span>
        </Link>

        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90 select-none"
          style={{
            color:      sidebarOpen ? "#c084fc" : "rgba(148,163,184,0.55)",
            background: sidebarOpen ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
            border:     sidebarOpen ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {/* Outer frame */}
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            {/* Vertical divider — right panel */}
            <line x1="15" y1="3" x2="15" y2="21" />
            {/* Right panel fill when open */}
            {sidebarOpen && (
              <rect x="15" y="3" width="6" height="18" fill="currentColor" stroke="none" opacity="0.3" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
