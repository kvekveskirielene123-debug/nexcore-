"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type ContentType = "character" | "post" | "comment" | "user" | "message";
type Reason = "spam" | "nsfw_unlabeled" | "harassment" | "misinformation" | "illegal" | "other";

const REASONS: { value: Reason; label: string }[] = [
  { value: "spam",           label: "Spam or bot" },
  { value: "nsfw_unlabeled", label: "NSFW — not labeled" },
  { value: "harassment",     label: "Harassment / hate speech" },
  { value: "misinformation", label: "Misinformation" },
  { value: "illegal",        label: "Illegal content" },
  { value: "other",          label: "Other" },
];

interface ReportButtonProps {
  contentType: ContentType;
  contentId: string;
  /** "icon" = small flag icon button | "row" = text link */
  variant?: "icon" | "row";
  className?: string;
}

export function ReportButton({ contentType, contentId, variant = "icon", className }: ReportButtonProps) {
  const [mounted,    setMounted]    = useState(false);
  const [open,       setOpen]       = useState(false);
  const [reason,     setReason]     = useState<Reason | "">("");
  const [details,    setDetails]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const reset = () => {
    setOpen(false); setDone(false); setReason(""); setDetails(""); setError(null);
  };

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, content_id: contentId, reason, details }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit."); setSubmitting(false); return; }
      setDone(true);
      setTimeout(reset, 2200);
    } catch {
      setError("Network error."); setSubmitting(false);
    }
  };

  const FlagIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );

  const trigger = variant === "row" ? (
    <button
      onClick={() => setOpen(true)}
      className={className}
      style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body, sans-serif)", fontSize: 12, color: "rgba(239,68,68,0.55)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.9)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.55)"; }}
    >
      <FlagIcon /> Report
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      title={`Report this ${contentType}`}
      className={className}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", color: "rgba(122,106,154,0.4)", transition: "all 0.15s" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(239,68,68,0.7)"; el.style.background = "rgba(239,68,68,0.08)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(122,106,154,0.4)"; el.style.background = "transparent"; }}
    >
      <FlagIcon />
    </button>
  );

  const modal = (
    <>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)", zIndex: 9998 }}
        onClick={() => !submitting && reset()}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 9999, width: 420, maxWidth: "95vw",
        background: "#0c0520", border: "1px solid rgba(239,68,68,0.22)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
      }}>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.55),transparent)" }} />
        <div style={{ padding: "24px 24px 22px" }}>

          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, letterSpacing: 3, color: "rgba(239,68,68,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
            ◈ SUBMIT REPORT
          </p>
          <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            Report this {contentType}
          </h3>
          <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 12, color: "rgba(167,139,250,0.5)", marginBottom: 20 }}>
            Reports are reviewed by our moderation team within 24 hours.
          </p>

          {done ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 30, color: "#00e5ff", marginBottom: 10 }}>✓</div>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: 3, color: "#00e5ff", textTransform: "uppercase" }}>REPORT SUBMITTED</p>
              <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 12, color: "rgba(167,139,250,0.5)", marginTop: 6 }}>Thank you for helping keep Nexcor safe.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {REASONS.map(r => (
                  <label key={r.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, border: `1px solid ${reason === r.value ? "rgba(239,68,68,0.4)" : "rgba(124,58,237,0.13)"}`, background: reason === r.value ? "rgba(239,68,68,0.07)" : "transparent", transition: "all 0.15s" }}>
                    <input type="radio" name={`report-reason-${contentId}`} value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} style={{ accentColor: "#ef4444", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 13, color: reason === r.value ? "#fff" : "rgba(226,217,243,0.65)" }}>{r.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Additional context (optional) · 500 chars max"
                maxLength={500}
                rows={3}
                style={{
                  width: "100%", resize: "none", boxSizing: "border-box",
                  background: "rgba(5,2,13,0.8)", border: "1px solid rgba(124,58,237,0.18)",
                  borderRadius: 8, padding: "10px 12px", color: "#e2d9f3",
                  fontFamily: "var(--font-body, sans-serif)", fontSize: 13,
                  outline: "none", marginBottom: error ? 8 : 16,
                }}
              />

              {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12, fontFamily: "var(--font-body, sans-serif)" }}>{error}</p>}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={reset}
                  disabled={submitting}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid rgba(124,58,237,0.18)", background: "transparent", color: "rgba(167,139,250,0.55)", fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none", background: reason && !submitting ? "rgba(239,68,68,0.82)" : "rgba(239,68,68,0.18)", color: reason && !submitting ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: 2, cursor: reason && !submitting ? "pointer" : "default", fontWeight: 700, textTransform: "uppercase" }}
                >
                  {submitting ? "Submitting…" : "◈ Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {trigger}
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
