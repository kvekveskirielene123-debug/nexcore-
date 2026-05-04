"use client";

import { useState } from "react";
import type { MarkPack } from "@/lib/ai/modelConfig";

interface ConfirmPurchaseModalProps {
  pack: MarkPack | null;
  onClose: () => void;
}

const PACK_NAMES: Record<string, string> = {
  small: "STARTER",
  medium: "STANDARD",
  large: "ELITE",
};

export function ConfirmPurchaseModal({ pack, onClose }: ConfirmPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pack) return null;

  const packName = PACK_NAMES[pack.id] ?? pack.id.toUpperCase();
  const haikuMsgs  = Math.floor(pack.marks / 3);
  const sonnetMsgs = Math.floor(pack.marks / 10);
  const opusMsgs   = Math.floor(pack.marks / 25);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marks/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not start checkout. Try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: "rgba(8,4,26,0.98)",
            border: "1px solid rgba(0,229,255,0.3)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,229,255,0.08)",
          }}
        >
          {/* Top line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between">
            <div>
              <div
                className="text-[8px] tracking-[3px] uppercase mb-1"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
              >
                ◈ CONFIRM PURCHASE
              </div>
              <h2
                className="text-[20px] font-black tracking-[3px] uppercase text-white"
                style={{ fontFamily: "var(--font-display)", textShadow: "0 0 20px rgba(0,229,255,0.2)" }}
              >
                {pack.marks.toLocaleString()} MARKS
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:text-white disabled:opacity-30"
              style={{ border: "1px solid rgba(122,106,154,0.25)", color: "rgba(122,106,154,0.6)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Order summary */}
          <div
            className="mx-6 mb-4 rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(12,5,32,0.6)" }}
          >
            <div
              className="px-4 py-2 border-b border-white/[0.04] text-[8px] tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              ORDER SUMMARY
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span
                  className="text-[12px]"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.8)" }}
                >
                  {packName} Pack — {pack.marks.toLocaleString()} ⟡
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "white" }}
                >
                  {pack.priceLabel}
                </span>
              </div>
              <div
                className="h-px"
                style={{ background: "rgba(124,58,237,0.15)" }}
              />
              <div className="space-y-1.5">
                {[
                  { model: "HAIKU",  count: haikuMsgs,  color: "124,58,237"  },
                  { model: "SONNET", count: sonnetMsgs, color: "167,139,250" },
                  { model: "OPUS",   count: opusMsgs,   color: "0,229,255"   },
                ].map(({ model, count, color }) => (
                  <div key={model} className="flex justify-between">
                    <span
                      className="text-[10px] tracking-[1.5px]"
                      style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.6)` }}
                    >
                      {model}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.8)` }}
                    >
                      {count.toLocaleString()} messages
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="mx-6 mb-5 flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p
              className="text-[10px] italic leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}
            >
              You'll be taken to Stripe's secure checkout. We never store your card details.
            </p>
          </div>

          {error && (
            <div
              className="mx-6 mb-4 px-3 py-2 rounded-lg text-[11px]"
              style={{
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                color: "#f87171",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[10px] tracking-[2px] transition-all disabled:opacity-40 hover:border-purple-500/40"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(122,106,154,0.2)",
                color: "rgba(167,139,250,0.7)",
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-[10px] tracking-[3px] transition-all hover:shadow-[0_0_32px_rgba(0,229,255,0.5)] disabled:opacity-50 active:scale-95"
              style={{
                fontFamily: "var(--font-mono)",
                background: loading ? "rgba(0,229,255,0.6)" : "#00e5ff",
                color: "#000",
              }}
            >
              {loading ? "CONNECTING..." : `PAY ${pack.priceLabel} →`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
