"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface DmMessage {
  id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  read_at: string | null;
}

interface UserInfo {
  id: string;
  username: string;
  avatar_url: string | null;
}

/* ─── Chat Prefs ──────────────────────────────────────────────────────────── */

type BgOption     = "default" | "grid" | "nebula" | "void" | "aurora" | "scanlines";
type BubbleOption = "default" | "glass" | "neon" | "solid" | "minimal" | "terminal";
type FrameOption  = "default" | "cyber" | "neon" | "double" | "diamond";

interface ChatPrefs { bg: BgOption; bubble: BubbleOption; frame: FrameOption; }
const DEFAULT_PREFS: ChatPrefs = { bg: "default", bubble: "default", frame: "default" };

function loadPrefs(id: string): ChatPrefs {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(`nx-dm:${id}`) : null;
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<ChatPrefs>) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}
function savePrefs(id: string, p: ChatPrefs) {
  try { localStorage.setItem(`nx-dm:${id}`, JSON.stringify(p)); } catch {}
}

function getBgStyle(bg: BgOption): React.CSSProperties {
  switch (bg) {
    case "grid":      return { backgroundImage: "linear-gradient(rgba(0,212,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.05) 1px,transparent 1px)", backgroundSize: "32px 32px" };
    case "nebula":    return { background: "radial-gradient(ellipse 90% 70% at 20% 30%,rgba(124,58,237,.1),transparent 65%),radial-gradient(ellipse 70% 60% at 78% 68%,rgba(0,229,255,.07),transparent 65%)" };
    case "void":      return { background: "#000000" };
    case "aurora":    return { background: "linear-gradient(160deg,rgba(0,229,255,.06) 0%,rgba(124,58,237,.09) 40%,rgba(244,114,182,.06) 80%,rgba(52,211,153,.05) 100%)" };
    case "scanlines": return { backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,229,255,.018) 3px,rgba(0,229,255,.018) 4px)" };
    default:          return {};
  }
}

function getBubbleStyle(isMine: boolean, style: BubbleOption): React.CSSProperties {
  const c  = isMine ? "0,229,255"   : "124,58,237";
  const ca = isMine ? "0,180,220"   : "100,40,200";
  const b  = isMine ? "rgba(0,229,255," : "rgba(124,58,237,";
  switch (style) {
    case "glass":    return { background: `rgba(${c},.05)`,  border: `1px solid rgba(${c},.28)`, backdropFilter: "blur(20px) saturate(1.4)", boxShadow: `0 4px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(${c},.12)` };
    case "neon":     return { background: `rgba(${c},.07)`,  border: `1.5px solid rgba(${c},.65)`, boxShadow: `0 0 18px rgba(${c},.22),inset 0 0 10px rgba(${c},.06)` };
    case "solid":    return { background: `rgba(${ca},.26)`, border: `1px solid rgba(${c},.35)`, boxShadow: `0 2px 10px rgba(0,0,0,.3)` };
    case "minimal":  return { background: `rgba(${c},.07)`,  border: "none" };
    case "terminal": return { background: "#001206", border: `1px solid rgba(0,255,128,.3)`, boxShadow: `0 0 12px rgba(0,255,128,.1)`, fontFamily: "var(--font-mono)" as string };
    default:         return { background: `${b}.1)`,         border: `1px solid ${b}.18)`, boxShadow: `0 2px 12px ${b}.05)` };
  }
}

