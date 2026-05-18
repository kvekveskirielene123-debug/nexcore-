"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  balance_after: number;
  created_at: string;
  payment_session_id?: string | null;
}

interface BillingClientProps {
  transactions: Transaction[];
  marksBalance: number;
  subscriptionExpiresAt: string | null;
}

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
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
    daily_bonus: "Daily bonus",
    ad_watch: "Watched an ad",
    chat_haiku: "Chat · Haiku",
    chat_sonnet: "Chat · Sonnet",
    chat_opus: "Chat · Opus",
    pack_small: "Marks purchase · Starter (500 ⟡)",
    pack_medium: "Marks purchase · Standard (1,200 ⟡)",
    pack_large: "Marks purchase · Elite (3,000 ⟡)",
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

function exportCsv(transactions: Transaction[]) {
  const header = ["Date", "Description", "Amount (⟡)", "Balance After", "Transaction ID"];
  const rows = transactions.map((tx) => [
    new Date(tx.created_at).toISOString(),
    humanizeReason(tx.reason),
    tx.amount.toString(),
    tx.balance_after.toString(),
    tx.id,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexcor-marks-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BillingClient({
  transactions,
  marksBalance,
  subscriptionExpiresAt,
}: BillingClientProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const usdValue = (marksBalance * 0.004).toFixed(2);

  const isSubscribed =
    subscriptionExpiresAt !== null && new Date(subscriptionExpiresAt) > new Date();

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Subscription card ── */}
      {isSubscribed ? (
        <div
          className="rounded-2xl relative overflow-hidden p-6"
          style={{ border: "1px solid rgba(0,229,255,0.25)", background: "rgba(12,5,32,0.7)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div
                className="text-[9px] tracking-[3px] uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
              >
                ◈ SUBSCRIPTION STATUS
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.6)" }}
                />
                <span
                  className="text-[16px] font-bold tracking-[2px] text-white uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ◈ BRILLIANT · ACTIVE
                </span>
              </div>
              <p
                className="text-[12px] italic"
                style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.8)" }}
              >
                {`Access until ${formatDateShort(subscriptionExpiresAt!)}.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl relative overflow-hidden p-6"
          style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(12,5,32,0.5)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div
                className="text-[9px] tracking-[3px] uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
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
                className="text-[12px] italic mt-1"
                style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}
              >
                Unlock discounts, unlimited personas, and more.
              </p>
            </div>
            <Link
              href="/subscribe"
              className="px-5 py-2.5 rounded-xl text-[10px] tracking-[3px] font-bold transition-all whitespace-nowrap hover:shadow-[0_0_16px_rgba(0,229,255,0.3)]"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(0,229,255,0.4)",
                color: "#00e5ff",
              }}
            >
              ◈ GO BRILLIANT →
            </Link>
          </div>
        </div>
      )}

      {/* ── Marks balance + quick actions ── */}
      <div
        className="rounded-2xl relative overflow-hidden p-6"
        style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(12,5,32,0.7)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div
              className="text-[9px] tracking-[3px] uppercase mb-2"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
            >
              ◈ MARKS BALANCE
            </div>
            <div
              className="text-[40px] font-black leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
                textShadow: "0 0 28px rgba(0,229,255,0.4)",
              }}
            >
              {marksBalance.toLocaleString()} ⟡
            </div>
            <div
              className="text-[11px] italic mt-1"
              style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}
            >
              ≈ ${usdValue} of premium messages
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/store"
              className="px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-[3px] text-center transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              style={{
                fontFamily: "var(--font-mono)",
                background: "#00e5ff",
                color: "#000",
              }}
            >
              ⟡ BUY MARKS →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Transaction history ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div
            className="text-[10px] tracking-[3px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
          >
            ◈ TRANSACTION HISTORY
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] tracking-[1.5px]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
            >
              {transactions.length} entries
            </span>
            {transactions.length > 0 && (
              <button
                onClick={() => exportCsv(transactions)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] tracking-[2px] transition-all hover:border-cyan-400/40 hover:text-cyan-400"
                style={{
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(122,106,154,0.2)",
                  color: "rgba(122,106,154,0.7)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                EXPORT CSV
              </button>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ border: "1px solid rgba(124,58,237,0.15)", background: "rgba(12,5,32,0.5)" }}
          >
            <p
              className="text-[13px] italic"
              style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.7)" }}
            >
              No transactions yet. Start chatting to see your Marks history here.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ border: "1px solid rgba(124,58,237,0.15)", background: "rgba(12,5,32,0.6)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            {/* Header row */}
            <div
              className="grid gap-3 px-5 py-3 border-b border-white/[0.04] text-[8px] tracking-[2px] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(122,106,154,0.6)",
                gridTemplateColumns: "1fr 2fr auto auto",
              }}
            >
              <span>Date</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Balance</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.03]">
              {paginated.map((tx) => {
                const cat = reasonCategory(tx.reason);
                const positive = tx.amount > 0;
                const amountColor = cat === "refund" ? "#22d3ee" : positive ? "#00e5ff" : "rgba(167,139,250,0.8)";

                return (
                  <div
                    key={tx.id}
                    className="grid gap-3 px-5 py-3.5 items-center transition-colors hover:bg-white/[0.015]"
                    style={{ gridTemplateColumns: "1fr 2fr auto auto" }}
                  >
                    <div>
                      <div
                        className="text-[11px]"
                        style={{ fontFamily: "var(--font-body)", color: "rgba(192,184,216,0.9)" }}
                        title={formatDate(tx.created_at)}
                      >
                        {formatRelative(tx.created_at)}
                      </div>
                      <div
                        className="text-[9px] mt-0.5 hidden sm:block"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                      >
                        {formatDate(tx.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[12px] truncate"
                        style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.9)" }}
                      >
                        {humanizeReason(tx.reason)}
                      </span>
                      {cat === "refund" && (
                        <span
                          className="flex-shrink-0 text-[7px] tracking-[1.5px] px-1.5 py-0.5 rounded"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "#22d3ee",
                            background: "rgba(34,211,238,0.1)",
                            border: "1px solid rgba(34,211,238,0.25)",
                          }}
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
                      className="text-[11px] text-right tabular-nums"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                    >
                      {tx.balance_after.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-4 border-t border-white/[0.04]"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-[10px] tracking-[2px] transition-all disabled:opacity-30 hover:border-cyan-400/40 hover:text-cyan-400"
                  style={{
                    fontFamily: "var(--font-mono)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "rgba(167,139,250,0.8)",
                  }}
                >
                  ← PREV
                </button>
                <span
                  className="text-[10px] tracking-[2px]"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                >
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-[10px] tracking-[2px] transition-all disabled:opacity-30 hover:border-cyan-400/40 hover:text-cyan-400"
                  style={{
                    fontFamily: "var(--font-mono)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "rgba(167,139,250,0.8)",
                  }}
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

    </div>
  );
}
