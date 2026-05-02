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
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0c0520] border-l border-purple-700/25 overflow-y-auto">
        <div className="sticky top-0 bg-[#0c0520]/95 backdrop-blur-md p-4 border-b border-purple-700/20 flex items-center justify-between">
          <h2
            className="text-[12px] tracking-[3px] text-white uppercase"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            ◈ Past Transmissions
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a6a9a] hover:text-cyan-400 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <p
              className="text-xs text-[#7a6a9a] italic text-center py-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Loading archives...
            </p>
          ) : conversations.length === 0 ? (
            <p
              className="text-xs text-[#7a6a9a] italic text-center py-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No past conversations yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {conversations.map((c) => (
                <li
                  key={c.id}
                  className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
                    c.id === currentConversationId
                      ? "border-cyan-400/40 bg-cyan-400/5"
                      : "border-purple-700/15 hover:border-purple-500/40 hover:bg-purple-900/10"
                  }`}
                  onClick={() => onSelect(c.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-[#e2d9f3] font-medium truncate"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {c.title}
                      </div>
                      <div
                        className="text-[9px] tracking-[1px] text-[#5a4a7a] mt-1 uppercase"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatDate(c.last_message_at ?? c.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      className="flex-shrink-0 text-[#7a6a9a] hover:text-red-400 opacity-50 hover:opacity-100 transition-all"
                      aria-label="Delete conversation"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
