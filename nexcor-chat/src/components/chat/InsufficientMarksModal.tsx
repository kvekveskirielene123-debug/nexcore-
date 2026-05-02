"use client";

import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

interface InsufficientMarksModalProps {
  open: boolean;
  required: number;
  currentBalance: number;
  onClose: () => void;
}

export function InsufficientMarksModal({
  open,
  required,
  currentBalance,
  onClose,
}: InsufficientMarksModalProps) {
  if (!open) return null;

  const needed = required - currentBalance;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#0c0520] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <DnaLogo size={40} className="mx-auto mb-4" />

          <h2
            className="text-[18px] tracking-[3px] text-white uppercase mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            INSUFFICIENT MARKS
          </h2>
          <p
            className="text-sm text-[#a78bfa] italic mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            This message requires <span className="text-cyan-400 font-medium">{required} Marks</span>.
            <br />You have <span className="text-[#e2d9f3]">{currentBalance}</span>.
            You need <span className="text-cyan-400 font-medium">{needed}</span> more.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              href="/store"
              className="block w-full py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] shadow-[0_0_24px_rgba(0,229,255,0.3)] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              BUY MARK PACK →
            </Link>
            <button
              onClick={onClose}
              className="block w-full py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              USE A CHEAPER MODEL
            </button>
          </div>

          <p
            className="text-[8px] tracking-[3px] text-purple-500/25 uppercase mt-6"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            HAIKU IS ALWAYS FREE · 324B21
          </p>
        </div>
      </div>
    </>
  );
}
