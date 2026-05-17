"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPayPalSDK } from "@/lib/paypalSDK";
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
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [marksAdded, setMarksAdded] = useState<number | null>(null);
  const [visible, setVisible]       = useState(false);
  const [animIn, setAnimIn]         = useState(false);
  const [btnReady, setBtnReady]     = useState(false);

  const sheetRef     = useRef<HTMLDivElement>(null);
  const backdropRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef    = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, lastY: 0, startTime: 0, thresholdHit: false });

  const isOpen = !!pack;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setError(null);
      setSuccess(false);
      setMarksAdded(null);
      setBtnReady(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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

  // Render PayPal button once modal opens
  useEffect(() => {
    if (!visible || !pack || success) return;
    const packId = pack.id;
    let cancelled = false;

    const init = async () => {
      try {
        await getPayPalSDK();
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        const btn = window.paypal.Buttons({
          style: { layout: "vertical", color: "black", shape: "rect", label: "paypal", height: 50 },
          createOrder: async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "marks", packId }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Failed to create order"); }
            return (await res.json()).id as string;
          },
          onApprove: async (data: { orderID: string }) => { await captureOrder(data.orderID); },
          onError: (err: unknown) => {
            setError(String((err as any)?.message ?? "Payment error. Please try again."));
          },
        });
        if (btn.isEligible()) {
          await btn.render(containerRef.current);
          if (!cancelled) setBtnReady(true);
        } else {
          if (!cancelled) setError("PayPal is not available. Please try again later.");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to initialize payment");
      }
    };

    init();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [visible, pack, success, captureOrder]);

  // Non-passive touchmove for smooth drag-to-dismiss on mobile
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    const onMove = (e: TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientY); };
    handle.addEventListener("touchmove", onMove, { passive: false });
    return () => handle.removeEventListener("touchmove", onMove);
  });

  if (!visible || !pack) return null;

  const meta       = PACK_COLOR[pack.id] ?? { rgb: "0,229,255", label: pack.id.toUpperCase() };
  const haikuMsgs  = Math.floor(pack.marks / 3);
  const sonnetMsgs = Math.floor(pack.marks / 10);
  const opusMsgs   = Math.floor(pack.marks / 25);

  const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch {} };

  const animateClose = () => {
    if (loading) return;
    const ease = "cubic-bezier(0.32,0.72,0,1)";
    sheetRef.current    && Object.assign(sheetRef.current.style,    { transition: `transform 0.32s ${ease}`, transform: "translateY(110%)" });
    backdropRef.current && Object.assign(backdropRef.current.style, { transition: "opacity 0.32s ease",      opacity: "0" });
    setTimeout(onClose, 310);
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
    const clamped = delta < 0 ? delta * 0.06 : delta;
    sheetRef.current && (sheetRef.current.style.transform = `translateY(${clamped}px)`);
    if (backdropRef.current && sheetRef.current) {
      const p = Math.max(0, Math.min(1, clamped / (sheetRef.current.offsetHeight || 400)));
      backdropRef.current.style.opacity = String(1 - p * 0.9);
    }
    if (delta > 80 && !drag.current.thresholdHit) { drag.current.thresholdHit = true; vibrate(10); }
    else if (delta <= 80 && drag.current.thresholdHit) { drag.current.thresholdHit = false; }
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const delta    = drag.current.lastY - drag.current.startY;
    const velocity = delta / Math.max(1, Date.now() - drag.current.startTime);
    const ease     = "cubic-bezier(0.32,0.72,0,1)";
    sheetRef.current    && Object.assign(sheetRef.current.style,    { transition: `transform 0.32s ${ease}` });
    backdropRef.current && Object.assign(backdropRef.current.style, { transition: "opacity 0.32s ease" });
    if (delta > 90 || (delta > 40 && velocity > 0.4)) {
      vibrate(14);
      sheetRef.current    && (sheetRef.current.style.transform  = "translateY(110%)");
      backdropRef.current && (backdropRef.current.style.opacity = "0");
      setTimeout(onClose, 310);
    } else {
      sheetRef.current    && (sheetRef.current.style.transform = "translateY(0)");
      backdropRef.current && (backdropRef.current.style.opacity = "1");
      setTimeout(() => {
        if (sheetRef.current)    { sheetRef.current.style.transform    = ""; sheetRef.current.style.transition    = ""; }
        if (backdropRef.current) { backdropRef.current.style.opacity   = ""; backdropRef.current.style.transition = ""; }
      }, 330);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nx-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .nx-shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: nx-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes nx-btn-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nx-btn-in { animation: nx-btn-in 0.3s ease both; }
      `}</style>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(0,0,0,0.82)", opacity: animIn ? 1 : 0, transition: "opacity 0.28s ease" }}
        onClick={animateClose}
      />

      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={sheetRef}
          className={`pointer-events-auto w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden`}
          style={{
            background:  "linear-gradient(180deg, rgba(12,6,30,0.99) 0%, rgba(7,3,20,1) 100%)",
            border:      `1px solid rgba(${meta.rgb},0.3)`,
            boxShadow:   `0 0 60px rgba(${meta.rgb},0.1), 0 40px 100px rgba(0,0,0,0.95)`,
            transform:   animIn ? "translateY(0)" : "translateY(100%)",
            transition:  "transform 0.38s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        >
          {/* Top accent line */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(${meta.rgb},0.9), transparent)` }} />

          {/* Drag handle — non-passive touchmove attached via ref */}
          <div
            ref={handleRef}
            className="sm:hidden flex justify-center pt-3.5 pb-2 cursor-grab select-none"
            style={{ touchAction: "none" }}
            onTouchStart={(e) => startDrag(e.touches[0].clientY)}
            onTouchEnd={endDrag}
            onMouseDown={(e) => startDrag(e.clientY)}
            onMouseMove={(e) => { if (drag.current.active) moveDrag(e.clientY); }}
            onMouseUp={endDrag}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.14)" }} />
          </div>

          <div className="px-5 pt-3 pb-7">
            {success ? (
              /* ── Success ── */
              <div className="text-center py-6">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                  style={{
                    border: `2px solid rgba(${meta.rgb},0.5)`,
                    background: `rgba(${meta.rgb},0.08)`,
                    animation: "nx-btn-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M6 16L13 23L26 9" stroke={`rgba(${meta.rgb},1)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-[9px] tracking-[4px] uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)", color: `rgba(${meta.rgb},0.7)` }}>
                  ◈ MARKS CREDITED
                </div>
                <div className="text-[40px] font-black leading-none mb-1"
                  style={{ fontFamily: "var(--font-display)", color: `rgba(${meta.rgb},1)` }}>
                  +{(marksAdded ?? pack.marks).toLocaleString()}
                </div>
                <div className="text-[10px] tracking-[3px] mb-6"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}>
                  ⟡ MARKS
                </div>
                <button onClick={animateClose} className="px-8 py-3 rounded-xl text-[10px] tracking-[3px] font-bold"
                  style={{ fontFamily: "var(--font-mono)", background: `rgba(${meta.rgb},0.12)`, border: `1px solid rgba(${meta.rgb},0.4)`, color: `rgba(${meta.rgb},1)` }}>
                  CLOSE
                </button>
              </div>
            ) : (
              <>
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[8px] tracking-[3px] uppercase px-3 py-1 rounded-full"
                    style={{ fontFamily: "var(--font-mono)", color: `rgba(${meta.rgb},1)`, background: `rgba(${meta.rgb},0.1)`, border: `1px solid rgba(${meta.rgb},0.25)` }}>
                    ◈ {meta.label} PACK
                  </span>
                  <button onClick={animateClose} disabled={loading}
                    className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30"
                    style={{ color: "rgba(122,106,154,0.5)", border: "1px solid rgba(122,106,154,0.15)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Hero number */}
                <div className="text-center mb-5">
                  <div className="text-[60px] font-black leading-none mb-1"
                    style={{ fontFamily: "var(--font-display)", color: `rgba(${meta.rgb},1)`, textShadow: `0 0 40px rgba(${meta.rgb},0.4)` }}>
                    {pack.marks.toLocaleString()}
                  </div>
                  <div className="text-[11px] tracking-[5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}>
                    ⟡ MARKS
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-5 rounded-2xl p-3"
                  style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
                  {([
                    { model: "HAIKU",  count: haikuMsgs,  rgb: "124,58,237" },
                    { model: "SONNET", count: sonnetMsgs, rgb: "167,139,250" },
                    { model: "OPUS",   count: opusMsgs,   rgb: "0,229,255" },
                  ] as const).map(({ model, count, rgb }) => (
                    <div key={model} className="flex flex-col items-center gap-1 py-2">
                      <div className="text-[20px] font-black leading-none"
                        style={{ fontFamily: "var(--font-display)", color: `rgba(${rgb},0.9)` }}>{count}</div>
                      <div className="text-[7px] tracking-[1.5px] uppercase"
                        style={{ fontFamily: "var(--font-mono)", color: `rgba(${rgb},0.45)` }}>{model}</div>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.65)" }}>Total</span>
                  <span className="text-[22px] font-black" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                    {pack.priceLabel}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 text-[11px]"
                    style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)", color: "#f87171", fontFamily: "var(--font-body)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* PayPal button — skeleton until ready */}
                <div className="relative mb-3" style={{ minHeight: 50 }}>
                  {!btnReady && (
                    <div className="nx-shimmer absolute inset-0 rounded-lg" />
                  )}
                  <div
                    ref={containerRef}
                    className={btnReady ? "nx-btn-in" : ""}
                    style={{ opacity: btnReady ? 1 : 0 }}
                  />
                  {loading && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.45)" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                    </div>
                  )}
                </div>

                {/* Cancel */}
                <button onClick={animateClose} disabled={loading}
                  className="w-full py-3 rounded-xl text-[10px] tracking-[2px] transition-all disabled:opacity-40 active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(122,106,154,0.18)", color: "rgba(122,106,154,0.55)" }}>
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
