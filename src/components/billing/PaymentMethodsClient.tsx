"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type Stripe from "stripe";

// Card brand → display label + accent color
const BRAND_META: Record<string, { label: string; color: string }> = {
  visa:             { label: "VISA",       color: "#1a56ff" },
  mastercard:       { label: "MC",         color: "#eb001b" },
  amex:             { label: "AMEX",       color: "#007bc1" },
  discover:         { label: "DISC",       color: "#ff6600" },
  diners:           { label: "DINERS",     color: "#a0a0a0" },
  jcb:              { label: "JCB",        color: "#00a650" },
  unionpay:         { label: "UNION",      color: "#d6000c" },
  unknown:          { label: "CARD",       color: "#7a6a9a" },
};

function CardBadge({ brand }: { brand: string }) {
  const meta = BRAND_META[brand] ?? BRAND_META.unknown;
  return (
    <span
      className="inline-flex items-center justify-center text-[9px] font-black tracking-[1.5px] px-2 py-1 rounded"
      style={{
        background: `${meta.color}22`,
        border: `1px solid ${meta.color}55`,
        color: meta.color,
        fontFamily: "var(--font-mono)",
        minWidth: 40,
      }}
    >
      {meta.label}
    </span>
  );
}

function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  loading,
  last4,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  last4: string;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-2xl p-6 text-center"
          style={{
            background: "rgba(8,4,26,0.98)",
            border: "1px solid rgba(239,68,68,0.3)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          }}
        >
          <div className="h-px mb-6 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div
            className="text-[10px] tracking-[3px] uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.6)" }}
          >
            ◈ REMOVE CARD
          </div>
          <p
            className="text-[14px] text-[#e2d9f3] mb-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Remove card ending in <span className="text-white font-bold">{last4}</span>?
          </p>
          <p
            className="text-[12px] text-[#7a6a9a] italic mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg border border-purple-700/30 text-[10px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 transition-all disabled:opacity-40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              KEEP IT
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg border border-red-500/40 text-[10px] tracking-[2px] text-red-400 hover:bg-red-500/8 transition-all disabled:opacity-40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "REMOVING..." : "REMOVE"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface PaymentMethodsClientProps {
  initialMethods: PaymentMethod[];
  initialDefaultId: string | null;
  justAdded: boolean;
}

