"use client";

import { useState } from "react";

interface FirstChatModalProps {
  onConfirm: () => void;
}

export function FirstChatModal({ onConfirm }: FirstChatModalProps) {
  const [dontShow, setDontShow] = useState(true);

  const handleConfirm = () => {
    if (dontShow) {
      try { localStorage.setItem("nx-first-chat-seen", "1"); } catch {}
    }
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(5,2,13,0.88)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "rgba(11,6,28,0.99)",
          border: "1px solid rgba(124,58,237,0.3)",
          boxShadow: "0 0 60px rgba(124,58,237,0.12), 0 40px 80px rgba(0,0,0,0.8)",
          animation: "nx-message-in 0.3s cubic-bezier(0.34,1.4,0.64,1) both",
        }}
      >
        {/* top glow */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.7),transparent)" }} />

        <div className="p-6">
          {/* icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>

          <h2 className="text-center text-base font-black mb-3"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)", letterSpacing: "1px" }}>
            Before You Chat
          </h2>

          <div className="flex flex-col gap-2.5 mb-5">
            <p className="text-sm leading-relaxed text-center"
              style={{ fontFamily: "var(--font-body)", color: "rgba(196,181,253,0.85)" }}>
              Characters on Nexcor are <strong className="text-white">AI and not real people.</strong> All conversations are fictional and for entertainment only.
            </p>
            <p className="text-sm leading-relaxed text-center"
              style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.7)" }}>
              If you are experiencing a mental health crisis, please contact a professional or call a helpline. You are not alone.
            </p>
          </div>

          {/* crisis link */}
          <div className="flex justify-center mb-5">
            <a href="https://www.befrienders.org" target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium transition-opacity hover:opacity-100"
              style={{ color: "rgba(0,229,255,0.6)", fontFamily: "var(--font-mono)", opacity: 0.7, textDecoration: "underline" }}>
              Crisis Resources &amp; Helplines →
            </a>
          </div>

          {/* don't show again */}
          <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none justify-center">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: "#c084fc" }}
            />
            <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}>
              Don&apos;t show this again
            </span>
          </label>

          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(109,40,217,0.7))",
              border: "1px solid rgba(167,139,250,0.3)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 28px rgba(124,58,237,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.3)"; }}
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
