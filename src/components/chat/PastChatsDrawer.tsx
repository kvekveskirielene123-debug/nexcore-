"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch(`/api/chat/conversations?characterId=${characterId}`)
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations ?? []);
        setLoading(false);
      });
  }, [characterId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    const res = await fetch(`/api/chat/conversations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setConversations((c) => c.filter((x) => x.id !== id));
      onDeleted(id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col overflow-hidden"
        style={{ background: "#12141c", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-sm font-semibold text-white">Saved Chats</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-xs text-slate-500 italic text-center py-10">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-10">No saved chats yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {conversations.map((c) => (
                <li
                  key={c.id}
                  className="relative rounded-xl px-4 py-3 cursor-pointer transition-all"
                  style={{
                    background: c.id === currentConversationId ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                    border: c.id === currentConversationId
                      ? "1px solid rgba(124,58,237,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                  onClick={() => onSelect(c.id)}
                >
                  <div className="flex items-start justify-between gap-2">
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
                      className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-60 hover:opacity-100 transition-all p-0.5"
                      aria-label="Delete"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
