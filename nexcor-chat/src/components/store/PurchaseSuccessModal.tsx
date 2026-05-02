"use client";

import { DnaLogo } from "@/components/DnaLogo";

interface PurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function PurchaseSuccessModal({ open, onClose }: PurchaseSuccessModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[#0c0520] p-8 text-center relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <DnaLogo size={48} className="mx-auto mb-4" />

          <h2
            className="text-[18px] tracking-[3px] text-cyan-400 uppercase mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, textShadow: "0 0 20px rgba(0,229,255,0.4)" }}
          >
            TRANSMISSION COMPLETE
          </h2>

          <p
            className="text-sm text-[#a78bfa] italic mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your Marks have been credited to your account.
            <br />Thank you for supporting Nexcor.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            CONTINUE →
          </button>

          <p
            className="text-[8px] tracking-[3px] text-purple-500/25 uppercase mt-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            KURAI & BIG G THANK YOU · 324B21
          </p>
        </div>
      </div>
    </>
  );
}
