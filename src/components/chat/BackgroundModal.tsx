"use client";

import { useRef } from "react";

interface BackgroundModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function BackgroundModal({ open, onClose, onSelect }: BackgroundModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onSelect(ev.target.result as string);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "rgba(11,6,28,0.99)",
          border: "1px solid rgba(124,58,237,0.25)",
          boxShadow: "0 0 60px rgba(124,58,237,0.1), 0 40px 80px rgba(0,0,0,0.8)",
          animation: "nx-message-in 0.28s cubic-bezier(0.34,1.4,0.64,1) both",
        }}
      >
        {/* Top glow */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.7),transparent)" }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-base" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}>
              Background Setting
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.6)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="text-xs mb-5 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}>
            Choose a background image for your chat. Recommended ratio 9:16, max 5MB.
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 py-6 rounded-2xl transition-all active:scale-95"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.14)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold mb-0.5" style={{ color: "rgba(226,217,243,0.9)" }}>Upload Image</div>
                <div className="text-[10px]" style={{ color: "rgba(122,106,154,0.5)" }}>From your device</div>
              </div>
            </button>

            {/* AI Generated */}
            <button
              className="flex flex-col items-center gap-3 py-6 rounded-2xl opacity-60 cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              disabled
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold mb-0.5 flex items-center gap-1.5" style={{ color: "rgba(148,163,184,0.6)" }}>
                  AI Generated
                  <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>SOON</span>
                </div>
                <div className="text-[10px]" style={{ color: "rgba(122,106,154,0.4)" }}>Generate with AI</div>
              </div>
            </button>
          </div>

          {/* Remove option */}
          <button
            onClick={() => { onSelect(""); onClose(); }}
            className="w-full py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(148,163,184,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            Remove Background
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
