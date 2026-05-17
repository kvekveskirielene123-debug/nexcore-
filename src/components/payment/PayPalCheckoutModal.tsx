"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalNameField,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

const PLANS = [
  { key: "brilliant_2wk", label: "2 WEEKS", price: "$4.99", period: "one-time", rgb: "124,58,237" },
  { key: "brilliant_1mo", label: "1 MONTH", price: "$9.99", period: "/ mo", rgb: "0,229,255" },
  { key: "brilliant_1yr", label: "1 YEAR", price: "$59.99", period: "/ yr", rgb: "167,139,250" },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];

const CARD_STYLE: Record<string, object> = {
  input: {
    "font-family": "monospace",
    "font-size": "14px",
    color: "#e2d9f3",
    "letter-spacing": "0.5px",
  },
  ":focus": { color: "#00e5ff" },
  "::placeholder": { color: "rgba(167,139,250,0.35)" },
  ".invalid": { color: "#f87171" },
};

// ── Card submit button (must be child of PayPalCardFieldsProvider) ──────────
function CardSubmitButton({
  loading,
  setLoading,
  onError,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onError: (msg: string) => void;
}) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handlePay = async () => {
    if (!cardFieldsForm || loading) return;
    setLoading(true);
    try {
      await cardFieldsForm.submit();
      // onApprove / onError on the provider handle the result
    } catch (err: any) {
      setLoading(false);
      onError(err?.message ?? "Card payment failed. Please try again.");
    }
  };

  const eligible = cardFieldsForm?.isEligible?.() ?? false;

  return (
    <button
      onClick={handlePay}
      disabled={loading || !eligible}
      style={{
        width: "100%",
        padding: "14px 0",
        borderRadius: 12,
        border: eligible ? "1px solid rgba(0,229,255,0.5)" : "1px solid rgba(122,106,154,0.2)",
        background: eligible
          ? "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(124,58,237,0.15) 100%)"
          : "rgba(122,106,154,0.08)",
        color: eligible ? "#00e5ff" : "rgba(122,106,154,0.4)",
        fontSize: 11,
        letterSpacing: "3px",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        cursor: eligible && !loading ? "pointer" : "not-allowed",
        transition: "all 0.2s",
        boxShadow: eligible && !loading ? "0 0 20px rgba(0,229,255,0.1)" : "none",
      }}
    >
      {loading
        ? "PROCESSING..."
        : eligible
        ? "PAY NOW ◈"
        : "CARD PAYMENTS UNAVAILABLE"}
    </button>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
interface PayPalCheckoutModalProps {
  open: boolean;
  initialTier: string;
  onClose: () => void;
}

export function PayPalCheckoutModal({ open, initialTier, onClose }: PayPalCheckoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<PlanKey>(
    (PLANS.find((p) => p.key === initialTier)?.key ?? "brilliant_1mo") as PlanKey
  );
  const [tab, setTab] = useState<"paypal" | "card">("paypal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Keep ref to selectedTier for stable callbacks
  const tierRef = useRef(selectedTier);
  useEffect(() => { tierRef.current = selectedTier; }, [selectedTier]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setSelectedTier((PLANS.find((p) => p.key === initialTier)?.key ?? "brilliant_1mo") as PlanKey);
      setTab("paypal");
      setLoading(false);
      setError(null);
      setSuccess(false);
      setExpiresAt(null);
    }
  }, [open, initialTier]);

  // Prevent body scroll when open
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

  const handleCardApprove = useCallback(
    (data: CardFieldsOnApproveData) => { captureOrder(data.orderID); },
    [captureOrder]
  );

  const handleError = useCallback((err: Record<string, unknown>) => {
    setLoading(false);
    setError(String(err?.message ?? "Payment error. Please try again."));
  }, []);

  const selectedPlan = PLANS.find((p) => p.key === selectedTier)!;

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
        .nx-paypal-tab-active {
          color: #00e5ff !important;
          border-bottom: 2px solid #00e5ff !important;
        }
        .nx-plan-active {
          border-color: rgba(0,229,255,0.6) !important;
          background: rgba(0,229,255,0.08) !important;
          color: #00e5ff !important;
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

              {/* Payment tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid rgba(122,106,154,0.12)" }}>
                {(["paypal", "card"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); }}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: tab === t ? "2px solid #00e5ff" : "2px solid transparent",
                      color: tab === t ? "#00e5ff" : "rgba(122,106,154,0.45)",
                      fontSize: 9,
                      letterSpacing: "3px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      marginBottom: -1,
                    }}
                  >
                    {t === "paypal" ? "◎ PAYPAL" : "▣ CARD"}
                  </button>
                ))}
              </div>

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

              {/* PayPal tab */}
              {tab === "paypal" && (
                <div>
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
                  <p style={{
                    fontSize: 9, fontFamily: "var(--font-mono)",
                    color: "rgba(122,106,154,0.4)", textAlign: "center",
                    letterSpacing: "1.5px",
                  }}>
                    You&apos;ll be redirected to PayPal to complete payment
                  </p>
                </div>
              )}

              {/* Card tab */}
              {tab === "card" && (
                <PayPalCardFieldsProvider
                  key={selectedTier}
                  createOrder={createOrder}
                  onApprove={handleCardApprove}
                  onError={handleError}
                  style={CARD_STYLE as any}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Card number */}
                    <div>
                      <label style={{ fontSize: 9, letterSpacing: "2px", fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)", display: "block", marginBottom: 6 }}>
                        CARD NUMBER
                      </label>
                      <PayPalNumberField
                        className="nx-card-field"
                        style={{
                          height: "44px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(124,58,237,0.25)",
                          background: "rgba(12,5,32,0.6)",
                        } as any}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label style={{ fontSize: 9, letterSpacing: "2px", fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)", display: "block", marginBottom: 6 }}>
                        CARDHOLDER NAME
                      </label>
                      <PayPalNameField
                        className="nx-card-field"
                        style={{
                          height: "44px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(124,58,237,0.25)",
                          background: "rgba(12,5,32,0.6)",
                        } as any}
                        placeholder="FULL NAME"
                      />
                    </div>

                    {/* Expiry + CVV */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: "2px", fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)", display: "block", marginBottom: 6 }}>
                          EXPIRY
                        </label>
                        <PayPalExpiryField
                          className="nx-card-field"
                          style={{
                            height: "44px",
                            padding: "0 14px",
                            borderRadius: "10px",
                            border: "1px solid rgba(124,58,237,0.25)",
                            background: "rgba(12,5,32,0.6)",
                          } as any}
                          placeholder="MM / YY"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 9, letterSpacing: "2px", fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)", display: "block", marginBottom: 6 }}>
                          CVV
                        </label>
                        <PayPalCVVField
                          className="nx-card-field"
                          style={{
                            height: "44px",
                            padding: "0 14px",
                            borderRadius: "10px",
                            border: "1px solid rgba(124,58,237,0.25)",
                            background: "rgba(12,5,32,0.6)",
                          } as any}
                          placeholder="•••"
                        />
                      </div>
                    </div>

                    <CardSubmitButton
                      loading={loading}
                      setLoading={setLoading}
                      onError={(msg) => setError(msg)}
                    />
                  </div>
                </PayPalCardFieldsProvider>
              )}

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
