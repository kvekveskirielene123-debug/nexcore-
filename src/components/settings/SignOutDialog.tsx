"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignOutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SignOutDialog({ open, onClose }: SignOutDialogProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

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
    if (delta > 60 && !drag.current.thresholdHit) { drag.current.thresholdHit = true; vibrate(12); }
    else if (delta <= 60 && drag.current.thresholdHit) { drag.current.thresholdHit = false; vibrate(6); }
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const delta = drag.current.lastY - drag.current.startY;
    const velocity = delta / Math.max(1, Date.now() - drag.current.startTime);
    const shouldClose = delta > 80 || (delta > 30 && velocity > 0.4);
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

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animIn ? 1 : 0 }}
        onClick={signingOut ? undefined : animateClose}
      />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={sheetRef}
          className={`
            pointer-events-auto w-full sm:max-w-sm
            rounded-t-2xl sm:rounded-2xl overflow-hidden
            border-t sm:border
            transition-transform duration-300 ease-out
            ${animIn ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ background: "#0c0520", borderColor: "rgba(124,58,237,0.25)" }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

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
            className="px-6 pt-5 pb-6 text-center space-y-4 touch-none select-none sm:touch-auto sm:select-auto"
            style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
            <div className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}>
              ◈ SESSION TERMINATION
            </div>
            <h2 className="text-[20px] tracking-[2px] text-white uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Sign out of Nexcor?
            </h2>
            <p className="text-[13px] italic leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "#a78bfa" }}>
              Your characters and conversations stay safe. You can sign back in anytime.
            </p>

            <div className="flex gap-2 pt-2 touch-auto" onTouchStart={(e) => e.stopPropagation()}>
              <button
                onClick={animateClose}
                disabled={signingOut}
                className="flex-1 py-3.5 rounded-xl text-[11px] tracking-[2px] transition-all disabled:opacity-40 active:scale-[0.97]"
                style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(167,139,250,0.8)" }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 py-3.5 rounded-xl font-bold text-[11px] tracking-[3px] transition-all disabled:opacity-50 active:scale-[0.97]"
                style={{ fontFamily: "var(--font-mono)", background: signingOut ? "rgba(239,68,68,0.6)" : "rgba(239,68,68,0.85)", color: "#fff" }}
              >
                {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
