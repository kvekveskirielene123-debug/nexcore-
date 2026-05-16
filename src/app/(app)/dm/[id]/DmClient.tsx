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

function Avatar({ src, name, size = 38 }: { src: string | null; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        flexShrink: 0, background: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(0,229,255,0.2))",
        border: "2px solid rgba(124,58,237,0.35)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: size * 0.4, fontWeight: 900, fontFamily: "var(--font-display)", color: "#c084fc" }}>
            {name[0].toUpperCase()}
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
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Settings panel ──────────────────────────────────────────────────────── */

function SettingsPanel({
  partner,
  conversationId,
  onClose,
  onClearChat,
}: {
  partner: UserInfo;
  conversationId: string;
  onClose: () => void;
  onClearChat: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await fetch(`/api/dm/${conversationId}/clear`, { method: "DELETE" });
      onClearChat();
      onClose();
    } catch { /* ignore */ }
    finally { setClearing(false); setConfirmClear(false); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 z-20" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute top-0 right-0 bottom-0 z-30 flex flex-col"
        style={{
          width: 280,
          background: "rgba(10,5,25,0.98)",
          borderLeft: "1px solid rgba(124,58,237,0.2)",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
          animation: "nx-modal-slide-up 0.25s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Top shimmer */}
        <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.4), rgba(167,139,250,0.3), transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[11px] tracking-[2.5px] uppercase font-bold" style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.7)" }}>
            Chat Settings
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "rgba(148,163,184,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00e5ff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.5)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Partner info */}
        <div className="flex flex-col items-center gap-3 px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Avatar src={partner.avatar_url} name={partner.username} size={64} />
          <div className="text-center">
            <p className="text-[15px] font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}>
              @{partner.username}
            </p>
            <p className="text-[10px] tracking-[1.5px] mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}>
              Direct Message
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 px-3 py-3 flex-1">

          <Link
            href={`/profile/${partner.username}`}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ color: "rgba(226,217,243,0.75)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as HTMLElement).style.color = "#c084fc"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,0.75)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>View Profile</span>
          </Link>

          <div style={{ height: 1, margin: "4px 12px", background: "rgba(255,255,255,0.05)" }} />

          {/* Clear chat */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left"
              style={{ color: "rgba(226,217,243,0.65)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.85)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,0.65)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
              </svg>
              <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>Clear Chat</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "rgba(239,68,68,0.8)" }}>
                Delete all messages in this chat? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="flex-1 py-1.5 rounded-lg text-[10px] tracking-[1.5px] uppercase font-bold transition-all disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "rgba(239,68,68,0.9)", fontFamily: "var(--font-mono)" }}
                >
                  {clearing ? "Clearing…" : "Yes, clear"}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] tracking-[1.5px] uppercase font-bold transition-all"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.8)", fontFamily: "var(--font-mono)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ color: "rgba(226,217,243,0.65)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.85)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,0.65)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            <span className="text-[13px]" style={{ fontFamily: "var(--font-body)" }}>Report User</span>
          </Link>
        </div>

        {/* Version tag */}
        <p className="text-center text-[8px] tracking-[2px] uppercase px-4 pb-5" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}>
          NEXCOR · DIRECT LINK · 324B21
        </p>
      </div>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

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
  const [messages, setMessages]       = useState<DmMessage[]>(initialMessages);
  const [draft, setDraft]             = useState("");
  const [sending, setSending]         = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime
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

  // Image pick
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
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
      id: tempId,
      sender_id: currentUser.id,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch(`/api/dm/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // Group messages by day for dividers
  const grouped: { dayLabel: string; messages: DmMessage[] }[] = [];
  for (const msg of messages) {
    const label = dayLabel(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.dayLabel === label) {
      last.messages.push(msg);
    } else {
      grouped.push({ dayLabel: label, messages: [msg] });
    }
  }

  return (
    <div
      className="flex flex-col relative"
      style={{ height: "calc(100dvh - 56px)", maxHeight: "calc(100dvh - 56px)", background: "transparent" }}
    >
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(5,2,13,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.35), rgba(0,229,255,0.2), transparent)" }} />

        <button
          onClick={() => router.push("/chats")}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.18)", color: "#c084fc" }}
          aria-label="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <Avatar src={partner.avatar_url} name={partner.username} size={38} />

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}>
            @{partner.username}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 5px rgba(0,229,255,0.9)" }} />
            <p className="text-[10px] tracking-[1.5px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}>
              Direct Message
            </p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{
            background: settingsOpen ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.08)",
            border: settingsOpen ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(124,58,237,0.15)",
            color: settingsOpen ? "#c084fc" : "rgba(148,163,184,0.5)",
          }}
          aria-label="Chat settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93a10 10 0 0 0 14.14 14.14"/>
          </svg>
        </button>
      </div>

      {/* ── Settings panel ── */}
      {settingsOpen && (
        <SettingsPanel
          partner={partner}
          conversationId={conversationId}
          onClose={() => setSettingsOpen(false)}
          onClearChat={() => setMessages([])}
        />
      )}

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 32px rgba(124,58,237,0.08)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}>
                Start the conversation
              </p>
              <p className="text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.55)" }}>
                Say hello to @{partner.username}
              </p>
            </div>
          </div>
        )}

        {grouped.map(({ dayLabel: label, messages: dayMsgs }) => (
          <div key={label}>
            {/* Day divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {label}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMine    = msg.sender_id === currentUser.id;
              const prev      = dayMsgs[i - 1];
              const sameSender = prev?.sender_id === msg.sender_id;
              const isTemp    = msg.id.startsWith("temp-");

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  style={{ marginTop: sameSender ? 3 : 12 }}
                >
                  {/* Avatar */}
                  <div style={{ width: 30, flexShrink: 0 }}>
                    {!sameSender && !isMine && <Avatar src={partner.avatar_url} name={partner.username} size={30} />}
                  </div>

                  <div className={`flex flex-col gap-0.5 max-w-[72%] sm:max-w-[60%] ${isMine ? "items-end" : "items-start"}`}>
                    {!sameSender && !isMine && (
                      <span className="text-[10px] ml-1 mb-0.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.5)" }}>
                        @{partner.username}
                      </span>
                    )}

                    {/* Image attachment */}
                    {msg.image_url && (
                      <button
                        onClick={() => setLightboxSrc(msg.image_url!)}
                        className="rounded-2xl overflow-hidden transition-all active:scale-95"
                        style={{
                          maxWidth: 260,
                          border: isMine ? "1px solid rgba(0,229,255,0.22)" : "1px solid rgba(124,58,237,0.22)",
                          boxShadow: isMine ? "0 4px 20px rgba(0,229,255,0.08)" : "0 4px 20px rgba(124,58,237,0.08)",
                          marginBottom: msg.content ? 4 : 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.image_url} alt="attachment" style={{ display: "block", maxWidth: "100%", maxHeight: 300, objectFit: "cover" }} />
                      </button>
                    )}

                    {/* Text bubble */}
                    {msg.content && (
                      <div
                        className="px-3.5 py-2.5 rounded-2xl leading-relaxed break-words"
                        style={{
                          background: isMine ? "rgba(0,229,255,0.1)" : "rgba(124,58,237,0.12)",
                          border: isMine ? "1px solid rgba(0,229,255,0.18)" : "1px solid rgba(124,58,237,0.2)",
                          color: "rgba(226,217,243,0.92)",
                          fontSize: 13,
                          fontFamily: "var(--font-body)",
                          borderBottomRightRadius: isMine ? 6 : 18,
                          borderBottomLeftRadius: isMine ? 18 : 6,
                          opacity: isTemp ? 0.6 : 1,
                          boxShadow: isMine ? "0 2px 12px rgba(0,229,255,0.05)" : "0 2px 12px rgba(124,58,237,0.05)",
                        }}
                      >
                        {msg.content}
                      </div>
                    )}

                    {/* Time + read */}
                    <div className={`flex items-center gap-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                      <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}>
                        {isTemp ? "sending…" : formatTime(msg.created_at)}
                      </span>
                      {isMine && !isTemp && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={msg.read_at ? "#00e5ff" : "rgba(122,106,154,0.35)"} strokeWidth="2.5" strokeLinecap="round">
                          {msg.read_at
                            ? <><polyline points="1 12 5 16 12 7"/><polyline points="8 12 12 16 20 7"/></>
                            : <polyline points="4 12 9 17 20 6"/>
                          }
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
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: "rgba(5,2,13,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(124,58,237,0.1)",
        }}
      >
        {/* Image preview */}
        {imagePreview && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="rounded-xl object-cover" style={{ width: 72, height: 72, border: "1px solid rgba(0,229,255,0.25)" }} />
              <button
                onClick={removeImagePreview}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.9)", border: "1.5px solid #05020d" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.6)" }}>
              {uploadingImage ? "Uploading…" : "Image ready to send"}
            </p>
          </div>
        )}

        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Image attach button */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 self-end mb-0.5"
            style={{
              background: imagePreview ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.04)",
              border: imagePreview ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: imagePreview ? "#00e5ff" : "rgba(122,106,154,0.5)",
            }}
            aria-label="Attach image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${partner.username}…`}
            rows={1}
            maxLength={2000}
            className="flex-1 bg-transparent outline-none resize-none text-[13px] leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.88)", maxHeight: 120, overflowY: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          <button
            onClick={handleSend}
            disabled={(!draft.trim() && !imageFile) || sending || uploadingImage}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30 self-end"
            style={{
              background: (draft.trim() || imageFile) ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.04)",
              border: (draft.trim() || imageFile) ? "1px solid rgba(0,229,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
              color: (draft.trim() || imageFile) ? "#00e5ff" : "rgba(122,106,154,0.4)",
            }}
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[8px] tracking-[2px] uppercase mt-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.18)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
