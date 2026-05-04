"use client";

import { useEffect, useState } from "react";
import { DnaLogo } from "@/components/DnaLogo";

interface PurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
  marks?: number;
}

export function PurchaseSuccessModal({ open, onClose, marks }: PurchaseSuccessModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 120);
    const t2 = setTimeout(() => setStep(2), 500);
    const t3 = setTimeout(() => setStep(3), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-2xl relative overflow-hidden"
          style={{
            background: "rgba(8,4,26,0.98)",
            border: "1px solid rgba(0,229,255,0.35)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,229,255,0.12)",
            transform: step >= 1 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            opacity: step >= 1 ? 1 : 0,
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
          }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent" />

          {/* Ambient top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.1) 0%, transparent 70%)" }}
          />

          <div className="px-8 pt-8 pb-6 text-center">
            {/* Animated DNA logo */}
            <div
              className="relative inline-block mb-5"
              style={{
                transform: step >= 2 ? "scale(1)" : "scale(0.5)",
                opacity: step >= 2 ? 1 : 0,
                transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
              }}
            >
              <DnaLogo
                size={56}
                className="mx-auto"
                style={{ filter: "drop-shadow(0 0 24px rgba(0,229,255,0.7))" }}
              />
              {/* Ping rings */}
              {[0, 300, 600].map((delay) => (
                <div
                  key={delay}
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    border: "1.5px solid rgba(0,229,255,0.25)",
                    animationDuration: "1.8s",
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>

            {/* Status label */}
            <div
              className="text-[8px] tracking-[3px] uppercase mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(0,229,255,0.5)",
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s",
              }}
            >
              ◈ TRANSMISSION COMPLETE
            </div>

            {/* Headline */}
            <h2
              className="text-[22px] font-black tracking-[3px] uppercase mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
                textShadow: "0 0 30px rgba(0,229,255,0.5)",
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s",
              }}
            >
              MARKS RECEIVED
            </h2>

            {/* Marks amount */}
            {marks && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  opacity: step >= 3 ? 1 : 0,
                  transform: step >= 3 ? "scale(1)" : "scale(0.8)",
                  transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <span
                  className="text-cyan-400 text-xl"
                  style={{ textShadow: "0 0 10px rgba(0,229,255,0.6)" }}
                >
                  +{marks.toLocaleString()}
                </span>
                <span
                  className="text-[11px] tracking-[2px]"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.6)" }}
                >
                  ⟡ MARKS CREDITED
                </span>
              </div>
            )}

            <p
              className="text-[12px] italic text-[#a78bfa] mb-6 leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                opacity: step >= 3 ? 1 : 0,
                transition: "opacity 0.3s ease 0.3s",
              }}
            >
              Your marks are live. Go have some conversations worth having.
            </p>

            {/* CTA */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-[11px] tracking-[3px] transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] active:scale-95"
              style={{
                fontFamily: "var(--font-mono)",
                background: "#00e5ff",
                color: "#000",
                opacity: step >= 3 ? 1 : 0,
                transform: step >= 3 ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.3s ease 0.4s, transform 0.3s ease 0.4s, box-shadow 0.2s",
              }}
            >
              START CHATTING →
            </button>
          </div>

          {/* Footer */}
          <div
            className="px-8 pb-4 text-center"
            style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 0.3s ease 0.5s" }}
          >
            <p
              className="text-[8px] tracking-[3px] text-purple-500/25 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              KURAI & BIG G THANK YOU · 324B21
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
