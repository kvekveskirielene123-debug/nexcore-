"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { MarkPack } from "@/lib/ai/modelConfig";

interface ConfirmPurchaseModalProps {
  pack: MarkPack | null;
  onClose: () => void;
}

const PACK_COLOR: Record<string, { rgb: string; label: string }> = {
  small:  { rgb: "124,58,237",  label: "STARTER"  },
  medium: { rgb: "0,229,255",   label: "STANDARD" },
  large:  { rgb: "167,139,250", label: "ELITE"    },
};

export function ConfirmPurchaseModal({ pack, onClose }: ConfirmPurchaseModalProps) {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [marksAdded, setMarksAdded] = useState<number | null>(null);
  const [visible, setVisible]   = useState(false);
  const [animIn, setAnimIn]     = useState(false);

  const sheetRef    = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  const packRef = useRef(pack);
  useEffect(() => { packRef.current = pack; }, [pack]);

  const isOpen = !!pack;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setError(null);
      setSuccess(false);
      setMarksAdded(null);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!visible || !pack) return null;

  const meta       = PACK_COLOR[pack.id] ?? { rgb: "0,229,255", label: pack.id.toUpperCase() };
  const haikuMsgs  = Math.floor(pack.marks / 3);
  const sonnetMsgs = Math.floor(pack.marks / 10);
  const opusMsgs   = Math.floor(pack.marks / 25);

  const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch {} };

  const animateClose = () => {
    const ease = "cubic-bezier(0.32,0.72,0,1)";
    sheetRef.current    && Object.assign(sheetRef.current.style,    { transition: `transform 0.3s ${ease}`, transform: "translateY(110%)" });
    backdropRef.current && Object.assign(backdropRef.current.style, { transition: "opacity 0.3s ease",       opacity: "0" });
    setTimeout(onClose, 280);
  };

  const startDrag = (y: number) => {
    drag.current = { active: true, startY: y, lastY: y, startTime: Date.now(), thresholdHit: false };
    sheetRef.current    && (sheetRef.current.style.transition    = "none");
    backdropRef.current && (backdropRef.current.style.transition = "none");
  };
  const moveDrag = (y: number) => {
    if (!drag.current.active) return;
    drag.current.lastY = y;
    const delta   = y - drag.current.startY;
    const clamped = delta < 0 ? delta * 0.08 : delta;
    sheetRef.current    && (sheetRef.current.style.transform = `translateY(${clamped}px)`);
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
    const delta    = drag.current.lastY - drag.current.startY;
    const velocity = delta / Math.max(1, Date.now() - drag.current.startTime);
    const ease     = "cubic-bezier(0.32,0.72,0,1)";
    sheetRef.current    && Object.assign(sheetRef.current.style,    { transition: `transform 0.3s ${ease}` });
    backdropRef.current && Object.assign(backdropRef.current.style, { transition: "opacity 0.3s ease" });
    if (delta > 100 || (delta > 40 && velocity > 0.4)) {
      vibrate(18);
      sheetRef.current    && (sheetRef.current.style.transform    = "translateY(110%)");
      backdropRef.current && (backdropRef.current.style.opacity   = "0");
      setTimeout(onClose, 280);
    } else {
      vibrate([6, 40, 6]);
      sheetRef.current    && (sheetRef.current.style.transform = "translateY(0)");
      backdropRef.current && (backdropRef.current.style.opacity = "1");
      setTimeout(() => {
        if (sheetRef.current)    { sheetRef.current.style.transform = "";    sheetRef.current.style.transition    = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity = "";   backdropRef.current.style.transition = ""; }
      }, 300);
    }
  };

  const createOrder = useCallback(async (): Promise<string> => {
    const currentPack = packRef.current;
    if (!currentPack) throw new Error("No pack selected");
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "marks", packId: currentPack.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create order");
    }
    const { id } = await res.json();
    return id as string;
  }, []);

  const captureOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setMarksAdded(data.marks ?? null);
        setSuccess(true);
      } else {
        setError(data.error ?? "Payment failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleError = useCallback((err: Record<string, unknown>) => {
    setLoading(false);
    setError(String(err?.message ?? "Payment error. Please try again."));
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(0,0,0,0.85)", opacity: animIn ? 1 : 0, transition: "opacity 0.3s ease" }}
        onClick={loading ? undefined : animateClose}
      />

      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={sheetRef}
          className={`pointer-events-auto w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden transition-transform duration-300 ease-out ${animIn ? "translate-y-0" : "translate-y-full sm:translate-y-4 sm:opacity-0"}`}
          style={{
            background:  "linear-gradient(180deg, rgba(10,5,28,0.99) 0%, rgba(6,3,18,1) 100%)",
            border:      `1px solid rgba(${meta.rgb},0.35)`,
            boxShadow:   `0 0 60px rgba(${meta.rgb},0.12), 0 40px 100px rgba(0,0,0,0.9)`,
          }}
        >
          {/* Top accent line */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${meta.rgb},0.9), transparent)` }} />

          {/* Drag handle */}
          <div
            className="sm:hidden flex justify-center pt-3 pb-2 cursor-grab touch-none select-none"
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
            onTouchEnd={endDrag}
          >
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          </div>

          <div className="px-6 pt-4 pb-6">

            {success ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ border: `2px solid rgba(${meta.rgb},0.5)`, background: `rgba(${meta.rgb},0.08)` }}
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M6 16L13 23L26 9" stroke={`rgba(${meta.rgb},1)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-[9px] tracking-[4px] uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)", color: `rgba(${meta.rgb},0.7)` }}>
                  ◈ MARKS CREDITED
                </div>
                <div className="text-[36px] font-black leading-none mb-1"
                  style={{ fontFamily: "var(--font-display)", color: `rgba(${meta.rgb},1)` }}>
                  +{(marksAdded ?? pack.marks).toLocaleString()}
                </div>
                <div className="text-[10px] tracking-[3px] mb-5"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}>
                  ⟡ MARKS
                </div>
                <button
                  onClick={animateClose}
                  className="px-8 py-3 rounded-xl text-[10px] tracking-[3px] font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: `rgba(${meta.rgb},0.12)`,
                    border: `1px solid rgba(${meta.rgb},0.4)`,
                    color: `rgba(${meta.rgb},1)`,
                  }}
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <>
                {/* Pack badge + close */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-[8px] tracking-[3px] uppercase px-3 py-1 rounded-full"
                    style={{ fontFamily: "var(--font-mono)", color: `rgba(${meta.rgb},1)`, background: `rgba(${meta.rgb},0.12)`, border: `1px solid rgba(${meta.rgb},0.3)` }}
                  >
                    ◈ {meta.label} PACK
                  </span>
                  <button
                    onClick={animateClose}
                    disabled={loading}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-30 active:scale-90"
                    style={{ color: "rgba(122,106,154,0.5)", border: "1px solid rgba(122,106,154,0.15)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Hero marks count */}
                <div className="text-center mb-6">
                  <div
                    className="text-[64px] font-black leading-none mb-1"
                    style={{
                      fontFamily:  "var(--font-display)",
                      color:       `rgba(${meta.rgb},1)`,
                      textShadow:  `0 0 40px rgba(${meta.rgb},0.5), 0 0 80px rgba(${meta.rgb},0.2)`,
                    }}
                  >
                    {pack.marks.toLocaleString()}
                  </div>
                  <div className="text-[11px] tracking-[5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}>
                    ⟡ MARKS
                  </div>
                </div>

                {/* Message breakdown */}
                <div
                  className="grid grid-cols-3 gap-2 mb-5 rounded-2xl p-3"
                  style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
                >
                  {([
                    { model: "HAIKU",  count: haikuMsgs,  rgb: "124,58,237"  },
                    { model: "SONNET", count: sonnetMsgs, rgb: "167,139,250" },
                    { model: "OPUS",   count: opusMsgs,   rgb: "0,229,255"   },
                  ] as const).map(({ model, count, rgb }) => (
                    <div key={model} className="flex flex-col items-center gap-1 py-2">
                      <div className="text-[20px] font-black leading-none"
                        style={{ fontFamily: "var(--font-display)", color: `rgba(${rgb},0.9)` }}>
                        {count}
                      </div>
                      <div className="text-[7px] tracking-[1.5px] uppercase"
                        style={{ fontFamily: "var(--font-mono)", color: `rgba(${rgb},0.5)` }}>
                        {model}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price row */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}>
                    Total
                  </span>
                  <span className="text-[22px] font-black"
                    style={{ fontFamily: "var(--font-display)", color: "white" }}>
                    {pack.priceLabel}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-[11px]"
                    style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontFamily: "var(--font-body)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* PayPal button */}
                <div className="mb-3">
                  <PayPalButtons
                    key={pack.id}
                    style={{ layout: "vertical", color: "black", shape: "rect", label: "paypal", height: 48 }}
                    createOrder={createOrder}
                    onApprove={async (data) => { await captureOrder(data.orderID); }}
                    onError={handleError}
                    disabled={loading}
                  />
                </div>

                {/* Cancel */}
                <button
                  onClick={animateClose}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-[10px] tracking-[2px] transition-all disabled:opacity-40 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(122,106,154,0.2)", color: "rgba(122,106,154,0.6)" }}
                >
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
