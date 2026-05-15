"use client";

import { useEffect, useRef, useState } from "react";
import { DnaLogo } from "@/components/DnaLogo";

interface PurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
  marks?: number;
}

export function PurchaseSuccessModal({ open, onClose, marks }: PurchaseSuccessModalProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  useEffect(() => {
    if (open) {
      setStep(0);
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
      const t1 = setTimeout(() => setStep(1), 120);
      const t2 = setTimeout(() => setStep(2), 500);
      const t3 = setTimeout(() => setStep(3), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setAnimIn(false);
      setStep(0);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  const vibrate = (pattern: number | number[]) => { try { navigator.vibrate?.(pattern); } catch {} };

  const animateClose = () => {
    const easing = "cubic-bezier(0.32,0.72,0,1)";
    if (sheetRef.current) { sheetRef.current.style.transition = `transform 0.3s ${easing}`; sheetRef.current.style.transform = "translateY(110%)"; }
    if (backdropRef.current) { backdropRef.current.style.transition = "opacity 0.3s ease"; backdropRef.current.style.opacity = "0"; }
    setTimeout(onClose, 280);
  };

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
      const p = Math.max(0, Math.min(1, clamped / (sheetRef.current.offsetHeight || 300)));
      backdropRef.current.style.opacity = String(1 - p * 0.9);
    }
    if (delta > 80 && !drag.current.thresholdHit) { drag.current.thresholdHit = true; vibrate(12); }
    else if (delta <= 80 && drag.current.thresholdHit) { drag.current.thresholdHit = false; vibrate(6); }
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
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animIn ? 1 : 0 }}
        onClick={animateClose}
      />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={sheetRef}
          className={`
            pointer-events-auto w-full sm:max-w-sm
            rounded-t-2xl sm:rounded-2xl overflow-hidden relative
            transition-transform duration-300 ease-out
            ${animIn ? "translate-y-0" : "translate-y-full"}
          `}
          style={{
            background: "rgba(8,4,26,0.98)",
            border: "1px solid rgba(0,229,255,0.35)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,229,255,0.12)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.1) 0%, transparent 70%)" }} />

          {/* Drag handle */}
          <div
            className="sm:hidden flex justify-center pt-3 pb-1 cursor-grab touch-none select-none"
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          <div
            className="px-8 pt-6 pb-6 text-center touch-none select-none sm:touch-auto sm:select-auto"
            style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
            {/* Animated DNA logo */}
            <div className="relative inline-block mb-5" style={{ transform: step >= 2 ? "scale(1)" : "scale(0.5)", opacity: step >= 2 ? 1 : 0, transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease" }}>
              <DnaLogo size={56} className="mx-auto" style={{ filter: "drop-shadow(0 0 24px rgba(0,229,255,0.7))" }} />
              {[0, 300, 600].map((delay) => (
                <div key={delay} className="absolute inset-0 rounded-full animate-ping" style={{ border: "1.5px solid rgba(0,229,255,0.25)", animationDuration: "1.8s", animationDelay: `${delay}ms` }} />
              ))}
            </div>

            <div className="text-[8px] tracking-[3px] uppercase mb-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)", opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s" }}>
              ◈ TRANSMISSION COMPLETE
            </div>

            <h2 className="text-[22px] font-black tracking-[3px] uppercase mb-2" style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 30px rgba(0,229,255,0.5)", opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s" }}>
              MARKS RECEIVED
            </h2>

            {marks && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.25)", opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "scale(1)" : "scale(0.8)", transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                <span className="text-cyan-400 text-xl" style={{ textShadow: "0 0 10px rgba(0,229,255,0.6)" }}>+{marks.toLocaleString()}</span>
                <span className="text-[11px] tracking-[2px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.6)" }}>⟡ MARKS CREDITED</span>
              </div>
            )}

            <p className="text-[12px] italic mb-6 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "#a78bfa", opacity: step >= 3 ? 1 : 0, transition: "opacity 0.3s ease 0.3s" }}>
              Your marks are live. Go have some conversations worth having.
            </p>

            <div className="touch-auto" onTouchStart={(e) => e.stopPropagation()}>
              <button
                onClick={animateClose}
                className="w-full py-3.5 rounded-xl font-bold text-[11px] tracking-[3px] transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] active:scale-[0.97]"
                style={{ fontFamily: "var(--font-mono)", background: "#00e5ff", color: "#000", opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.3s ease 0.4s, transform 0.3s ease 0.4s, box-shadow 0.2s" }}
              >
                START CHATTING →
              </button>
            </div>
          </div>

          <div className="px-8 pb-4 text-center" style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 0.3s ease 0.5s" }}>
            <p className="text-[8px] tracking-[3px] text-purple-500/25 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              KURAI & BIG G THANK YOU · 324B21
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
