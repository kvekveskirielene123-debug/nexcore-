"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  // Enter: mount → next two frames → animate in
  // Exit: animate out → unmount after transition
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  const needed = required - currentBalance;

  const vibrate = (pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch {}
  };

  const animateClose = () => {
    const easing = "cubic-bezier(0.32,0.72,0,1)";
    if (sheetRef.current) {
      sheetRef.current.style.transition = `transform 0.3s ${easing}`;
      sheetRef.current.style.transform = "translateY(110%)";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "opacity 0.3s ease";
      backdropRef.current.style.opacity = "0";
    }
    setTimeout(onClose, 280);
  };

  // ── Swipe-to-close ────────────────────────────────────────────
  const startDrag = (clientY: number) => {
    drag.current = { active: true, startY: clientY, lastY: clientY, startTime: Date.now(), thresholdHit: false };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
    if (backdropRef.current) backdropRef.current.style.transition = "none";
  };

  const moveDrag = (clientY: number) => {
    if (!drag.current.active) return;
    drag.current.lastY = clientY;
    const delta = clientY - drag.current.startY;
    const clamped = delta < 0 ? delta * 0.08 : delta;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${clamped}px)`;
    if (backdropRef.current && sheetRef.current) {
      const progress = Math.max(0, Math.min(1, clamped / (sheetRef.current.offsetHeight || 300)));
      backdropRef.current.style.opacity = String((animIn ? 1 : 0) - progress * 0.9);
    }
    if (delta > 80 && !drag.current.thresholdHit) {
      drag.current.thresholdHit = true;
      vibrate(12);
    } else if (delta <= 80 && drag.current.thresholdHit) {
      drag.current.thresholdHit = false;
      vibrate(6);
    }
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const delta = drag.current.lastY - drag.current.startY;
    const velocity = delta / Math.max(1, Date.now() - drag.current.startTime);
    const shouldClose = delta > 100 || (delta > 40 && velocity > 0.4);

    const easing = "cubic-bezier(0.32,0.72,0,1)";
    if (sheetRef.current) sheetRef.current.style.transition = `transform 0.3s ${easing}`;
    if (backdropRef.current) backdropRef.current.style.transition = "opacity 0.3s ease";

    if (shouldClose) {
      vibrate(18);
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(110%)";
      if (backdropRef.current) backdropRef.current.style.opacity = "0";
      setTimeout(onClose, 280);
    } else {
      vibrate([6, 40, 6]);
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      setTimeout(() => {
        if (sheetRef.current) { sheetRef.current.style.transform = ""; sheetRef.current.style.transition = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity = ""; backdropRef.current.style.transition = ""; }
      }, 300);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animIn ? 1 : 0 }}
        onClick={animateClose}
      />

      {/* Sheet — bottom-aligned on mobile, centered on sm+ */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={sheetRef}
          className={`
            pointer-events-auto w-full sm:max-w-md
            rounded-t-2xl sm:rounded-2xl
            border-t border-cyan-400/20 sm:border
            relative overflow-hidden
            transition-transform duration-300 ease-out
            ${animIn ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ background: "#0c0520" }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Drag handle (mobile only) */}
          <div
            className="sm:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Content */}
          <div
            className="px-8 pt-6 pb-8 text-center sm:p-8 touch-none select-none sm:touch-auto sm:select-auto"
            style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
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
              This message requires{" "}
              <span className="text-cyan-400 font-medium">{required} Marks</span>.
              <br />
              You have <span className="text-[#e2d9f3]">{currentBalance}</span>.
              You need{" "}
              <span className="text-cyan-400 font-medium">{needed}</span> more.
            </p>

            {/* Buttons — stop drag propagation so taps register */}
            <div
              className="flex flex-col gap-2 touch-auto"
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Link
                href="/store"
                className="block w-full py-3.5 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] shadow-[0_0_24px_rgba(0,229,255,0.3)] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] active:scale-[0.98] transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                BUY MARK PACK →
              </Link>
              <button
                onClick={animateClose}
                className="block w-full py-3.5 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 active:scale-[0.98] transition-all"
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
      </div>
    </>
  );
}