function getFrameStyle(frame: FrameOption, size: number): React.CSSProperties {
  switch (frame) {
    case "cyber":   return { clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", border: "none", borderRadius: 0, background: "linear-gradient(135deg,rgba(0,229,255,.3),rgba(124,58,237,.25))" };
    case "neon":    return { border: `2.5px solid rgba(0,229,255,.85)`, boxShadow: "0 0 12px rgba(0,229,255,.6), 0 0 28px rgba(0,229,255,.2),inset 0 0 8px rgba(0,229,255,.08)", borderRadius: "50%" };
    case "double":  return { border: `2px solid rgba(0,229,255,.6)`, outline: `2px solid rgba(124,58,237,.4)`, outlineOffset: 3, borderRadius: "50%" };
    case "diamond": return { clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)", border: "none", borderRadius: 0, background: "linear-gradient(135deg,rgba(167,139,250,.3),rgba(0,229,255,.2))" };
    default:        return { border: "2px solid rgba(124,58,237,.35)", borderRadius: "50%" };
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMins  = Math.floor((now.getTime() - d.getTime()) / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)   return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Avatar ──────────────────────────────────────────────────────────────── */

function Avatar({ src, name, size = 38, frame = "default" }: { src: string | null; name: string; size?: number; frame?: FrameOption }) {
  const frameStyle = getFrameStyle(frame, size);
  return (
    <div
      style={{
        width: size, height: size,
        overflow: "hidden", flexShrink: 0,
        background: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(0,229,255,0.2))",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...frameStyle,
      }}
    >
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: size * 0.4, fontWeight: 900, fontFamily: "var(--font-display)", color: "#c084fc" }}>
            {(name?.[0] ?? "?").toUpperCase()}
          </span>
      }
    </div>
  );
}

/* ─── Lightbox ────────────────────────────────────────────────────────────── */

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="attachment" className="max-w-full max-h-full rounded-2xl object-contain" style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Pref picker row ─────────────────────────────────────────────────────── */