export function PaymentMethodsClient({
  initialMethods,
  initialDefaultId,
  justAdded,
}: PaymentMethodsClientProps) {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [defaultId, setDefaultId] = useState<string | null>(initialDefaultId);
  const [addingCard, setAddingCard] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(justAdded ? "New card added successfully." : null);

  const handleAddCard = async () => {
    setAddingCard(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/payment-methods/setup", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not start setup.");
        setAddingCard(false);
      }
    } catch {
      setError("Network error. Try again.");
      setAddingCard(false);
    }
  };

  const handleDelete = async (pmId: string) => {
    setDeletingId(pmId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/payment-methods", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: pmId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Could not remove card.");
      } else {
        setMethods((prev) => prev.filter((m) => m.id !== pmId));
        if (defaultId === pmId) setDefaultId(null);
        setSuccessMsg("Card removed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleSetDefault = async (pmId: string) => {
    setSettingDefaultId(pmId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/payment-methods/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: pmId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Could not set default.");
      } else {
        setDefaultId(pmId);
        setSuccessMsg("Default payment method updated.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const confirmTarget = confirmId ? methods.find((m) => m.id === confirmId) : null;

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Toast messages */}
      {successMsg && (
        <div
          className="px-4 py-3 rounded-xl text-[12px] flex items-center gap-2"
          style={{
            border: "1px solid rgba(0,229,255,0.3)",
            background: "rgba(0,229,255,0.06)",
            color: "#00e5ff",
            fontFamily: "var(--font-body)",
          }}
        >
          <span style={{ fontSize: 14 }}>✓</span>
          {successMsg}
          <button
            onClick={() => setSuccessMsg(null)}
            className="ml-auto text-cyan-400/50 hover:text-cyan-400 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-[12px]"
          style={{
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.06)",
            color: "#f87171",
            fontFamily: "var(--font-body)",
          }}
        >
          {error}
        </div>
      )}

      {/* Saved methods */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(12,5,32,0.7)" }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
          <span
            className="text-[10px] tracking-[3px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            ◈ SAVED CARDS · {methods.length}
          </span>
        </div>

        {methods.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-3xl mb-3 opacity-30">◇</div>
            <p
              className="text-[13px] text-[#7a6a9a] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No saved cards yet. Add one below.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {methods.map((pm) => {
              const card = pm.card!;
              const isDefault = pm.id === defaultId;
              const isDeleting = deletingId === pm.id;
              const isSettingDef = settingDefaultId === pm.id;
              const expiry = `${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year).slice(-2)}`;

              return (
                <div
                  key={pm.id}
                  className="px-5 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.015]"
                >
                  <CardBadge brand={card.brand} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] text-[#e2d9f3] tabular-nums tracking-widest"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        ···· {card.last4}
                      </span>
                      {isDefault && (
                        <span
                          className="text-[7px] tracking-[2px] px-1.5 py-0.5 rounded-full"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "#00e5ff",
                            background: "rgba(0,229,255,0.1)",
                            border: "1px solid rgba(0,229,255,0.3)",
                          }}
                        >
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                    >
                      Expires {expiry}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isDefault && (
                      <button
                        onClick={() => handleSetDefault(pm.id)}
                        disabled={isSettingDef || isDeleting}
                        className="px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] transition-all disabled:opacity-30 hover:border-cyan-400/40 hover:text-cyan-400"
                        style={{
                          fontFamily: "var(--font-mono)",
                          border: "1px solid rgba(122,106,154,0.25)",
                          color: "rgba(122,106,154,0.8)",
                        }}
                      >
                        {isSettingDef ? "..." : "SET DEFAULT"}
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmId(pm.id)}
                      disabled={isDeleting || isSettingDef}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 hover:border-red-500/50 hover:text-red-400"
                      style={{
                        fontFamily: "var(--font-mono)",
                        border: "1px solid rgba(122,106,154,0.2)",
                        color: "rgba(122,106,154,0.5)",
                      }}
                      aria-label="Remove card"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add card button */}
        <div className="px-5 py-4 border-t border-white/[0.04]">
          <button
            onClick={handleAddCard}
            disabled={addingCard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:border-cyan-400/40 hover:text-cyan-400 hover:bg-cyan-400/5 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(122,106,154,0.25)",
              color: "rgba(122,106,154,0.8)",
              fontSize: 10,
              letterSpacing: "2px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {addingCard ? "REDIRECTING TO STRIPE..." : "ADD NEW CARD"}
          </button>
        </div>
      </div>

      {/* Security info */}
      <div
        className="rounded-xl px-5 py-4 flex items-start gap-4"
        style={{
          border: "1px solid rgba(124,58,237,0.15)",
          background: "rgba(8,4,26,0.5)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(0,229,255,0.5)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 mt-0.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div>
          <div
            className="text-[10px] tracking-[2px] uppercase mb-1"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            SECURED BY STRIPE
          </div>
          <p
            className="text-[11px] italic leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}
          >
            Your card details are tokenised and stored by Stripe. Nexcor never
            sees or stores your raw card number. All connections are 256-bit TLS
            encrypted.
          </p>
        </div>
      </div>

      {/* Portal fallback for PayPal / invoices */}
      <ManageViaPortal />

      <ConfirmDeleteModal
        open={confirmId !== null}
        last4={confirmTarget?.card?.last4 ?? ""}
        loading={deletingId === confirmId}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function ManageViaPortal() {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center pt-2">
      <p
        className="text-[11px] text-[#5a4a7a] italic mb-3"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Want to manage PayPal, view invoices, or update billing info?
      </p>
      <button
        onClick={openPortal}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl text-[10px] tracking-[2px] transition-all hover:border-purple-500/40 hover:text-[#a78bfa] disabled:opacity-40"
        style={{
          fontFamily: "var(--font-mono)",
          border: "1px solid rgba(122,106,154,0.2)",
          color: "rgba(122,106,154,0.6)",
        }}
      >
        {loading ? "OPENING..." : "◈ OPEN STRIPE PORTAL →"}
      </button>
    </div>
  );
}
