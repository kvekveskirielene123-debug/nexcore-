"use client";

import { useState } from "react";
import Link from "next/link";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

interface BillingClientProps {
  transactions: Transaction[];
  marksBalance: number;
  /** ISO string of subscription expiry, or null if not subscribed. */
  subscriptionExpiresAt: string | null;
  /** Whether the subscription is set to cancel at period end. */
  cancelAtPeriodEnd: boolean;
}

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRelative(iso: string): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "just now";
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}

function humanizeReason(reason: string): string {
  const map: Record<string, string> = {
    signup_bonus: "Signup bonus",
    daily_login: "Daily login bonus",
    ad_watch: "Watched an ad",
    chat_haiku: "Chat · Haiku",
    chat_sonnet: "Chat · Sonnet",
    chat_opus: "Chat · Opus",
    pack_small: "Marks purchase · Small (500 ⟡)",
    pack_medium: "Marks purchase · Medium (1,200 ⟡)",
    pack_large: "Marks purchase · Large (3,000 ⟡)",
    refund_api_error: "Refund · API error",
    admin_grant: "Manual grant",
    subscription_bonus: "Subscription bonus",
  };
  return map[reason] ?? reason.replace(/_/g, " ");
}

function reasonCategory(reason: string): "credit" | "debit" | "refund" {
  if (reason.startsWith("chat_")) return "debit";
  if (reason.startsWith("refund_")) return "refund";
  return "credit";
}

