"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MarksWidgetProps {
  initialBalance: number;
}

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

interface DailyStatus {
  available: boolean;
  next_available_at: string | null;
}

function formatRelative(iso: string): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "just now";
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatCountdown(target: string): string {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return "soon";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${h}h ${m}m`;
}

function humanizeReason(reason: string): string {
  const map: Record<string, string> = {
    signup_bonus: "Signup bonus",
    daily_login: "Daily login bonus",
    ad_watch: "Watched an ad",
    chat_haiku: "Haiku message",
    chat_sonnet: "Sonnet message",
    chat_opus: "Opus message",
    pack_small: "Pack purchase · Small",
    pack_medium: "Pack purchase · Medium",
    pack_large: "Pack purchase · Large",
    refund_api_error: "Refund (API error)",
    admin_grant: "Manual grant",
  };
  return map[reason] ?? reason;
}

export function MarksWidget({ initialBalance }: MarksWidgetProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Pull daily-bonus status on mount
  useEffect(() => {
    fetch("/api/marks/claim-daily")
      .then((r) => r.json())
      .then((d) =>
        setDailyStatus({
          available: !!d.available,
          next_available_at: d.next_available_at ?? null,
        })
      )
      .catch(() => null);
  }, []);

  const loadTxs = async () => {
    setLoadingTxs(true);
    try {
      // No dedicated endpoint — fetch via Supabase RLS-protected select.
      // For Phase 1 we use a small inline fetch to a dedicated endpoint,
      // but to avoid building a new route, we read via the supabase client.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("mark_transactions")
        .select("id, amount, reason, balance_after, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setTxs((data ?? []) as Transaction[]);
    } catch {
      // ignore
    } finally {
      setLoadingTxs(false);
    }
  };

  const claimDaily = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/marks/claim-daily", { method: "POST" });
      const d = await res.json();
      if (d.claimed && typeof d.new_balance === "number") {
        setBalance(d.new_balance);
        setDailyStatus({
          available: false,
          next_available_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        if (showHistory) loadTxs();
      } else if (!d.claimed && d.next_available_at) {
        setDailyStatus({ available: false, next_available_at: d.next_available_at });
      }
    } catch {
      // ignore
    } finally {
      setClaiming(false);
    }
  };

  // ⟡ value approximation: 10 Marks = 1 Sonnet message. Sonnet value approx
  // = $0.015 per message (cost) but purchase value is closer to $0.024.
  // Using $0.005 / Mark as a "rough purchase value" — easier to grok.
  const usdValue = (balance * 0.004).toFixed(2);

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Big balance */}
      <div className="text-center">
        <div
          className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ⟡ MARKS BALANCE
        </div>
        <div
          className="text-[44px] font-black mt-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "#00e5ff",
            textShadow: "0 0 30px rgba(0,229,255,0.35)",
            letterSpacing: "1px",
          }}
        >
          {balance.toLocaleString()} ⟡
        </div>
        <div
          className="text-[11px] text-[#7a6a9a] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ≈ ${usdValue} of premium messages
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <Link
          href="/store"
          className="flex-1 text-center py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ⟡ BUY MORE MARKS →
        </Link>

        {dailyStatus?.available ? (
          <button
            onClick={claimDaily}
            disabled={claiming}
            className="flex-1 py-3 rounded-lg border border-cyan-400/40 text-cyan-400 text-[11px] tracking-[3px] font-bold hover:bg-cyan-400/8 transition-all disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              background:
                "linear-gradient(90deg, rgba(0,229,255,0.06), rgba(124,58,237,0.06))",
            }}
          >
            {claiming ? "CLAIMING..." : "✦ CLAIM DAILY · +50"}
          </button>
        ) : dailyStatus?.next_available_at ? (
          <div
            className="flex-1 py-3 rounded-lg border border-purple-700/20 text-[#7a6a9a] text-[11px] tracking-[2px] text-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXT CLAIM IN {formatCountdown(dailyStatus.next_available_at)}
          </div>
        ) : (
          <div
            className="flex-1 py-3 rounded-lg border border-purple-700/20 text-[#7a6a9a] text-[11px] tracking-[2px] text-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            CHECKING...
          </div>
        )}
      </div>

      {/* Transaction history toggle */}
      <button
        onClick={() => {
          const next = !showHistory;
          setShowHistory(next);
          if (next && txs.length === 0) loadTxs();
        }}
        className="w-full flex items-center justify-between text-[10px] tracking-[2px] text-[#7a6a9a] hover:text-cyan-400 transition-colors uppercase pt-2 border-t border-purple-700/15"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>◈ Recent activity</span>
        <span>{showHistory ? "▲" : "▼"}</span>
      </button>

      {showHistory && (
        <div className="space-y-1.5">
          {loadingTxs ? (
            <p
              className="text-[11px] text-[#7a6a9a] italic text-center py-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Loading...
            </p>
          ) : txs.length === 0 ? (
            <p
              className="text-[11px] text-[#7a6a9a] italic text-center py-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No transactions yet.
            </p>
          ) : (
            txs.map((tx) => {
              const positive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-[12px] py-1.5 px-2 rounded-md hover:bg-purple-900/10"
                >
                  <span
                    className={`font-bold w-16 ${
                      positive ? "text-cyan-400" : "text-[#a78bfa]"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {positive ? "+" : ""}
                    {tx.amount}
                  </span>
                  <span
                    className="flex-1 truncate text-[#c0b8d8] mx-3"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {humanizeReason(tx.reason)}
                  </span>
                  <span
                    className="text-[#7a6a9a] text-[10px] flex-shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatRelative(tx.created_at)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
