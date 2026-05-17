"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ReportButton } from "@/components/ReportButton";
import { MODELS, type ModelKey, getModelCost } from "@/lib/ai/modelConfig";


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
  currentTitle,
  onRename,
  onToggleSidebar,
  sidebarOpen,
  onOpenBackground,
  onNewChat,
  onOpenPastChats,
  onBulkDelete,
  onRemoveSession,
  onOpenPersona,
  currentModel,
  onModelChange,
  isSubscriber = false,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen]               = useState(false);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [renaming, setRenaming]               = useState(false);
  const [titleValue, setTitleValue]           = useState(currentTitle);
  const [personality, setPersonality]         = useState(50);
  const [artStyle, setArtStyle]               = useState<"acg" | "realistic">("acg");
  const [confirmAction, setConfirmAction]     = useState<null | "bulk-delete" | "remove-session">(null);
  const [avatarHover, setAvatarHover]         = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) { setChatSettingsOpen(false); setConfirmAction(null); }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
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

  /* ── icon box helper ── */
  const IconBox = ({ children, red = false }: { children: React.ReactNode; red?: boolean }) => (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: red ? "rgba(239,68,68,0.08)" : "rgba(124,58,237,0.12)" }}
    >
      {children}
    </div>
  );

  /* ── row button helper ── */
  const MenuItem = ({
    onClick, children, red = false,
  }: { onClick: () => void; children: React.ReactNode; red?: boolean }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[48px]"
      style={{ color: red ? "rgba(248,113,113,0.85)" : "rgba(226,217,243,0.85)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = red ? "rgba(239,68,68,0.06)" : "rgba(124,58,237,0.08)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="mx-3 h-px my-0.5" style={{ background: "rgba(124,58,237,0.1)" }} />;

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-3 sm:px-4 gap-2 flex-shrink-0"
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
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-90"
        style={{ color: "rgba(167,139,250,0.7)", background: "rgba(124,58,237,0.08)" }}
        aria-label="Back"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>

      {/* Avatar — clickable */}
      <Link
        href={`/character/${character.id}`}
        className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden"
        style={{
          boxShadow: avatarHover
            ? "0 0 0 2px rgba(192,132,252,0.85), 0 0 18px rgba(124,58,237,0.5)"
            : "0 0 0 2px rgba(124,58,237,0.5), 0 0 10px rgba(124,58,237,0.2)",
          transform: avatarHover ? "scale(1.09)" : "scale(1)",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setAvatarHover(true)}
        onMouseLeave={() => setAvatarHover(false)}
        aria-label={`View ${character.name}'s profile`}
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
      </Link>

      {/* Name + AI badge — flex-1, name text truncates, no overflow-hidden so dropdown can escape */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
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
            className="text-sm bg-transparent border-b text-white focus:outline-none min-w-0 w-full max-w-[180px]"
            style={{ borderColor: "rgba(124,58,237,0.5)", fontFamily: "var(--font-display)" }}
            maxLength={80}
          />
        ) : (
          <Link
            href={`/character/${character.id}`}
            className="min-w-0 text-sm font-bold truncate leading-none transition-all"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)", cursor: "pointer" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c084fc";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "3px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(226,217,243,0.9)";
              e.currentTarget.style.textDecoration = "none";
            }}
            title={character.name}
          >
            {character.name}
          </Link>
        )}
        <span
          className="flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest"
          style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          AI
        </span>
      </div>

      {/* ── Three-dot menu — RIGHT next to character name ── */}
      <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90"
            style={{
              color:      menuOpen ? "#c084fc" : "rgba(148,163,184,0.7)",
              background: menuOpen ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.04)",
              border:     menuOpen ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5"  r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute top-full right-0 mt-2 z-50 overflow-hidden"
              style={{
                width: "min(290px, calc(100vw - 12px))",
                background: "rgba(10,5,28,0.98)",
                border: "1px solid rgba(124,58,237,0.22)",
                borderRadius: 16,
                boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(124,58,237,0.06)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                animation: "nx-dropdown-in 0.22s cubic-bezier(0.34,1.3,0.64,1) both",
              }}
            >
              <style>{`
                @keyframes nx-dropdown-in {
                  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
                  to   { opacity: 1; transform: translateY(0)    scale(1); }
                }
              `}</style>

              {/* top glow line */}
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.65),transparent)" }} />

              <div className="py-1.5 overflow-y-auto" style={{ maxHeight: "min(520px, 80dvh)" }}>

                {/* ── CHAT SETTINGS accordion ── */}
                <button
                  onClick={() => setChatSettingsOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all min-h-[48px]"
                  style={{ color: "rgba(226,217,243,0.85)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </IconBox>
                  <span className="flex-1 text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Chat Settings</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: "rgba(122,106,154,0.5)", transition: "transform 0.2s ease", transform: chatSettingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {chatSettingsOpen && (
                  <div className="px-4 pb-4 flex flex-col gap-3.5" style={{ borderTop: "1px solid rgba(124,58,237,0.08)", background: "rgba(124,58,237,0.025)" }}>

                    {/* Personality */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.7)", fontFamily: "var(--font-body)" }}>Personality</span>
                        <span className="text-[10px]" style={{ color: "#c084fc", fontFamily: "var(--font-mono)" }}>
                          {personality < 30 ? "Shy" : personality < 55 ? "Friendly" : personality < 80 ? "Playful" : "Flirty"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] flex-shrink-0" style={{ color: "rgba(122,106,154,0.45)" }}>Shy</span>
                        <div className="flex-1 relative h-5 flex items-center">
                          <input
                            type="range" min={0} max={100} value={personality}
                            onChange={(e) => setPersonality(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(90deg, rgba(192,132,252,0.7) ${personality}%, rgba(255,255,255,0.08) ${personality}%)`,
                              accentColor: "#c084fc",
                            }}
                          />
                        </div>
                        <span className="text-[9px] flex-shrink-0" style={{ color: "rgba(122,106,154,0.45)" }}>Flirty</span>
                      </div>
                    </div>

                    {/* Art Style */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.7)", fontFamily: "var(--font-body)" }}>Art Style</span>
                      <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.22)" }}>
                        {(["acg", "realistic"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setArtStyle(s)}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                            style={{
                              background: artStyle === s ? "rgba(124,58,237,0.28)" : "transparent",
                              color: artStyle === s ? "#c084fc" : "rgba(122,106,154,0.5)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {s === "acg" ? "ACG" : "Real"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Model */}
                    {currentModel && onModelChange && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.7)", fontFamily: "var(--font-body)" }}>AI Model</span>
                        <div className="flex flex-col gap-1">
                          {(Object.keys(MODELS) as ModelKey[]).map((key) => {
                            const m = MODELS[key];
                            const cost = getModelCost(key, isSubscriber);
                            const active = key === currentModel;
                            return (
                              <button
                                key={key}
                                onClick={() => onModelChange(key)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left"
                                style={{
                                  background: active ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.025)",
                                  border: `1px solid ${active ? "rgba(124,58,237,0.38)" : "rgba(255,255,255,0.06)"}`,
                                }}
                              >
                                <span className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ background: m.accentColor, boxShadow: active ? `0 0 6px ${m.accentColor}` : "none" }} />
                                <span className="flex-1 text-[11px] font-medium" style={{ color: "rgba(226,217,243,0.85)" }}>{m.label}</span>
                                <span className="text-[10px]" style={{ color: cost === 0 ? "#4ade80" : "rgba(122,106,154,0.6)" }}>
                                  {cost === 0 ? "FREE" : `${cost}⟡`}
                                </span>
                                {active && (
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Divider />

                {/* ── PERSONA ── */}
                <MenuItem onClick={() => { onOpenPersona?.(); setMenuOpen(false); }}>
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </IconBox>
                  <span className="flex-1 text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Persona</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "rgba(122,106,154,0.4)" }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </MenuItem>

                <Divider />

                {/* ── NEW CHAT ── */}
                <MenuItem onClick={() => { onNewChat?.(); setMenuOpen(false); }}>
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </IconBox>
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>New Chat</span>
                </MenuItem>

                {/* ── SAVED CHATS ── */}
                <MenuItem onClick={() => { onOpenPastChats?.(); setMenuOpen(false); }}>
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </IconBox>
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Saved Chats</span>
                </MenuItem>

                <Divider />

                {/* ── BACKGROUND ── */}
                {onOpenBackground && (
                  <MenuItem onClick={() => { onOpenBackground(); setMenuOpen(false); }}>
                    <IconBox>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </IconBox>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Background</span>
                  </MenuItem>
                )}

                {/* ── RENAME ── */}
                <MenuItem onClick={() => { setRenaming(true); setMenuOpen(false); }}>
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                  </IconBox>
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Rename Chat</span>
                </MenuItem>

                {/* ── SHARE ── */}
                <MenuItem onClick={handleShare}>
                  <IconBox>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </IconBox>
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Share Character</span>
                </MenuItem>

                <Divider />

                {/* ── REPORT ── */}
                <div
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] transition-all cursor-pointer"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  onClick={() => setMenuOpen(false)}
                >
                  <IconBox red>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                  </IconBox>
                  <ReportButton contentType="character" contentId={character.id} variant="row" />
                </div>

                {/* ── BULK DELETE ── */}
                {confirmAction === "bulk-delete" ? (
                  <div className="px-4 py-3 flex flex-col gap-2" style={{ background: "rgba(239,68,68,0.04)" }}>
                    <p className="text-xs text-center" style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-body)" }}>
                      Delete all messages? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Cancel
                      </button>
                      <button onClick={handleConfirm} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.32)" }}>
                        Delete All
                      </button>
                    </div>
                  </div>
                ) : (
                  <MenuItem onClick={() => setConfirmAction("bulk-delete")} red>
                    <IconBox red>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </IconBox>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Bulk Delete</span>
                  </MenuItem>
                )}

                {/* ── REMOVE SESSION ── */}
                {confirmAction === "remove-session" ? (
                  <div className="px-4 py-3 flex flex-col gap-2 mb-1" style={{ background: "rgba(239,68,68,0.04)" }}>
                    <p className="text-xs text-center" style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-body)" }}>
                      Remove this session? All messages will be lost.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Cancel
                      </button>
                      <button onClick={handleConfirm} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.32)" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <MenuItem onClick={() => setConfirmAction("remove-session")} red>
                    <IconBox red>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </IconBox>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Remove Session</span>
                  </MenuItem>
                )}

              </div>
            </div>
          )}
      </div>

      {/* Right: marks + sidebar toggle */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
        {/* Marks balance */}
        <Link
          href="/store"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
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

        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{
            color:      sidebarOpen ? "#c084fc" : "rgba(148,163,184,0.6)",
            background: sidebarOpen ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
            border:     sidebarOpen ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
