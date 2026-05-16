"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

interface DmMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface UserInfo {
  id: string;
  username: string;
  avatar_url: string | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)   return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function Avatar({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "rgba(124,58,237,0.18)",
        border: "2px solid rgba(124,58,237,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: size * 0.4, fontWeight: 900, fontFamily: "var(--font-display)", color: "#c084fc" }}>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function DmClient({
  conversationId,
  currentUser,
  partner,
  initialMessages,
}: {
  conversationId: string;
  currentUser: UserInfo;
  partner: UserInfo;
  initialMessages: DmMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<DmMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase realtime — listen for new messages in this conversation
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as DmMessage;
          // Avoid adding our own messages twice (we add them optimistically)
          if (msg.sender_id === currentUser.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUser.id]);

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || sending) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic: DmMessage = {
      id: tempId,
      sender_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch(`/api/dm/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json() as { message?: DmMessage; error?: string };
      if (json.message) {
        // Replace the temp message with the real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? json.message! : m))
        );
      } else {
        // Rollback on error
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
  }, [draft, sending, conversationId, currentUser.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        maxHeight: "100dvh",
        background: "transparent",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(5,2,13,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => router.push("/chats")}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#c084fc" }}
          aria-label="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <Avatar src={partner.avatar_url} name={partner.username} size={38} />

        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-bold truncate"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
          >
            @{partner.username}
          </p>
          <p
            className="text-[10px] tracking-[1.5px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            Direct Message
          </p>
        </div>

        <DnaLogo size={28} interactive />
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.8)" }}>
                Start the conversation
              </p>
              <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.55)" }}>
                Say hello to @{partner.username}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUser.id;
          const prev = messages[i - 1];
          const sameSender = prev && prev.sender_id === msg.sender_id;
          const isTemp = msg.id.startsWith("temp-");

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
              style={{ marginTop: sameSender ? 2 : 10 }}
            >
              {/* Avatar — only show on first of a group */}
              <div style={{ width: 30, flexShrink: 0 }}>
                {!sameSender && !isMine && (
                  <Avatar src={partner.avatar_url} name={partner.username} size={30} />
                )}
              </div>

              <div className={`flex flex-col gap-0.5 max-w-[72%] sm:max-w-[60%] ${isMine ? "items-end" : "items-start"}`}>
                {/* Sender label — first in group */}
                {!sameSender && !isMine && (
                  <span
                    className="text-[10px] ml-1"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.55)" }}
                  >
                    @{partner.username}
                  </span>
                )}

                {/* Bubble */}
                <div
                  className="px-3.5 py-2.5 rounded-2xl leading-relaxed break-words"
                  style={{
                    background: isMine
                      ? "rgba(0,229,255,0.12)"
                      : "rgba(124,58,237,0.12)",
                    border: isMine
                      ? "1px solid rgba(0,229,255,0.2)"
                      : "1px solid rgba(124,58,237,0.2)",
                    color: isMine ? "rgba(226,217,243,0.92)" : "rgba(226,217,243,0.88)",
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    borderBottomRightRadius: isMine ? 6 : 18,
                    borderBottomLeftRadius: isMine ? 18 : 6,
                    opacity: isTemp ? 0.65 : 1,
                    boxShadow: isMine
                      ? "0 2px 12px rgba(0,229,255,0.06)"
                      : "0 2px 12px rgba(124,58,237,0.06)",
                  }}
                >
                  {msg.content}
                </div>

                {/* Timestamp */}
                <span
                  className="text-[9px] px-1"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
                >
                  {isTemp ? "sending…" : formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: "rgba(5,2,13,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${partner.username}…`}
            rows={1}
            maxLength={2000}
            className="flex-1 bg-transparent outline-none resize-none text-[13px] leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(226,217,243,0.88)",
              maxHeight: 120,
              overflowY: "auto",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
            style={{
              background: draft.trim() ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.04)",
              border: draft.trim() ? "1px solid rgba(0,229,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
              color: draft.trim() ? "#00e5ff" : "rgba(122,106,154,0.4)",
            }}
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p
          className="text-center text-[8px] tracking-[2px] uppercase mt-2"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
