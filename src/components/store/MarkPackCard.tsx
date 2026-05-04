"use client";

import { useState } from "react";
import type { MarkPack } from "@/lib/ai/modelConfig";

const PACK_META: Record<string, { name: string; desc: string; accentRgb: string; tagLabel: string }> = {
  small:  { name: "STARTER",  desc: "Get in. Try the good stuff.", accentRgb: "124,58,237",  tagLabel: "STARTER"   },
  medium: { name: "STANDARD", desc: "The sweet spot.",             accentRgb: "167,139,250", tagLabel: "POPULAR"   },
  large:  { name: "ELITE",    desc: "Maximum value. Maximum fun.", accentRgb: "0,229,255",   tagLabel: "BEST VALUE" },
};

const MAX_MARKS_PER_DOLLAR = 250.2;

function ValueBar({ marksPerDollar, accentRgb }: { marksPerDollar: number; accentRgb: string }) {
  const pct = Math.min(100, (marksPerDollar / MAX_MARKS_PER_DOLLAR) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[8px] tracking-[2px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${accentRgb},0.6)` }}
        >
          VALUE RATIO
        </span>
        <span
          className="text-[9px] font-bold"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${accentRgb},0.9)` }}
        >
          {Math.round(marksPerDollar)} ⟡ / $
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: `rgba(${accentRgb},0.1)` }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, rgba(${accentRgb},0.5), rgba(${accentRgb},0.95))`,
            boxShadow: `0 0 8px rgba(${accentRgb},0.6)`,
          }}
        />
      </div>
    </div>
  );
}

interface MarkPackCardProps {
  pack: MarkPack;
  /** Called when user clicks Buy — parent opens the confirm modal. */
  onBuy?: () => void;
}

export function MarkPackCard({ pack, onBuy }: MarkPackCardProps) {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const meta = PACK_META[pack.id] ?? PACK_META.small;
  const marksPerDollar = pack.marks / pack.priceUsd;
  const a = meta.accentRgb;
  const isBest = pack.best_value;

  const haikuMsgs  = Math.floor(pack.marks / 3);
  const sonnetMsgs = Math.floor(pack.marks / 10);
  const opusMsgs   = Math.floor(pack.marks / 25);

  const handleBuy = () => {
    if (onBuy) { onBuy(); return; }
    // Fallback direct purchase (when used standalone without parent modal)
    setLoading(true);
    fetch("/api/marks/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId: pack.id }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.url) window.location.href = d.url; else setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        border: `1px solid rgba(${a}, ${hovered ? 0.55 : isBest ? 0.38 : 0.2})`,
        background: isBest
          ? `rgba(${a},0.05)`
          : "rgba(12,5,32,0.75)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 0 0 1px rgba(${a},0.15), 0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(${a},0.12)`
          : isBest
          ? `0 0 30px rgba(${a},0.08)`
          : "none",
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${a},${hovered ? 0.9 : 0.4}),transparent)` }}
      />

      {/* Scan line sweep on hover */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 animate-card-scan rounded-2xl"
          style={{
            background: `linear-gradient(to bottom, transparent 40%, rgba(${a},0.04) 50%, transparent 60%)`,
          }}
        />
      )}

      {/* Best value corner glow */}
      {isBest && (
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(${a},0.12) 0%, transparent 70%)` }}
        />
      )}

      {/* Tag badge */}
      <div className="px-5 pt-5 pb-0 flex items-center justify-between">
        <span
          className="text-[8px] tracking-[3px] uppercase px-2.5 py-1 rounded-full"
          style={{
            fontFamily: "var(--font-mono)",
            color: `rgba(${a},1)`,
            background: `rgba(${a},0.1)`,
            border: `1px solid rgba(${a},0.3)`,
          }}
        >
          {meta.tagLabel}
        </span>
        {isBest && (
          <span
            className="text-[8px] tracking-[2px]"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${a},0.5)` }}
          >
            ◈ TOP PICK
          </span>
        )}
      </div>

      {/* Central marks display */}
      <div className="px-5 pt-4 pb-3 text-center">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{
            background: `rgba(${a},0.08)`,
            border: `1px solid rgba(${a},0.25)`,
            boxShadow: hovered ? `0 0 20px rgba(${a},0.25)` : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          <span
            className="text-xl"
            style={{ color: `rgba(${a},1)`, filter: `drop-shadow(0 0 6px rgba(${a},0.8))` }}
          >
            ⟡
          </span>
        </div>

        {/* Pack name */}
        <div
          className="text-[9px] tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${a},0.5)` }}
        >
          {meta.name} PACK
        </div>

        {/* Marks number */}
        <div
          className="text-[52px] font-black leading-none mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: `rgba(${a},1)`,
            textShadow: `0 0 ${hovered ? "40px" : "20px"} rgba(${a},0.5)`,
            transition: "text-shadow 0.3s",
          }}
        >
          {pack.marks.toLocaleString()}
        </div>

        <div
          className="text-[10px] tracking-[4px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: `rgba(${a},0.4)` }}
        >
          MARKS
        </div>

        {/* Desc */}
        <p
          className="text-[11px] italic mt-2"
          style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.6)" }}
        >
          {meta.desc}
        </p>
      </div>

      {/* Divider */}
      <div
        className="mx-5 h-px"
        style={{ background: `rgba(${a},0.12)` }}
      />

      {/* Value bar + usage breakdown */}
      <div className="px-5 py-4 space-y-4">
        <ValueBar marksPerDollar={marksPerDollar} accentRgb={a} />

        {/* What you can do */}
        <div>
          <div
            className="text-[8px] tracking-[2px] uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)", color: `rgba(${a},0.45)` }}
          >
            WHAT YOU CAN DO
          </div>
          <div className="space-y-1.5">
            {[
              { label: "HAIKU",  msgs: haikuMsgs,  color: "124,58,237"  },
              { label: "SONNET", msgs: sonnetMsgs, color: "167,139,250" },
              { label: "OPUS",   msgs: opusMsgs,   color: "0,229,255"   },
            ].map(({ label, msgs, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span
                  className="text-[9px] tracking-[1.5px]"
                  style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.7)` }}
                >
                  {label}
                </span>
                <span
                  className="text-[9px] font-bold"
                  style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.9)` }}
                >
                  {msgs.toLocaleString()} msgs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-5 h-px"
        style={{ background: `rgba(${a},0.12)` }}
      />

      {/* Price + CTA */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-baseline gap-1.5 justify-center mb-4">
          <span
            className="text-[38px] font-black"
            style={{
              fontFamily: "var(--font-display)",
              color: "white",
              textShadow: hovered ? `0 0 20px rgba(${a},0.35)` : "none",
              transition: "text-shadow 0.3s",
            }}
          >
            {pack.priceLabel}
          </span>
          <span
            className="text-[10px] tracking-[2px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.7)" }}
          >
            USD
          </span>
        </div>

        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-[11px] tracking-[3px] font-bold transition-all duration-200 disabled:opacity-50"
          style={{
            fontFamily: "var(--font-mono)",
            background: isBest
              ? `rgba(${a},1)`
              : hovered
              ? `rgba(${a},0.15)`
              : `rgba(${a},0.08)`,
            color: isBest ? "#000" : `rgba(${a},1)`,
            border: `1px solid rgba(${a}, ${isBest ? 0 : 0.5})`,
            boxShadow: hovered
              ? `0 0 ${isBest ? "32px" : "16px"} rgba(${a},0.4)`
              : isBest
              ? `0 0 20px rgba(${a},0.2)`
              : "none",
          }}
        >
          {loading ? "PROCESSING..." : `◈ ACQUIRE ${pack.marks.toLocaleString()} MARKS →`}
        </button>
      </div>
    </div>
  );
}
