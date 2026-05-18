"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getPayPalSDK } from "@/lib/paypalSDK";

const PLANS = [
  { key: "brilliant_2wk", label: "2 WEEKS", price: "$4.99",  period: "one-time", rgb: "124,58,237"  },
  { key: "brilliant_1mo", label: "1 MONTH",  price: "$9.99",  period: "/ mo",    rgb: "0,229,255"   },
  { key: "brilliant_1yr", label: "1 YEAR",   price: "$59.99", period: "/ yr",    rgb: "167,139,250" },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];

interface PayPalCheckoutModalProps {
  open: boolean;
  initialTier: string;
  onClose: () => void;
}

export function PayPalCheckoutModal({ open, initialTier, onClose }: PayPalCheckoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<PlanKey>(
    (PLANS.find((p) => p.key === initialTier)?.key ?? "brilliant_1mo") as PlanKey
  );
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [btnReady, setBtnReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedTierRef = useRef<PlanKey>(selectedTier);
  useEffect(() => { selectedTierRef.current = selectedTier; }, [selectedTier]);

  useEffect(() => {
    if (open) {
      const tier = (PLANS.find((p) => p.key === initialTier)?.key ?? "brilliant_1mo") as PlanKey;
      setSelectedTier(tier);
      selectedTierRef.current = tier;
      setLoading(false);
      setError(null);
      setSuccess(false);
      setExpiresAt(null);
      setBtnReady(false);
    }
  }, [open, initialTier]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
        setExpiresAt(data.expiresAt ?? null);
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

  useEffect(() => {
    if (!open || success) return;
    let cancelled = false;
    setBtnReady(false);

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
              body: JSON.stringify({ tier: selectedTierRef.current }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Failed to create order"); }
            return (await res.json()).id as string;
          },
          onApprove: async (data: { orderID: string }) => { await captureOrder(data.orderID); },
          onError:   (err: unknown) => {
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
  }, [open, success, captureOrder]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(5,2,13,0.88)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nx-modal-in {
          from { opacity: 0; transform: scale(0.93) translateY(18px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes nx-success-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          65%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nx-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes nx-btn-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nx-modal-wrap   { animation: nx-modal-in 0.28s cubic-bezier(0.34,1.4,0.64,1) both; }
        .nx-success-icon { animation: nx-success-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .nx-shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: nx-shimmer 1.6s ease-in-out infinite;
        }
        .nx-btn-in { animation: nx-btn-in 0.3s ease both; }
      `}</style>

      <div
        className="nx-modal-wrap"
        style={{
          width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto",
          borderRadius: 22,
          border: "1px solid rgba(124,58,237,0.3)",
          background: "linear-gradient(145deg, rgba(11,5,26,0.99) 0%, rgba(8,2,20,0.99) 100%)",
          boxShadow: "0 0 80px rgba(124,58,237,0.12), 0 0 40px rgba(0,229,255,0.04)",
          position: "relative",
        }}
      >
        {/* Decorative layer — isolated overflow:hidden so it never clips PayPal iframe */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.8) 30%, rgba(0,229,255,0.6) 70%, transparent)",
          }} />
          <div style={{
            position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
            width: 400, height: 280, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
          }} />
        </div>

        <div style={{ padding: "26px 26px 22px", position: "relative" }}>
          {success ? (
            /* ── Success ── */
            <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
              <div className="nx-success-icon" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 72, height: 72, borderRadius: "50%",
                border: "2px solid rgba(0,229,255,0.5)", background: "rgba(0,229,255,0.08)", marginBottom: 18,
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 9" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 10, letterSpacing: "4px", fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)", marginBottom: 10 }}>
                ◈ SUBSCRIPTION ACTIVATED
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "var(--font-display)", color: "#fff", textShadow: "0 0 30px rgba(0,229,255,0.4)", marginBottom: 8, letterSpacing: "2px" }}>
                BRILLIANT
              </div>
              <p style={{ fontSize: 12, fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.7)", marginBottom: 6, fontStyle: "italic" }}>
                Your designation has been upgraded.
              </p>
              {expiresAt && (
                <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)", marginBottom: 22 }}>
                  ACCESS UNTIL{" "}
                  <span style={{ color: "rgba(0,229,255,0.7)" }}>
                    {new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </p>
              )}
              <button onClick={onClose}
                style={{ padding: "12px 32px", borderRadius: 10, background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.4)", color: "#00e5ff", fontSize: 10, letterSpacing: "3px", fontFamily: "var(--font-mono)", fontWeight: 700, cursor: "pointer" }}>
                CLOSE
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "4px", fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.7)", marginBottom: 5 }}>
                    ◈ NEXCOR BRILLIANT
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)", color: "#fff", letterSpacing: "3px", lineHeight: 1.1 }}>
                    UPGRADE
                  </div>
                </div>
                <button onClick={onClose} disabled={loading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(122,106,154,0.2)", background: "rgba(122,106,154,0.07)", color: "rgba(122,106,154,0.6)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  ×
                </button>
              </div>

              {/* Plan selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 22 }}>
                {PLANS.map((plan) => {
                  const active = selectedTier === plan.key;
                  return (
                    <button key={plan.key}
                      onClick={() => { setSelectedTier(plan.key); setError(null); }}
                      style={{
                        padding: "10px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                        border: active ? `1px solid rgba(${plan.rgb},0.55)` : "1px solid rgba(122,106,154,0.16)",
                        background: active ? `rgba(${plan.rgb},0.09)` : "rgba(12,5,32,0.5)",
                        color: active ? `rgba(${plan.rgb},1)` : "rgba(122,106,154,0.45)",
                        transition: "all 0.18s ease",
                        transform: active ? "scale(1.02)" : "scale(1)",
                      }}>
                      <div style={{ fontSize: 7, letterSpacing: "2px", fontFamily: "var(--font-mono)", marginBottom: 4 }}>{plan.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "var(--font-display)", lineHeight: 1 }}>{plan.price}</div>
                      <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", opacity: 0.55, marginTop: 3 }}>{plan.period}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ height: 1, background: "rgba(124,58,237,0.1)", marginBottom: 18 }} />

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)", color: "#f87171", fontSize: 11, fontFamily: "var(--font-body)" }}>
                  ⚠ {error}
                </div>
              )}

              {/* PayPal button */}
              <div style={{ position: "relative", minHeight: 50, marginBottom: 14 }}>
                {!btnReady && <div className="nx-shimmer" style={{ position: "absolute", inset: 0, borderRadius: 10 }} />}
                <div
                  ref={containerRef}
                  className={btnReady ? "nx-btn-in" : ""}
                  style={{ opacity: btnReady ? 1 : 0 }}
                />
                {loading && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                  </div>
                )}
              </div>

              {/* Security badges */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 14, borderTop: "1px solid rgba(122,106,154,0.07)" }}>
                {[{ icon: "🔒", label: "256-BIT SSL" }, { icon: "🛡", label: "PAYPAL SECURE" }, { icon: "✓", label: "PCI DSS" }].map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.38)", letterSpacing: "1px" }}>
                    <span style={{ fontSize: 10 }}>{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
