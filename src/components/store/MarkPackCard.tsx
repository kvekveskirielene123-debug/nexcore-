"use client";

import { useState } from "react";
import type { MarkPack } from "@/lib/ai/modelConfig";

interface MarkPackCardProps {
  pack: MarkPack;
}

export function MarkPackCard({ pack }: MarkPackCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marks/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all ${
        pack.best_value
          ? "border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_30px_rgba(0,229,255,0.08)]"
          : "border-purple-700/25 bg-[#0c0520]/80 hover:border-purple-500/40"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

      {pack.best_value && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-400 text-black text-[9px] tracking-[2px] font-bold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          BEST VALUE
        </span>
      )}

      <div
        className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        PACK · {pack.id.toUpperCase()}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-[42px] font-black text-cyan-400"
          style={{ fontFamily: "var(--font-display)", textShadow: "0 0 30px rgba(0,229,255,0.3)" }}
        >
          {pack.marks.toLocaleString()}
        </span>
        <span className="text-cyan-400/70 text-2xl">⟡</span>
      </div>

      <div
        className="text-[11px] tracking-[2px] text-[#a78bfa] mb-5 uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        MARKS
      </div>

      <div
        className="text-3xl font-black text-white mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {pack.priceLabel}
      </div>

      <button
        onClick={handleBuy}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-[11px] tracking-[3px] font-bold transition-all ${
          pack.best_value
            ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
            : "border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10"
        } disabled:opacity-50`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {loading ? "PROCESSING..." : "PURCHASE →"}
      </button>
    </div>
  );
}
