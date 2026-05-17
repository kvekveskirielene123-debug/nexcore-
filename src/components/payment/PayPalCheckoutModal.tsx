"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PLANS = [
  { key: "brilliant_2wk", label: "2 WEEKS", price: "$4.99", period: "one-time", rgb: "124,58,237" },
  { key: "brilliant_1mo", label: "1 MONTH", price: "$9.99", period: "/ mo", rgb: "0,229,255" },
  { key: "brilliant_1yr", label: "1 YEAR", price: "$59.99", period: "/ yr", rgb: "167,139,250" },
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const tierRef = useRef(selectedTier);
  useEffect(() => { tierRef.current = selectedTier; }, [selectedTier]);

  useEffect(() => {
    if (open) {
      setSelectedTier((PLANS.find((p) => p.key === initialTier)?.key ?? "brilliant_1mo") as PlanKey);
      setLoading(false);
      setError(null);
      setSuccess(false);
      setExpiresAt(null);
    }
  }, [open, initialTier]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const createOrder = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: tierRef.current }),
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

  const handleError = useCallback((err: Record<string, unknown>) => {
    setLoading(false);
    setError(String(err?.message ?? "Payment error. Please try again."));
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(5,2,13,0.92)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <style>{`
        @keyframes nx-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes nx-success-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        .nx-modal-container {
          animation: nx-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .nx-success-icon {
          animation: nx-success-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }
      `}</style>

      <div
        className="nx-modal-container"
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 20,
          border: "1px solid rgba(124,58,237,0.35)",
          background: "linear-gradient(135deg, rgba(10,5,25,0.99) 0%, rgba(8,2,20,0.99) 100%)",
          boxShadow: "0 0 80px rgba(124,58,237,0.15), 0 0 40px rgba(0,229,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.8) 30%, rgba(0,229,255,0.6) 70%, transparent)",
          boxShadow: "0 0 20px rgba(124,58,237,0.4)",
        }} />

        {/* Ambient radial glow */}
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ padding: "28px 28px 24px", position: "relative" }}>

          {/* Success state */}
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
              <div className="nx-success-icon" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 72, height: 72, borderRadius: "50%",
                border: "2px solid rgba(0,229,255,0.5)",
                background: "rgba(0,229,255,0.08)",
                marginBottom: 20,
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 9" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{
                fontSize: 10, letterSpacing: "4px", fontFamily: "var(--font-mono)",
                color: "rgba(0,229,255,0.7)", marginBottom: 10,
              }}>
                ◈ SUBSCRIPTION ACTIVATED
              </div>

              <div style={{
                fontSize: 28, fontWeight: 900, fontFamily: "var(--font-display)",
                color: "#fff",
                textShadow: "0 0 30px rgba(0,229,255,0.4)",
                marginBottom: 8, letterSpacing: "2px",
              }}>
                BRILLIANT
              </div>

              <p style={{
                fontSize: 12, fontFamily: "var(--font-body)",
                color: "rgba(167,139,250,0.7)", marginBottom: 6, fontStyle: "italic",
              }}>
                Your designation has been upgraded.
              </p>

              {expiresAt && (
                <p style={{
                  fontSize: 10, fontFamily: "var(--font-mono)",
                  color: "rgba(122,106,154,0.6)", marginBottom: 24,
                }}>
                  ACCESS UNTIL{" "}
                  <span style={{ color: "rgba(0,229,255,0.7)" }}>
                    {new Date(expiresAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </p>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: "12px 32px", borderRadius: 10,
                  background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.4)",
                  color: "#00e5ff", fontSize: 10, letterSpacing: "3px", fontFamily: "var(--font-mono)",
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                <div>
                  <div style={{
                    fontSize: 9, letterSpacing: "4px", fontFamily: "var(--font-mono)",
                    color: "rgba(124,58,237,0.7)", marginBottom: 6,
                  }}>
                    ◈ NEXCOR BRILLIANT
                  </div>
                  <div style={{
                    fontSize: 20, fontWeight: 900, fontFamily: "var(--font-display)",
                    color: "#fff", letterSpacing: "3px", lineHeight: 1.1,
                  }}>
                    UPGRADE
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid rgba(122,106,154,0.2)",
                    background: "rgba(122,106,154,0.08)",
                    color: "rgba(122,106,154,0.6)", fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Plan selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
                {PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => { setSelectedTier(plan.key); setError(null); }}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: selectedTier === plan.key
                        ? `1px solid rgba(${plan.rgb},0.6)`
                        : "1px solid rgba(122,106,154,0.18)",
                      background: selectedTier === plan.key
                        ? `rgba(${plan.rgb},0.08)`
                        : "rgba(12,5,32,0.5)",
                      color: selectedTier === plan.key ? `rgba(${plan.rgb},1)` : "rgba(122,106,154,0.5)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 7, letterSpacing: "2px", fontFamily: "var(--font-mono)", marginBottom: 3 }}>
                      {plan.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                      {plan.price}
                    </div>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", opacity: 0.6, marginTop: 2 }}>
                      {plan.period}
                    </div>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(124,58,237,0.12)", marginBottom: 20 }} />

              {/* Error message */}
              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                  border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(248,113,113,0.06)",
                  color: "#f87171", fontSize: 11, fontFamily: "var(--font-body)",
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* PayPal button (includes card option inside PayPal's checkout flow) */}
              <div style={{ marginBottom: 12 }}>
                <PayPalButtons
                  key={selectedTier}
                  style={{ layout: "vertical", color: "black", shape: "rect", label: "paypal", height: 48 }}
                  createOrder={createOrder}
                  onApprove={async (data) => { await captureOrder(data.orderID); }}
                  onError={handleError}
                  disabled={loading}
                />
              </div>

              {/* Security badges */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 16, marginTop: 20, paddingTop: 16,
                borderTop: "1px solid rgba(122,106,154,0.08)",
              }}>
                {[
                  { icon: "🔒", label: "256-BIT SSL" },
                  { icon: "🛡", label: "PAYPAL SECURE" },
                  { icon: "✓", label: "PCI DSS" },
                ].map((b) => (
                  <div key={b.label} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 8, fontFamily: "var(--font-mono)",
                    color: "rgba(122,106,154,0.4)", letterSpacing: "1px",
                  }}>
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
