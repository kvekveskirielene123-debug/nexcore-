"use client";

import { useState, useEffect } from "react";

interface CancelSubscriptionDialogProps {
  open: boolean;
  expiresAt: string | null;
  onClose: () => void;
  onCancelled: () => void;
}

const REASONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_enough_usage", label: "I don't use it enough" },
  { value: "missing_feature", label: "Missing a feature I need" },
  { value: "going_to_competitor", label: "Going back to a competitor" },
  { value: "taking_a_break", label: "Just taking a break" },
  { value: "other", label: "Other" },
] as const;

type ReasonValue = (typeof REASONS)[number]["value"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CancelSubscriptionDialog({
  open,
  expiresAt,
  onClose,
  onCancelled,
}: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState<ReasonValue | null>(null);
  const [otherText, setOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(null);
      setOtherText("");
      setError(null);
      setSubmitting(false);
      setDone(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const canSubmit = reason !== null && (reason !== "other" || otherText.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          other_text: reason === "other" ? otherText.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not cancel. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setTimeout(() => {
        onCancelled();
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message ?? "Network error.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={submitting || done ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-purple-700/30 bg-[#0c0520] overflow-hidden relative my-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          {done ? (
            /* ── Done state ── */
            <div className="p-8 text-center space-y-4">
              <div
                className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ CANCELLATION CONFIRMED
              </div>
              <h2
                className="text-[20px] tracking-[2px] text-white uppercase"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                We're sorry to see you go.
              </h2>
              <p
                className="text-[13px] text-[#a78bfa] italic leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Your subscription is cancelled. You keep full access until{" "}
                <strong className="text-white">
                  {expiresAt ? formatDate(expiresAt) : "your billing period ends"}
                </strong>
                . Thank you for being part of Nexcor — Kurai & Big G appreciate you.
              </p>
              <p
                className="text-[9px] tracking-[3px] text-purple-500/30 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                SESTRA PROTOCOL · 324B21
              </p>
            </div>
          ) : (
            /* ── Survey state ── */
            <div className="p-6 space-y-5">
              <div className="text-center">
                <div
                  className="text-[9px] tracking-[3px] text-red-400/60 uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ◈ CANCEL SUBSCRIPTION
                </div>
                <h2
                  className="text-[18px] tracking-[2px] text-white uppercase"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Before you go...
                </h2>
                <p
                  className="text-[12px] text-[#a78bfa] italic mt-2 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Help us improve Nexcor. What's the main reason you're cancelling?
                </p>
              </div>

              {/* Survey options */}
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      reason === r.value
                        ? "border-cyan-400/50 bg-cyan-400/8 text-cyan-400"
                        : "border-purple-700/25 text-[#e2d9f3] hover:border-purple-500/50 hover:bg-purple-900/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                          reason === r.value
                            ? "border-cyan-400 bg-cyan-400"
                            : "border-purple-700/50"
                        }`}
                      >
                        {reason === r.value && (
                          <div className="w-full h-full rounded-full bg-[#0c0520] scale-50" />
                        )}
                      </div>
                      <span
                        className="text-[13px]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {r.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Other text box */}
              {reason === "other" && (
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell us what's on your mind..."
                  autoFocus
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-none"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              )}

              {expiresAt && (
                <p
                  className="text-[11px] text-[#7a6a9a] italic leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  ◈ You keep full access until{" "}
                  <span className="text-[#a78bfa]">{formatDate(expiresAt)}</span>.
                  No charges after that.
                </p>
              )}

              {error && (
                <div className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-[12px]">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  KEEP MY PLAN
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 py-3 rounded-lg border border-red-500/40 text-[11px] tracking-[2px] text-red-400 hover:bg-red-500/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {submitting ? "CANCELLING..." : "CONFIRM CANCEL"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
