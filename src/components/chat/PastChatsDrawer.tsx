"use client";

import { useEffect, useState, useRef } from "react";

interface Conversation {
  id: string;
  title: string;
  last_message_at: string | null;
  created_at: string;
}

interface PastChatsDrawerProps {
  characterId: string;
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function PastChatsDrawer({
  characterId,
  currentConversationId,
  onSelect,
  onClose,
  onDeleted,
}: PastChatsDrawerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  // Controls enter/exit CSS transition
  const [visible, setVisible] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  // Trigger enter transition one frame after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    fetch(`/api/chat/conversations?characterId=${characterId}`)
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations ?? []);
        setLoading(false);
      });
  }, [characterId]);

  const vibrate = (pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch {}
  };

  // Animate out then call onClose
  const animateClose = () => {
    const easing = "cubic-bezier(0.32,0.72,0,1)";
    if (sheetRef.current) {
      sheetRef.current.style.transition = `transform 0.3s ${easing}`;
      sheetRef.current.style.transform = "translateY(110%)";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "opacity 0.3s ease";
      backdropRef.current.style.opacity = "0";
    }
    setTimeout(onClose, 280);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    const res = await fetch(`/api/chat/conversations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setConversations((c) => c.filter((x) => x.id !== id));
      onDeleted(id);
    }
  };

  // ── Swipe gesture ──────────────────────────────────────────────
  const startDrag = (clientY: number) => {
    drag.current = { active: true, startY: clientY, lastY: clientY, startTime: Date.now(), thresholdHit: false };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
    if (backdropRef.current) backdropRef.current.style.transition = "none";
  };

  const moveDrag = (clientY: number) => {
    if (!drag.current.active) return;
    drag.current.lastY = clientY;
    const delta = clientY - drag.current.startY;
    const clamped = delta < 0 ? delta * 0.08 : delta;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${clamped}px)`;
    if (backdropRef.current && sheetRef.current) {
      const progress = Math.max(0, Math.min(1, clamped / (sheetRef.current.offsetHeight || 400)));
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
    if (sheetRef.current) sheetRef.current.style.transition = `transform 0.3s ${easing}`;
    if (backdropRef.current) backdropRef.current.style.transition = "opacity 0.3s ease";

    if (shouldClose) {
      vibrate(18);
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(110%)";
      if (backdropRef.current) backdropRef.current.style.opacity = "0";
      setTimeout(onClose, 280);
    } else {
      vibrate([6, 40, 6]);
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      setTimeout(() => {
        if (sheetRef.current) { sheetRef.current.style.transform = ""; sheetRef.current.style.transition = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity = ""; backdropRef.current.style.transition = ""; }
      }, 300);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={animateClose}
      />

      {/* Sheet — bottom sheet on mobile, right panel on sm+ */}
      <div
        ref={sheetRef}
        className={`
          fixed bottom-0 left-0 right-0 z-50
          sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-full sm:max-w-sm
          flex flex-col overflow-hidden
          rounded-t-2xl sm:rounded-none
          border-t sm:border-t-0 sm:border-l
          transition-transform duration-300 ease-out
          ${visible
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          }
        `}
        style={{
          background: "#12141c",
          borderColor: "rgba(255,255,255,0.07)",
          maxHeight: "85dvh",
        }}
      >
        {/* Drag handle */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
          onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
          onTouchEnd={endDrag}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0 sm:py-4 touch-none select-none sm:touch-auto sm:select-auto"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
          onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
          onTouchEnd={endDrag}
        >
          <h2 className="text-sm font-semibold text-white">Saved Chats</h2>
          <button
            onClick={animateClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4"
          style={{ WebkitOverflowScrolling: "touch", paddingBottom: "max(16px, env(safe-area-inset-bottom))" } as React.CSSProperties}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-10">No saved chats yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {conversations.map((c) => (
                <li
                  key={c.id}
                  className="relative rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                  style={{
                    background: c.id === currentConversationId ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                    border: c.id === currentConversationId
                      ? "1px solid rgba(124,58,237,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                  onClick={() => onSelect(c.id)}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 font-medium truncate">
                        {c.title || "Untitled chat"}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {formatDate(c.last_message_at ?? c.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      aria-label="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
