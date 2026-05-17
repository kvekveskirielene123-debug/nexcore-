"use client";

import { useEffect } from "react";

interface CrisisModalProps {
  open: boolean;
  onClose: () => void;
}

export function CrisisModal({ open, onClose }: CrisisModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const resources = [
    { region: "Global", name: "Befrienders Worldwide", contact: "befrienders.org", url: "https://www.befrienders.org" },
    { region: "US", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", url: "https://988lifeline.org" },
    { region: "UK", name: "Samaritans", contact: "116 123", url: "https://www.samaritans.org" },
    { region: "CA", name: "Crisis Services Canada", contact: "1-833-456-4566", url: "https://www.crisisservicescanada.ca" },
    { region: "AU", name: "Lifeline Australia", contact: "13 11 14", url: "https://www.lifeline.org.au" },
    { region: "IN", name: "iCall India", contact: "9152987821", url: "https://icallhelpline.org" },
    { region: "INT", name: "IASP Crisis Centre Directory", contact: "iasp.info/resources", url: "https://www.iasp.info/resources/Crisis_Centres/" },
  ];

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: "rgba(5,2,13,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "rgba(11,6,28,0.99)",
          border: "1px solid rgba(0,229,255,0.22)",
          boxShadow: "0 0 60px rgba(0,229,255,0.08), 0 40px 80px rgba(0,0,0,0.8)",
          animation: "nx-message-in 0.3s cubic-bezier(0.34,1.4,0.64,1) both",
        }}
      >
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.55),transparent)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.18)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12 19.79 19.79 0 0 1 1.21 3.35 2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92-.08z" />
                </svg>
              </div>
              <h2 className="text-sm font-black" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)", letterSpacing: "1px" }}>
                CRISIS RESOURCES
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-opacity opacity-50 hover:opacity-100 flex-shrink-0"
              style={{ color: "rgba(148,163,184,0.7)" }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="text-xs mb-4 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.8)" }}>
            You are not alone. If you&apos;re in crisis or just need someone to talk to, please reach out to a free, confidential helpline.
          </p>

          <div className="flex flex-col gap-1.5">
            {resources.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,229,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,229,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)", background: "rgba(0,229,255,0.08)", letterSpacing: "1px" }}>
                    {r.region}
                  </span>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "rgba(226,217,243,0.9)", fontFamily: "var(--font-body)" }}>{r.name}</div>
                    <div className="text-[10px]" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "var(--font-mono)" }}>{r.contact}</div>
                  </div>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 ml-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(226,217,243,0.8)",
              fontFamily: "var(--font-body)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
