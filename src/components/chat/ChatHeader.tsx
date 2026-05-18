"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ReportButton } from "@/components/ReportButton";
import type { ModelKey } from "@/lib/ai/modelConfig";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
];

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
  onNewChat?: () => void;
  onOpenPastChats?: () => void;
  onBulkDelete?: () => void;
  onRemoveSession?: () => void;
  onOpenPersona?: () => void;
  currentModel?: ModelKey;
  onModelChange?: (model: ModelKey) => void;
  isSubscriber?: boolean;
}

export function ChatHeader({
  character,
  marksBalance,
  onToggleSidebar,
  sidebarOpen,
  onBulkDelete,
  onRemoveSession,
}: ChatHeaderProps) {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [langOpen,       setLangOpen]       = useState(false);
  const [selectedLang,   setSelectedLang]   = useState("English");
  const [confirmAction,  setConfirmAction]  = useState<null | "bulk-delete" | "remove-session">(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) setConfirmAction(null);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
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

  const handleConfirm = () => {
    if (confirmAction === "bulk-delete")    onBulkDelete?.();
    if (confirmAction === "remove-session") onRemoveSession?.();
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

                  {/* Remove Session */}
                  {confirmAction === "remove-session" ? (
                    <div className="px-4 py-3 flex flex-col gap-2 mb-1" style={{ background: "rgba(239,68,68,0.04)" }}>
                      <p className="text-xs text-center" style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-body)" }}>
                        Remove this session? All messages will be lost.
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
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmAction("remove-session")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[44px]"
                      style={{ color: "rgba(248,113,113,0.85)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Remove Session</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: language + energy + collapse */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Language dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 text-[11px] font-semibold"
            style={{
              background:  langOpen ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
              border:      `1px solid ${langOpen ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.08)"}`,
              color:       "rgba(148,163,184,0.7)",
              fontFamily:  "var(--font-mono)",
            }}
          >
            <span style={{ fontSize: 12 }}>🌐</span>
            <span className="hidden sm:inline" style={{ fontSize: 10 }}>{selectedLang.slice(0, 3).toUpperCase()}</span>
            <svg
              width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transition: "transform 0.2s ease", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {langOpen && (
            <div
              className="absolute top-full right-0 mt-1.5 z-50 rounded-xl overflow-hidden"
              style={{
                width:              160,
                background:         "rgba(10,5,28,0.98)",
                border:             "1px solid rgba(124,58,237,0.22)",
                boxShadow:          "0 16px 40px rgba(0,0,0,0.8)",
                backdropFilter:     "blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                animation:          "nx-dd-in 0.18s ease both",
              }}
            >
              <div className="py-1 max-h-60 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang.label); setLangOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] transition-all"
                    style={{
                      background: selectedLang === lang.label ? "rgba(124,58,237,0.1)" : "transparent",
                      color:      selectedLang === lang.label ? "#c084fc" : "rgba(148,163,184,0.7)",
                      fontFamily: "var(--font-mono)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLang !== lang.label) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLang !== lang.label) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {selectedLang === lang.label ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="w-[10px] flex-shrink-0" />
                    )}
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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

        {/* Sidebar collapse >> / << */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90 text-[11px] font-black select-none"
          style={{
            color:      sidebarOpen ? "#c084fc" : "rgba(148,163,184,0.6)",
            background: sidebarOpen ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
            border:     sidebarOpen ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.06)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "-1.5px",
          }}
        >
          {sidebarOpen ? ">>" : "<<"}
        </button>
      </div>
    </header>
  );
}
