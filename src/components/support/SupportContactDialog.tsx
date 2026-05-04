"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";
import { TOPICS, type SupportTopic } from "@/lib/support/buildSupportEmail";

interface SupportContactDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SupportContactDialog({ open, onClose }: SupportContactDialogProps) {
  const supabase = createClient();

  const [topic, setTopic] = useState<SupportTopic>("Bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setTopic("Bug");
      setSubject("");
      setMessage("");
      setError("");
      setSent(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to contact support.");
        setSending(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile?.username ?? user.id,
          email: user.email ?? "no-reply@nexcor",
          subject: subject.trim() ? `[${topic}] ${subject.trim()}` : `[${topic}]`,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to send. Please try again.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const charCount = message.length;
  const charClass =
    charCount < 10 ? "text-[#7a6a9a]" :
    charCount > 2000 ? "text-red-400" :
    charCount > 1800 ? "text-amber-400" :
    "text-[#a78bfa]";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={sent ? onClose : onClose} />
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 pointer-events-none overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-md bg-[#0c0520] sm:rounded-2xl border-y sm:border border-purple-700/25 overflow-hidden relative my-0 sm:my-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700/15">
            <div className="flex items-center gap-2">
              <DnaLogo size={18} />
              <h2
                className="text-[11px] tracking-[3px] text-cyan-400 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ CONTACT SUPPORT
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-[#7a6a9a] hover:text-cyan-400 transition-colors">
              ✕
            </button>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)" }}
              >
                <span className="text-2xl" style={{ color: "#00e5ff" }}>✓</span>
              </div>
              <div>
                <p
                  className="text-[15px] font-bold tracking-[2px] text-white uppercase mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  MESSAGE SENT
                </p>
                <p className="text-[13px] text-[#a78bfa] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  We read every message personally and will get back to you soon.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-[10px] tracking-[3px] uppercase font-bold transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(0,229,255,0.1)",
                  border: "1px solid rgba(0,229,255,0.3)",
                  color: "#00e5ff",
                }}
              >
                CLOSE
              </button>
              <p
                className="text-[8px] tracking-[3px] text-purple-500/25 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                DIRECT LINE TO KURAI &amp; BIG G · 324B21
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <div className="p-5 space-y-4">
              <p className="text-[13px] text-[#a78bfa] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Have a bug, a question, or an idea? Message us directly.
              </p>

              {error && (
                <div className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-[12px]">
                  {error}
                </div>
              )}

              {/* Topic */}
              <div>
                <label className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-1.5 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                  Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as SupportTopic)}
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] focus:outline-none focus:border-cyan-400/40 transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t} className="bg-[#08041a]">{t}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-1.5 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                  Subject <span className="normal-case text-[9px] text-[#3a2a5a]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                  placeholder="Brief summary"
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Message
                  </label>
                  <span className={`text-[9px] tracking-[1px] ${charClass}`} style={{ fontFamily: "var(--font-mono)" }}>
                    {charCount}/2000
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Describe what happened, or share your idea..."
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", minHeight: 120 }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={sending || message.trim().length < 10}
                className="w-full py-3 rounded-lg bg-[#00e5ff] text-black font-bold text-[11px] tracking-[3px] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_28px_rgba(0,229,255,0.4)] transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {sending ? "SENDING..." : "SEND →"}
              </button>

              <p
                className="text-[8px] tracking-[3px] text-purple-500/25 text-center uppercase pt-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                DIRECT LINE TO KURAI &amp; BIG G · 324B21
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
