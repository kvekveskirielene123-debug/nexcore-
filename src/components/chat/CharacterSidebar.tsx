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
  openPanel?: string | null;
}

type Panel = null | "chat-settings" | "persona";

// ── Chat Settings sub-panel ────────────────────────────────────────────────

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
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "rgba(148,163,184,0.6)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.6)")}
          aria-label="Back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}
        >
          Chat Settings
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
        >
          AI Model
        </p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${insufficient ? "opacity-40 cursor-not-allowed" : ""}`}
                style={{
                  background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${active ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: active ? "0 0 12px rgba(124,58,237,0.12)" : "none",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: m.accentColor, boxShadow: active ? `0 0 6px ${m.accentColor}` : "none" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold" style={{ color: "rgba(226,217,243,0.9)" }}>{m.label}</span>
                    <span className="text-[10px] flex-shrink-0">
                      {cost === 0 ? (
                        <span className="text-green-400 font-medium">FREE</span>
                      ) : (
                        <span style={{ color: insufficient ? "#f87171" : "rgba(122,106,154,0.7)" }}>
                          {cost}⟡
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(122,106,154,0.55)" }}>{m.description}</p>
                </div>
                {active && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
        <Link
          href="/settings"
          className="flex items-center justify-between py-1 text-sm transition"
          style={{ color: "rgba(148,163,184,0.6)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226,217,243,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.6)")}
        >
          <span>More Settings</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ── Persona sub-panel ──────────────────────────────────────────────────────

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
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "rgba(148,163,184,0.6)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.6)")}
          aria-label="Back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}
        >
          Persona
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            Active
          </p>
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
                  <span className="text-[11px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                    {(activePersona.name[0] ?? "?").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "rgba(226,217,243,0.9)" }}>{activePersona.name}</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(122,106,154,0.6)" }}>{activePersona.age} · {activePersona.gender_pronouns}</p>
              </div>
              <button
                onClick={() => select(null)}
                disabled={saving}
                className="flex-shrink-0 text-[10px] font-medium transition"
                style={{ color: "rgba(122,106,154,0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(122,106,154,0.5)")}
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
                style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "rgba(122,106,154,0.5)", fontSize: 14 }}>∅</span>
              </div>
              <p className="text-sm" style={{ color: "rgba(122,106,154,0.55)" }}>No persona set</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
          </div>
        ) : hasPersonas ? (
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              Your Personas
            </p>
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
                  className={`flex items-center gap-3 px-3 py-2.5 text-left transition ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                  style={{
                    background: activePersona?.id === p.id ? "rgba(124,58,237,0.1)" : "transparent",
                    borderBottom: i < personas!.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (activePersona?.id !== p.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = activePersona?.id === p.id ? "rgba(124,58,237,0.1)" : "transparent";
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
                      <span className="text-[11px] font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(148,163,184,0.6)" }}>
                        {(p.name[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "rgba(226,217,243,0.85)" }}>{p.name}</p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(122,106,154,0.55)" }}>{p.age} · {p.gender_pronouns}</p>
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
          <div
            className="flex flex-col items-center text-center px-3 py-6 rounded-xl gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(124,58,237,0.15)" }}
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
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(226,217,243,0.7)" }}>No personas yet</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(122,106,154,0.55)" }}>
                Personas let the AI know who you are — your name, personality, and backstory.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-4" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <Link
          href="/personas/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition"
          style={{
            background: hasPersonas ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.15)",
            border: hasPersonas ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(124,58,237,0.35)",
            color: hasPersonas ? "rgba(148,163,184,0.7)" : "#c084fc",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {hasPersonas ? "Create New Persona" : "Create Your First Persona"}
        </Link>
      </div>
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────────

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
  openPanel,
}: CharacterSidebarProps) {
  const [starred, setStarred] = useState(false);
  const [liked, setLiked] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    if (openPanel) setPanel(openPanel as Panel);
  }, [openPanel]);

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
      {/* Backdrop — mobile only, hidden on md+ */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/60 z-[60] md:hidden"
          onClick={handleClose}
        />
      )}

      {/*
        Mobile: fixed bottom sheet (translate-y transition)
        Desktop (md+): relative flex sibling (width transition pushes content)
      */}
      <aside
        ref={asideRef as React.RefObject<HTMLDivElement>}
        className={`
          fixed bottom-0 left-0 right-0 z-[70] max-h-[85dvh]
          md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:max-h-none md:h-full md:flex-shrink-0
          flex flex-col overflow-hidden
          border-t md:border-t-0 md:border-l
          rounded-t-2xl md:rounded-none
          ${isOpen
            ? "translate-y-0 md:translate-y-0 md:w-[280px]"
            : "translate-y-full md:translate-y-0 md:w-0"
          }
        `}
        style={{
          background: "rgba(10,8,20,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(124,58,237,0.12)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1), width 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Mobile drag handle */}
        <div
          className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
          onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
          onTouchEnd={endDrag}
        >
          <div className="w-9 h-1 rounded-full" style={{ background: "rgba(124,58,237,0.3)" }} />
        </div>

        {/* Desktop close button at top */}
        <div
          className="hidden md:flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            ◈ Character Info
          </span>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "rgba(122,106,154,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(122,106,154,0.5)")}
            aria-label="Close sidebar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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

        {/* ── Main content ── */}
        {!panel && (
          <div className="flex flex-col flex-1 overflow-y-auto min-w-0">
            {/* Character profile section — also drag zone on mobile */}
            <div
              className="flex flex-col items-center px-5 pt-5 pb-5 gap-3 touch-none select-none md:touch-auto md:select-auto"
              onTouchStart={(e) => startDrag(e.touches[0].clientY)}
              onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
              onTouchEnd={endDrag}
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  boxShadow: "0 0 0 2.5px rgba(124,58,237,0.4), 0 0 20px rgba(124,58,237,0.15), 0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                {character.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={character.avatar_url} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3b1d8a, #1d1535)" }}
                  >
                    <span className="text-3xl font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                      {(character.name[0] ?? "?").toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + creator */}
              <div className="text-center">
                <h2
                  className="font-black text-base leading-tight"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
                >
                  {character.name}
                </h2>
                {character.creator_username ? (
                  <p className="text-[10px] mt-1" style={{ color: "rgba(122,106,154,0.5)" }}>
                    by @{character.creator_username}
                  </p>
                ) : character.is_platform ? (
                  <p className="text-[10px] mt-1" style={{ color: "rgba(192,132,252,0.45)" }}>
                    by @Nexcor
                  </p>
                ) : null}
              </div>

              {character.subtitle && (
                <p
                  className="text-xs text-center leading-relaxed px-1"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.5)", fontStyle: "italic" }}
                >
                  {character.subtitle}
                </p>
              )}

              {/* Star / Like */}
              <div className="flex gap-2 mt-0.5">
                <button
                  onClick={() => setStarred((s) => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={
                    starred
                      ? { background: "rgba(234,179,8,0.12)", color: "#facc15", border: "1px solid rgba(234,179,8,0.25)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.07)" }
                  }
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Star
                </button>
                <button
                  onClick={() => setLiked((l) => !l)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={
                    liked
                      ? { background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.07)" }
                  }
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  Like
                </button>
              </div>
            </div>

            <div className="h-px mx-4" style={{ background: "rgba(124,58,237,0.1)" }} />

            {/* Action buttons */}
            <div className="px-4 py-3 flex flex-col gap-2">
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.5)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.35)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>
              <button
                onClick={onOpenPastChats}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  color: "rgba(148,163,184,0.7)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.color = "rgba(226,217,243,0.9)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(148,163,184,0.7)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Saved Chats
              </button>
            </div>

            <div className="h-px mx-4" style={{ background: "rgba(124,58,237,0.1)" }} />

            {/* Settings rows */}
            <div className="px-4 py-1">
              {/* Chat Settings row */}
              <button
                onClick={() => setPanel("chat-settings")}
                className="w-full flex items-center gap-3 py-3 transition-all group rounded-xl px-2 -mx-2"
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34L9 5.36A7.5 7.5 0 0 1 17.5 9.5H16l2.25 2.25L20.5 9.5h-1.43A9.96 9.96 0 0 0 12 2V4a8 8 0 0 1 7.07 0.93z" />
                    <path d="M4.93 19.07A10 10 0 0 0 17.01 20.66L15 18.64A7.5 7.5 0 0 1 6.5 14.5H8l-2.25-2.25L3.5 14.5h1.43A9.96 9.96 0 0 0 12 22v-2a8 8 0 0 1-7.07-0.93z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(226,217,243,0.8)" }}>Chat Settings</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: MODELS[currentModel].accentColor, boxShadow: `0 0 4px ${MODELS[currentModel].accentColor}` }}
                    />
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(122,106,154,0.5)" }}>{MODELS[currentModel].label}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(122,106,154,0.4)" }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div className="h-px my-0.5" style={{ background: "rgba(124,58,237,0.07)" }} />

              {/* Persona row */}
              <button
                onClick={() => setPanel("persona")}
                className="w-full flex items-center gap-3 py-3 transition-all group rounded-xl px-2 -mx-2"
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium" style={{ color: "rgba(226,217,243,0.8)" }}>Persona</div>
                  <p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: activePersona ? "#c084fc" : "rgba(122,106,154,0.5)" }}>
                    {activePersona ? activePersona.name : "None set"}
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(122,106,154,0.4)" }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }} />
          </div>
        )}
      </aside>
    </>
  );
}
