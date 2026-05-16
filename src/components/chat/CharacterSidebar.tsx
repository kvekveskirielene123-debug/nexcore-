"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MODELS, type ModelKey, getModelCost } from "@/lib/ai/modelConfig";
import type { Persona } from "@/lib/personas/types";

interface CharacterSidebarProps {
  character: {
    id: string;
    name: string;
    subtitle: string | null;
    avatar_url: string;
    creator_username?: string | null;
    is_platform: boolean;
  };
  conversationId: string | null;
  activePersona: Persona | null;
  onPersonaChange: (persona: Persona | null) => void;
  currentModel: ModelKey;
  onModelChange: (model: ModelKey) => void;
  isSubscriber: boolean;
  marksBalance: number;
  onNewChat: () => void;
  onOpenPastChats: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type Panel = null | "chat-settings" | "persona";

// ── Sub-panel: Chat Settings ───────────────────────────────────────────────

function ChatSettingsPanel({
  currentModel,
  onModelChange,
  isSubscriber,
  marksBalance,
  onBack,
}: {
  currentModel: ModelKey;
  onModelChange: (m: ModelKey) => void;
  isSubscriber: boolean;
  marksBalance: number;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      {/* Panel header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition flex-shrink-0"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">Chat Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Model selection */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Model</p>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(MODELS) as ModelKey[]).map((key) => {
              const m = MODELS[key];
              const cost = getModelCost(key, isSubscriber);
              const insufficient = cost > marksBalance;
              const active = key === currentModel;

              return (
                <button
                  key={key}
                  onClick={() => onModelChange(key)}
                  disabled={insufficient}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    active ? "ring-1 ring-purple-500/50" : "hover:bg-white/[0.04]"
                  } ${insufficient ? "opacity-40 cursor-not-allowed" : ""}`}
                  style={{
                    background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                    border: "1px solid " + (active ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"),
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: m.accentColor, boxShadow: active ? `0 0 6px ${m.accentColor}` : "none" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200">{m.label}</span>
                      <span className="text-[10px] flex-shrink-0">
                        {cost === 0 ? (
                          <span className="text-green-400 font-medium">FREE</span>
                        ) : (
                          <span className={insufficient ? "text-red-400" : "text-slate-400"}>
                            {cost}⟡
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{m.description}</p>
                  </div>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* More settings link */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <Link
          href="/settings"
          className="flex items-center justify-between py-1.5 text-sm text-slate-400 hover:text-white transition"
        >
          <span>More Settings</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ── Sub-panel: Persona ─────────────────────────────────────────────────────

function PersonaPanel({
  conversationId,
  activePersona,
  onPersonaChange,
  onBack,
}: {
  conversationId: string | null;
  activePersona: Persona | null;
  onPersonaChange: (persona: Persona | null) => void;
  onBack: () => void;
}) {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (personas !== null) return;
    setLoading(true);
    fetch("/api/personas")
      .then((r) => r.json())
      .then((d) => setPersonas(d.personas ?? []))
      .catch(() => setPersonas([]))
      .finally(() => setLoading(false));
  }, [personas]);

  const select = async (p: Persona | null) => {
    if (saving || !conversationId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/persona`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_id: p?.id ?? null }),
      });
      if (res.ok) onPersonaChange(p);
    } finally {
      setSaving(false);
    }
  };

  const hasPersonas = personas !== null && personas.length > 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Panel header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition flex-shrink-0"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">Persona</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* ── Currently active ── */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Active</p>
          {activePersona ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "#1e1d28", border: "1.5px solid rgba(124,58,237,0.4)" }}
              >
                {activePersona.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activePersona.avatar_url} alt={activePersona.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-purple-300">
                    {(activePersona.name[0] ?? "?").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{activePersona.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{activePersona.age} · {activePersona.gender_pronouns}</p>
              </div>
              <button
                onClick={() => select(null)}
                disabled={saving}
                className="flex-shrink-0 text-slate-500 hover:text-red-400 transition text-[10px] font-medium"
                title="Clear persona"
              >
                Clear
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                <span className="text-slate-500 text-sm">∅</span>
              </div>
              <p className="text-sm text-slate-500 flex-1">No persona set</p>
            </div>
          )}
        </div>

        {/* ── Choose from existing ── */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
          </div>
        ) : hasPersonas ? (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Choose from your personas
            </p>
            {/* Scrollable list capped at ~3 rows */}
            <div
              className="flex flex-col overflow-y-auto rounded-xl"
              style={{
                maxHeight: "min(220px, 30dvh)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {personas!.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => select(p)}
                  disabled={saving}
                  className={`flex items-center gap-3 px-3 py-2.5 text-left transition ${
                    activePersona?.id === p.id ? "bg-purple-700/10" : "hover:bg-white/[0.04]"
                  } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                  style={{
                    borderBottom: i < personas!.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: "#1e1d28",
                      border: activePersona?.id === p.id
                        ? "1.5px solid rgba(124,58,237,0.5)"
                        : "1.5px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">
                        {(p.name[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{p.age} · {p.gender_pronouns}</p>
                  </div>
                  {activePersona?.id === p.id && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div
            className="flex flex-col items-center text-center px-2 py-6 rounded-xl gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">No personas yet</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Personas let the AI know who you are — your name, personality, and backstory.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer: create button ── */}
      <div className="flex-shrink-0 px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link
          href="/personas/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition"
          style={{
            background: hasPersonas ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.15)",
            border: hasPersonas ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(124,58,237,0.35)",
            color: hasPersonas ? "#94a3b8" : "#c084fc",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {hasPersonas ? "Create New Persona" : "Create Your First Persona"}
        </Link>
      </div>
    </div>
  );
}

function PersonaRow({
  label,
  subtitle,
  avatarUrl,
  active,
  saving,
  onClick,
}: {
  label: string;
  subtitle: string;
  avatarUrl?: string | null;
  active: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`w-full flex items-center gap-3 px-4 py-3 transition text-left border-b ${
        active ? "bg-purple-700/10" : "hover:bg-white/[0.04]"
      } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{
          background: "#1e1d28",
          border: active ? "1.5px solid rgba(124,58,237,0.5)" : "1.5px solid rgba(255,255,255,0.08)",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[11px] font-bold text-slate-400">
            {label === "No Persona" ? "∅" : (label[0] ?? "?").toUpperCase()}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-200 font-medium truncate">{label}</div>
        <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>
      </div>

      {/* Active checkmark */}
      {active && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────────

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

export function CharacterSidebar({
  character,
  conversationId,
  activePersona,
  onPersonaChange,
  currentModel,
  onModelChange,
  isSubscriber,
  marksBalance,
  onNewChat,
  onOpenPastChats,
  isOpen,
  onClose,
}: CharacterSidebarProps) {
  const [starred, setStarred] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bgEnabled, setBgEnabled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const asideRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  const vibrate = (pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch {}
  };

  const handleClose = () => {
    setPanel(null);
    onClose();
  };

  const startDrag = (clientY: number) => {
    drag.current = { active: true, startY: clientY, lastY: clientY, startTime: Date.now(), thresholdHit: false };
    if (asideRef.current) asideRef.current.style.transition = "none";
    if (backdropRef.current) backdropRef.current.style.transition = "none";
  };

  const moveDrag = (clientY: number) => {
    if (!drag.current.active) return;
    drag.current.lastY = clientY;
    const delta = clientY - drag.current.startY;
    const clamped = delta < 0 ? delta * 0.08 : delta;
    if (asideRef.current) asideRef.current.style.transform = `translateY(${clamped}px)`;
    if (backdropRef.current && asideRef.current) {
      const progress = Math.max(0, Math.min(1, clamped / (asideRef.current.offsetHeight || 400)));
      backdropRef.current.style.opacity = String(1 - progress * 0.9);
    }
    // Haptic tick when crossing (and uncrossing) the close threshold
    if (delta > 100 && !drag.current.thresholdHit) {
      drag.current.thresholdHit = true;
      vibrate(12);
    } else if (delta <= 100 && drag.current.thresholdHit) {
      drag.current.thresholdHit = false;
      vibrate(6);
    }
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const delta = drag.current.lastY - drag.current.startY;
    const velocity = delta / Math.max(1, Date.now() - drag.current.startTime);
    const shouldClose = delta > 120 || (delta > 40 && velocity > 0.4);

    const easing = "cubic-bezier(0.32,0.72,0,1)";
    if (asideRef.current) asideRef.current.style.transition = `transform 0.3s ${easing}`;
    if (backdropRef.current) backdropRef.current.style.transition = "opacity 0.3s ease";

    if (shouldClose) {
      vibrate(18);
      if (asideRef.current) asideRef.current.style.transform = "translateY(110%)";
      if (backdropRef.current) backdropRef.current.style.opacity = "0";
      setTimeout(() => {
        if (asideRef.current) { asideRef.current.style.transform = ""; asideRef.current.style.transition = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity = ""; backdropRef.current.style.transition = ""; }
        handleClose();
      }, 280);
    } else {
      vibrate([6, 40, 6]);
      if (asideRef.current) asideRef.current.style.transform = "translateY(0)";
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      setTimeout(() => {
        if (asideRef.current) { asideRef.current.style.transform = ""; asideRef.current.style.transition = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity = ""; backdropRef.current.style.transition = ""; }
      }, 300);
    }
  };

  return (
    <>
      {/* Backdrop — always shown when sidebar is open */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={handleClose}
        />
      )}

      <aside
        ref={asideRef as React.RefObject<HTMLDivElement>}
        className={`
          fixed bottom-0 left-0 right-0 z-[70]
          sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[280px]
          flex flex-col bg-[#12141c] overflow-hidden
          border-t sm:border-t-0 sm:border-l
          rounded-t-2xl sm:rounded-none
          transition-transform duration-300 ease-in-out
          ${isOpen
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          }
        `}
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          maxHeight: "85dvh",
        }}
      >
        {/* Mobile drag handle — swipe down to close */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
          onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
          onTouchEnd={endDrag}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* ── Chat Settings sub-panel ── */}
        {panel === "chat-settings" && (
          <ChatSettingsPanel
            currentModel={currentModel}
            onModelChange={(m) => { onModelChange(m); setPanel(null); }}
            isSubscriber={isSubscriber}
            marksBalance={marksBalance}
            onBack={() => setPanel(null)}
          />
        )}

        {/* ── Persona sub-panel ── */}
        {panel === "persona" && (
          <PersonaPanel
            conversationId={conversationId}
            activePersona={activePersona}
            onPersonaChange={(p) => { onPersonaChange(p); setPanel(null); }}
            onBack={() => setPanel(null)}
          />
        )}

        {/* ── Main sidebar content ── */}
        {!panel && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Profile — also a drag zone on mobile */}
            <div
              className="flex flex-col items-center px-5 pt-6 pb-5 gap-3 sm:pt-8 touch-none select-none sm:touch-auto sm:select-auto"
              onTouchStart={(e) => startDrag(e.touches[0].clientY)}
              onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
              onTouchEnd={endDrag}
            >
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

              <div className="text-center">
                <h2 className="text-white font-semibold text-base leading-tight">{character.name}</h2>
                {character.creator_username && (
                  <p className="text-slate-500 text-xs mt-0.5">by @{character.creator_username}</p>
                )}
                {!character.creator_username && character.is_platform && (
                  <p className="text-purple-400/70 text-xs mt-0.5">by @Nexcor</p>
                )}
              </div>

              {character.subtitle && (
                <p className="text-slate-400 text-xs text-center leading-relaxed px-1">{character.subtitle}</p>
              )}

              {/* Rating buttons */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setStarred((s) => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    starred
                      ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/5 text-slate-400 hover:text-yellow-400 border border-transparent"
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
                      : "bg-white/5 text-slate-400 hover:text-green-400 border border-transparent"
                  }`}
                >
                  <ThumbUpIcon filled={liked} />
                  Like
                </button>
              </div>
            </div>

            <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Settings rows */}
            <div className="px-5">
              <button
                onClick={() => setPanel("chat-settings")}
                className="w-full flex items-center justify-between py-3.5 text-slate-300 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">Chat Settings</span>
                  {/* Active model indicator */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: MODELS[currentModel].accentColor }}
                  />
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 group-hover:text-slate-400 transition">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              <button
                onClick={() => setPanel("persona")}
                className="w-full flex items-center justify-between py-3.5 text-slate-300 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">Persona</span>
                  {activePersona && (
                    <span className="text-[10px] text-purple-400 font-medium truncate max-w-[90px]">
                      {activePersona.name}
                    </span>
                  )}
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 group-hover:text-slate-400 transition">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Action buttons */}
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

            {/* Background section */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-300">Background</span>
                <button
                  onClick={() => setBgEnabled((v) => !v)}
                  className="relative rounded-full transition-colors flex-shrink-0"
                  style={{ width: 38, height: 22, background: bgEnabled ? "#7c3aed" : "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="absolute rounded-full bg-white shadow"
                    style={{ width: 16, height: 16, top: 3, left: bgEnabled ? 19 : 3, transition: "left 0.2s ease" }}
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

            <div style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }} />
          </div>
        )}
      </aside>
    </>
  );
}