function PickerRow<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string; preview?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[9px] tracking-[2.5px] uppercase mb-2.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.4)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all"
              style={{
                background: active ? "rgba(0,229,255,.1)" : "rgba(255,255,255,.03)",
                border: active ? "1px solid rgba(0,229,255,.45)" : "1px solid rgba(255,255,255,.07)",
                boxShadow: active ? "0 0 14px rgba(0,229,255,.12)" : "none",
                minWidth: 52,
              }}
            >
              {opt.preview && <div style={{ width: 28, height: 20, borderRadius: 5, overflow: "hidden" }}>{opt.preview}</div>}
              <span className="text-[8px] tracking-[1px] text-center"
                style={{ fontFamily: "var(--font-mono)", color: active ? "#00e5ff" : "rgba(148,163,184,.5)", fontWeight: active ? 700 : 400 }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Settings panel ──────────────────────────────────────────────────────── */

function SettingsPanel({
  partner, conversationId, prefs, onPrefsChange, onClose, onClearChat,
}: {
  partner: UserInfo;
  conversationId: string;
  prefs: ChatPrefs;
  onPrefsChange: (p: ChatPrefs) => void;
  onClose: () => void;
  onClearChat: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [tab, setTab] = useState<"info" | "customize">("info");

  const handleClear = async () => {
    setClearing(true);
    try {
      await fetch(`/api/dm/${conversationId}/clear`, { method: "DELETE" });
      onClearChat();
      onClose();
    } catch { /* ignore */ }
    finally { setClearing(false); setConfirmClear(false); }
  };

  const set = <K extends keyof ChatPrefs>(key: K, val: ChatPrefs[K]) => {
    const next = { ...prefs, [key]: val };
    onPrefsChange(next);
    savePrefs(conversationId, next);
  };

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute top-0 right-0 bottom-0 z-30 flex flex-col overflow-hidden"
        style={{
          width: 300,
          background: "rgba(8,4,22,0.98)",
          borderLeft: "1px solid rgba(124,58,237,0.22)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.7)",
          animation: "nx-settings-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <style>{`
          @keyframes nx-settings-in { from { transform:translateX(100%); opacity:0 } to { transform:translateX(0); opacity:1 } }
        `}</style>

        {/* Top shimmer line */}
        <div className="h-px flex-shrink-0" style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,.5),rgba(167,139,250,.4),transparent)" }} />

        {/* Partner hero */}
        <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-4 flex-shrink-0" style={{ background: "linear-gradient(to bottom,rgba(124,58,237,.06),transparent)" }}>
          {/* Glow ring behind avatar */}
          <div className="relative flex items-center justify-center">
            <div className="absolute" style={{ width: 88, height: 88, borderRadius: "50%", background: "radial-gradient(rgba(0,229,255,.12),transparent 70%)" }} />
            <Avatar src={partner.avatar_url} name={partner.username} size={68} frame={prefs.frame} />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-black tracking-wide" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}>
              @{partner.username}
            </p>
            <p className="text-[9px] tracking-[2px] mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.5)" }}>
              ◈ DIRECT LINK · ACTIVE
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-shrink-0 mx-4 mb-0 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,.18)", background: "rgba(8,4,22,.9)" }}>
          {([
            { key: "info",      label: "PROFILE" },
            { key: "customize", label: "CUSTOMIZE" },
          ] as const).map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 py-2 text-[9px] tracking-[2px] uppercase font-bold transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: active ? "rgba(0,229,255,.1)" : "transparent",
                  color: active ? "#00e5ff" : "rgba(122,106,154,.5)",
                  borderBottom: active ? "1.5px solid rgba(0,229,255,.5)" : "1.5px solid transparent",
                }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

          {/* ── PROFILE TAB ── */}
          {tab === "info" && (
            <div className="flex flex-col gap-1 px-3 py-3">

              <Link href={`/profile/${partner.username}`} onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                style={{ color: "rgba(226,217,243,.75)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,.08)"; (e.currentTarget as HTMLElement).style.color = "#c084fc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,.75)"; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>View Profile</span>
                <svg className="ml-auto opacity-30" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </Link>

              <div style={{ height: 1, margin: "4px 12px", background: "rgba(255,255,255,.05)" }} />

              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left"
                  style={{ color: "rgba(226,217,243,.65)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,.85)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,.65)"; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                  <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>Clear Chat</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)" }}>
                  <p className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "rgba(239,68,68,.8)" }}>Delete all messages? Cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={handleClear} disabled={clearing}
                      className="flex-1 py-1.5 rounded-lg text-[10px] tracking-[1.5px] uppercase font-bold transition-all disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.4)", color: "rgba(239,68,68,.9)", fontFamily: "var(--font-mono)" }}>
                      {clearing ? "Clearing…" : "Yes, clear"}
                    </button>
                    <button onClick={() => setConfirmClear(false)}
                      className="flex-1 py-1.5 rounded-lg text-[10px] tracking-[1.5px] uppercase font-bold transition-all"
                      style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", color: "rgba(167,139,250,.8)", fontFamily: "var(--font-mono)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <Link href="/contact" onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{ color: "rgba(226,217,243,.65)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,.85)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,.65)"; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
                <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>Report User</span>
              </Link>
            </div>
          )}

          {/* ── CUSTOMIZE TAB ── */}
          {tab === "customize" && (
            <div className="flex flex-col">

              {/* ─ Background ─ */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <PickerRow<BgOption>
                  label="Chat Background"
                  value={prefs.bg}
                  onChange={(v) => set("bg", v)}
                  options={[
                    {
                      value: "default",
                      label: "Default",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(5,2,13,1)" }} />,
                    },
                    {
                      value: "grid",
                      label: "Grid",
                      preview: <div style={{ width: "100%", height: "100%", background: "#05020d", backgroundImage: "linear-gradient(rgba(0,212,255,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.25) 1px,transparent 1px)", backgroundSize: "8px 8px" }} />,
                    },
                    {
                      value: "nebula",
                      label: "Nebula",
                      preview: <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse 100% 100% at 20% 30%,rgba(124,58,237,.6),transparent 65%),radial-gradient(ellipse 80% 80% at 80% 70%,rgba(0,229,255,.45),transparent 60%),#05020d" }} />,
                    },
                    {
                      value: "void",
                      label: "Void",
                      preview: <div style={{ width: "100%", height: "100%", background: "#000" }} />,
                    },
                    {
                      value: "aurora",
                      label: "Aurora",
                      preview: <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,rgba(0,229,255,.5) 0%,rgba(124,58,237,.6) 40%,rgba(244,114,182,.5) 80%,rgba(52,211,153,.4) 100%)" }} />,
                    },
                    {
                      value: "scanlines",
                      label: "Scan",
                      preview: <div style={{ width: "100%", height: "100%", background: "#05020d", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,.3) 2px,rgba(0,229,255,.3) 3px)" }} />,
                    },
                  ]}
                />
              </div>

              {/* ─ Bubble Style ─ */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <PickerRow<BubbleOption>
                  label="Bubble Style"
                  value={prefs.bubble}
                  onChange={(v) => set("bubble", v)}
                  options={[
                    {
                      value: "default",
                      label: "Default",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(0,229,255,.1)", border: "1px solid rgba(0,229,255,.18)", borderRadius: 5 }} />,
                    },
                    {
                      value: "glass",
                      label: "Glass",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 5 }} />,
                    },
                    {
                      value: "neon",
                      label: "Neon",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(0,229,255,.05)", border: "1.5px solid rgba(0,229,255,.7)", borderRadius: 5, boxShadow: "0 0 8px rgba(0,229,255,.4)" }} />,
                    },
                    {
                      value: "solid",
                      label: "Solid",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(0,160,200,.3)", border: "1px solid rgba(0,229,255,.4)", borderRadius: 5 }} />,
                    },
                    {
                      value: "minimal",
                      label: "Minimal",
                      preview: <div style={{ width: "100%", height: "100%", background: "rgba(0,229,255,.06)", borderRadius: 5 }} />,
                    },
                    {
                      value: "terminal",
                      label: "Terminal",
                      preview: <div style={{ width: "100%", height: "100%", background: "#001206", border: "1px solid rgba(0,255,128,.4)", borderRadius: 5 }} />,
                    },
                  ]}
                />
              </div>

              {/* ─ Avatar Frame ─ */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <PickerRow<FrameOption>
                  label="Avatar Frame"
                  value={prefs.frame}
                  onChange={(v) => set("frame", v)}
                  options={[
                    {
                      value: "default",
                      label: "Default",
                      preview: (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(124,58,237,.6)", background: "rgba(124,58,237,.2)" }} />
                        </div>
                      ),
                    },
                    {
                      value: "cyber",
                      label: "Cyber",
                      preview: (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 16, height: 16, background: "linear-gradient(135deg,rgba(0,229,255,.5),rgba(124,58,237,.4))", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
                        </div>
                      ),
                    },
                    {
                      value: "neon",
                      label: "Neon",
                      preview: (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid rgba(0,229,255,.9)", boxShadow: "0 0 8px rgba(0,229,255,.7)", background: "rgba(0,229,255,.1)" }} />
                        </div>
                      ),
                    },
                    {
                      value: "double",
                      label: "Double",
                      preview: (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,229,255,.6)", outline: "1.5px solid rgba(124,58,237,.4)", outlineOffset: 2, background: "rgba(0,229,255,.08)" }} />
                        </div>
                      ),
                    },
                    {
                      value: "diamond",
                      label: "Diamond",
                      preview: (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 14, height: 14, background: "linear-gradient(135deg,rgba(167,139,250,.6),rgba(0,229,255,.4))", clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" }} />
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* Reset hint */}
              <button
                onClick={() => { const reset = DEFAULT_PREFS; onPrefsChange(reset); savePrefs(conversationId, reset); }}
                className="mx-4 my-3 py-2 rounded-xl text-[9px] tracking-[2px] uppercase transition-all"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.4)", border: "1px solid rgba(255,255,255,.05)", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,.6)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,.2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,.4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.05)"; }}
              >
                Reset to defaults
              </button>
            </div>
          )}
        </div>

        {/* Footer stamp */}
        <p className="text-center text-[8px] tracking-[2px] uppercase px-4 py-3 flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.18)", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          NEXCOR · DIRECT LINK · 324B21
        </p>
      </div>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export function DmClient({
  conversationId, currentUser, partner, initialMessages,
}: {
  conversationId: string;
  currentUser: UserInfo;
  partner: UserInfo;
  initialMessages: DmMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages]         = useState<DmMessage[]>(initialMessages);
  const [draft, setDraft]               = useState("");
  const [sending, setSending]           = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxSrc, setLightboxSrc]   = useState<string | null>(null);
  const [prefs, setPrefs]               = useState<ChatPrefs>(DEFAULT_PREFS);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load prefs from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs(conversationId));
  }, [conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "dm_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as DmMessage;
        if (msg.sender_id === currentUser.id) return;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUser.id]);

  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE_MB  = 5;

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      alert("Only JPEG, PNG, GIF, and WebP images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image must be under ${MAX_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImagePreview = () => { setImageFile(null); setImagePreview(null); };

  const MIME_TO_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const path = `${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("dm-attachments").upload(path, file, { contentType: file.type });
    if (error) return null;
    const { data } = supabase.storage.from("dm-attachments").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if ((!content && !imageFile) || sending) return;

    setUploadingImage(!!imageFile);
    setSending(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      setUploadingImage(false);
      removeImagePreview();
    }

    const tempId = `temp-${Date.now()}`;
    const optimistic: DmMessage = {
      id: tempId, sender_id: currentUser.id, content,
      image_url: imageUrl, created_at: new Date().toISOString(), read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch(`/api/dm/${conversationId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image_url: imageUrl }),
      });
      const json = await res.json() as { message?: DmMessage };
      if (json.message) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? json.message! : m));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setDraft(content);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(content);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, sending, imageFile, conversationId, currentUser.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by day
  const grouped: { dayLabel: string; messages: DmMessage[] }[] = [];
  for (const msg of messages) {
    const label = dayLabel(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.dayLabel === label) last.messages.push(msg);
    else grouped.push({ dayLabel: label, messages: [msg] });
  }

  const bgStyle = getBgStyle(prefs.bg);
  const isTerminal = prefs.bubble === "terminal";

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#05020d", zIndex: 100 }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 relative"
        style={{ background: "rgba(5,2,13,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(124,58,237,.35),rgba(0,229,255,.2),transparent)" }} />

        <button onClick={() => router.push("/chats")}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.18)", color: "#c084fc" }}
          aria-label="Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <Avatar src={partner.avatar_url} name={partner.username} size={38} frame={prefs.frame} />

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,.95)" }}>
            @{partner.username}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 5px rgba(0,229,255,.9)" }} />
            <p className="text-[10px] tracking-[1.5px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.5)" }}>Direct Message</p>
          </div>
        </div>

        <button onClick={() => setSettingsOpen((v) => !v)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{
            background: settingsOpen ? "rgba(124,58,237,.18)" : "rgba(124,58,237,.08)",
            border: settingsOpen ? "1px solid rgba(124,58,237,.4)" : "1px solid rgba(124,58,237,.15)",
            color: settingsOpen ? "#c084fc" : "rgba(148,163,184,.5)",
          }}
          aria-label="Chat settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93a10 10 0 0 0 14.14 14.14"/>
          </svg>
        </button>
      </div>

      {/* ── Settings panel overlay ── */}
      {settingsOpen && (
        <div className="absolute inset-0 z-20" style={{ top: 64 }}>
          <SettingsPanel
            partner={partner}
            conversationId={conversationId}
            prefs={prefs}
            onPrefsChange={setPrefs}
            onClose={() => setSettingsOpen(false)}
            onClearChat={() => setMessages([])}
          />
        </div>
      )}

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0 relative" style={bgStyle}>

        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", boxShadow: "0 0 32px rgba(124,58,237,.08)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,.6)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,.85)" }}>Start the conversation</p>
              <p className="text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,.55)" }}>Say hello to @{partner.username}</p>
            </div>
          </div>
        )}

        {grouped.map(({ dayLabel: label, messages: dayMsgs }) => (
          <div key={label}>
            {/* Day divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.05)" }} />
              <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.5)", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                {label}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.05)" }} />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMine     = msg.sender_id === currentUser.id;
              const prev       = dayMsgs[i - 1];
              const sameSender = prev?.sender_id === msg.sender_id;
              const isTemp     = msg.id.startsWith("temp-");
              const bubbleSt   = getBubbleStyle(isMine, prefs.bubble);

              return (
                <div key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  style={{ marginTop: sameSender ? 3 : 12 }}>

                  {/* Avatar */}
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {!sameSender && !isMine && <Avatar src={partner.avatar_url} name={partner.username} size={30} frame={prefs.frame} />}
                  </div>

                  <div className={`flex flex-col gap-0.5 max-w-[72%] sm:max-w-[60%] ${isMine ? "items-end" : "items-start"}`}>
                    {!sameSender && !isMine && (
                      <span className="text-[10px] ml-1 mb-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,.5)" }}>
                        @{partner.username}
                      </span>
                    )}

                    {/* Image attachment */}
                    {msg.image_url && (
                      <button onClick={() => setLightboxSrc(msg.image_url!)}
                        className="rounded-2xl overflow-hidden transition-all active:scale-95"
                        style={{
                          maxWidth: 260,
                          border: isMine ? "1px solid rgba(0,229,255,.22)" : "1px solid rgba(124,58,237,.22)",
                          boxShadow: isMine ? "0 4px 20px rgba(0,229,255,.08)" : "0 4px 20px rgba(124,58,237,.08)",
                          marginBottom: msg.content ? 4 : 0,
                        }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.image_url} alt="attachment" style={{ display: "block", maxWidth: "100%", maxHeight: 300, objectFit: "cover" }} />
                      </button>
                    )}

                    {/* Text bubble */}
                    {msg.content && (
                      <div
                        className="px-3.5 py-2.5 rounded-2xl leading-relaxed break-words"
                        style={{
                          ...bubbleSt,
                          color: isTerminal ? "rgba(0,255,128,.9)" : "rgba(226,217,243,.92)",
                          fontSize: 13,
                          fontFamily: isTerminal ? "var(--font-mono)" : "var(--font-body)",
                          borderBottomRightRadius: isMine ? 6 : 18,
                          borderBottomLeftRadius:  isMine ? 18 : 6,
                          opacity: isTemp ? 0.6 : 1,
                        }}
                      >
                        {msg.content}
                      </div>
                    )}

                    {/* Timestamp + read receipt */}
                    <div className={`flex items-center gap-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                      <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.35)" }}>
                        {isTemp ? "sending…" : formatTime(msg.created_at)}
                      </span>
                      {isMine && !isTemp && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={msg.read_at ? "#00e5ff" : "rgba(122,106,154,.35)"} strokeWidth="2.5" strokeLinecap="round">
                          {msg.read_at
                            ? <><polyline points="1 12 5 16 12 7"/><polyline points="8 12 12 16 20 7"/></>
                            : <polyline points="4 12 9 17 20 6"/>}
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ background: "rgba(5,2,13,.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(124,58,237,.1)" }}>

        {imagePreview && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="rounded-xl object-cover"
                style={{ width: 72, height: 72, border: "1px solid rgba(0,229,255,.25)" }} />
              <button onClick={removeImagePreview}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,.9)", border: "1.5px solid #05020d" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,.6)" }}>
              {uploadingImage ? "Uploading…" : "Image ready to send"}
            </p>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 self-end mb-0.5"
            style={{
              background: imagePreview ? "rgba(0,229,255,.12)" : "rgba(255,255,255,.04)",
              border: imagePreview ? "1px solid rgba(0,229,255,.3)" : "1px solid rgba(255,255,255,.08)",
              color: imagePreview ? "#00e5ff" : "rgba(122,106,154,.5)",
            }}
            aria-label="Attach image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>

          <textarea ref={textareaRef} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${partner.username}…`}
            rows={1} maxLength={2000}
            className="flex-1 bg-transparent outline-none resize-none text-[13px] leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,.88)", maxHeight: 120, overflowY: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          <button onClick={handleSend}
            disabled={(!draft.trim() && !imageFile) || sending || uploadingImage}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30 self-end"
            style={{
              background: (draft.trim() || imageFile) ? "rgba(0,229,255,.15)" : "rgba(255,255,255,.04)",
              border: (draft.trim() || imageFile) ? "1px solid rgba(0,229,255,.35)" : "1px solid rgba(255,255,255,.08)",
              color: (draft.trim() || imageFile) ? "#00e5ff" : "rgba(122,106,154,.4)",
            }}
            aria-label="Send">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[8px] tracking-[2px] uppercase mt-2"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,.18)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