export function BillingClient({
  transactions,
  marksBalance,
  subscriptionExpiresAt,
  cancelAtPeriodEnd,
}: BillingClientProps) {
  const [page, setPage] = useState(1);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(cancelAtPeriodEnd);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const usdValue = (marksBalance * 0.004).toFixed(2);

  const isSubscribed =
    subscriptionExpiresAt !== null &&
    new Date(subscriptionExpiresAt) > new Date();

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/settings/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? "Could not open billing portal.");
        setPortalLoading(false);
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setPortalError(err.message ?? "Network error.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ── Subscription status card ── */}
      {isSubscribed ? (
        <div className="rounded-xl border border-cyan-400/25 bg-[#0c0520]/70 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div
                className="text-[9px] tracking-[3px] text-cyan-400/60 uppercase mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ SUBSCRIPTION STATUS
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: cancelled ? "#f59e0b" : "#00e5ff",
                    boxShadow: cancelled
                      ? "0 0 8px rgba(245,158,11,0.5)"
                      : "0 0 8px rgba(0,229,255,0.5)",
                  }}
                />
                <span
                  className="text-[16px] font-bold tracking-[2px] text-white uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {cancelled ? "CANCELLING" : "◈ BRILLIANT · ACTIVE"}
                </span>
              </div>
              <p
                className="text-[12px] text-[#a78bfa] italic mt-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {cancelled
                  ? `Access ends on ${formatDateShort(subscriptionExpiresAt!)}. No further charges.`
                  : `Renews on ${formatDateShort(subscriptionExpiresAt!)}.`}
              </p>
            </div>

            {!cancelled && (
              <button
                onClick={() => setCancelOpen(true)}
                className="px-4 py-2 rounded-lg border border-red-500/25 text-[10px] tracking-[2px] text-red-400/80 hover:border-red-500/50 hover:text-red-400 transition-all self-start"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL SUBSCRIPTION
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Not subscribed — upsell card */
        <div className="rounded-xl border border-purple-700/20 bg-[#0c0520]/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div
                className="text-[9px] tracking-[3px] text-[#7a6a9a] uppercase mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ SUBSCRIPTION STATUS
              </div>
              <span
                className="text-[15px] font-bold tracking-[2px] text-[#a78bfa] uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FREE TIER
              </span>
              <p
                className="text-[12px] text-[#7a6a9a] italic mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Upgrade to unlock unlimited personas, model discounts, and more.
              </p>
            </div>
            <Link
              href="/subscribe"
              className="px-5 py-2.5 rounded-lg border border-cyan-400/40 text-[10px] tracking-[3px] text-cyan-400 font-bold hover:bg-cyan-400/8 hover:shadow-[0_0_16px_rgba(0,229,255,0.3)] transition-all whitespace-nowrap"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ UPGRADE →
            </Link>
          </div>
        </div>
      )}

      {/* ── Marks balance card ── */}
      <div className="rounded-xl border border-cyan-400/20 bg-[#0c0520]/70 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div
              className="text-[9px] tracking-[3px] text-[#00e5ff]/50 uppercase mb-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ MARKS BALANCE
            </div>
            <div
              className="text-[36px] font-black"
              style={{
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
                textShadow: "0 0 24px rgba(0,229,255,0.35)",
              }}
            >
              {marksBalance.toLocaleString()} ⟡
            </div>
            <div
              className="text-[11px] text-[#7a6a9a] italic mt-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ≈ ${usdValue} of premium messages
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/store"
              className="px-5 py-2.5 rounded-lg bg-cyan-400 text-black font-bold text-[10px] tracking-[3px] text-center hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ⟡ BUY MARKS →
            </Link>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="px-5 py-2.5 rounded-lg border border-purple-700/30 text-[10px] tracking-[2px] text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {portalLoading ? "OPENING..." : "◈ MANAGE PAYMENT METHODS →"}
            </button>
          </div>
        </div>
        {portalError && (
          <p className="text-[11px] text-red-400 mt-3" style={{ fontFamily: "var(--font-body)" }}>
            {portalError}
          </p>
        )}
      </div>

      {/* ── Transaction history ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div
            className="text-[10px] tracking-[3px] text-[#00e5ff]/50 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ TRANSACTION HISTORY
          </div>
          <span
            className="text-[10px] tracking-[1.5px] text-[#7a6a9a]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {transactions.length} total
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-xl border border-purple-700/15 bg-[#0c0520]/50 p-8 text-center">
            <p className="text-[13px] text-[#a78bfa] italic" style={{ fontFamily: "var(--font-body)" }}>
              No transactions yet. Start chatting to see your Marks history here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-purple-700/15 bg-[#0c0520]/60 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            <div
              className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 px-5 py-3 border-b border-purple-700/15 text-[8px] tracking-[2px] text-[#7a6a9a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span>Date</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Balance</span>
            </div>

            <div className="divide-y divide-purple-700/10">
              {paginated.map((tx) => {
                const cat = reasonCategory(tx.reason);
                const positive = tx.amount > 0;
                const amountColor = cat === "refund" ? "#22d3ee" : positive ? "#00e5ff" : "#a78bfa";

                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 px-5 py-3.5 hover:bg-cyan-400/3 transition-colors items-center"
                  >
                    <div>
                      <div
                        className="text-[11px] text-[#c0b8d8]"
                        style={{ fontFamily: "var(--font-body)" }}
                        title={formatDate(tx.created_at)}
                      >
                        {formatRelative(tx.created_at)}
                      </div>
                      <div
                        className="text-[9px] text-[#7a6a9a] mt-0.5 hidden sm:block"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatDate(tx.created_at)}
                      </div>
                    </div>

                    <div
                      className="text-[12px] text-[#e2d9f3] truncate"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {humanizeReason(tx.reason)}
                      {cat === "refund" && (
                        <span
                          className="ml-2 text-[8px] tracking-[1.5px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 px-1.5 py-0.5 rounded"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          REFUND
                        </span>
                      )}
                    </div>

                    <div
                      className="text-[13px] font-bold text-right tabular-nums"
                      style={{ fontFamily: "var(--font-mono)", color: amountColor }}
                    >
                      {positive ? "+" : ""}{tx.amount.toLocaleString()} ⟡
                    </div>

                    <div
                      className="text-[11px] text-right text-[#7a6a9a] tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {tx.balance_after.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-purple-700/15">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-purple-700/25 text-[10px] tracking-[2px] text-[#a78bfa] disabled:opacity-30 hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ← PREV
                </button>
                <span className="text-[10px] tracking-[2px] text-[#7a6a9a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-purple-700/25 text-[10px] tracking-[2px] text-[#a78bfa] disabled:opacity-30 hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  NEXT →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p
        className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
      </p>

      <CancelSubscriptionDialog
        open={cancelOpen}
        expiresAt={subscriptionExpiresAt}
        onClose={() => setCancelOpen(false)}
        onCancelled={() => setCancelled(true)}
      />
    </div>
  );
}
