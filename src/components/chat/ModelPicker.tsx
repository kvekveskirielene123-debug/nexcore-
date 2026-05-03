"use client";

import { useState } from "react";
import { MODELS, type ModelKey, getModelCost } from "@/lib/ai/modelConfig";

interface ModelPickerProps {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
  isSubscriber: boolean;
  currentBalance: number;
}

export function ModelPicker({
  value,
  onChange,
  isSubscriber,
  currentBalance,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const current = MODELS[value];
  const currentCost = getModelCost(value, isSubscriber);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-purple-700/25 bg-[#08041a] text-[10px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 transition-all"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: current.accentColor, boxShadow: `0 0 6px ${current.accentColor}` }}
        />
        {current.label}
        {currentCost > 0 && (
          <span className="text-[9px] text-[#7a6a9a]">· {currentCost}⟡</span>
        )}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-64 rounded-xl border border-purple-700/30 bg-[#0c0520]/95 backdrop-blur-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
            {(Object.keys(MODELS) as ModelKey[]).map((key) => {
              const m = MODELS[key];
              const cost = getModelCost(key, isSubscriber);
              const insufficient = cost > currentBalance;
              const active = key === value;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  disabled={insufficient}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                    active ? "bg-cyan-400/5" : "hover:bg-purple-900/20"
                  } ${insufficient ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      background: m.accentColor,
                      boxShadow: `0 0 8px ${m.accentColor}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] tracking-[2px] text-white"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {m.label}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {cost === 0 ? (
                          <span className="text-cyan-400">FREE</span>
                        ) : (
                          <span className={insufficient ? "text-red-400" : "text-[#a78bfa]"}>
                            {cost}⟡
                            {isSubscriber && cost < MODELS[key].costStandard && (
                              <span className="ml-1 text-cyan-400/70 text-[9px]">-SUB</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                    <p
                      className="text-[10px] text-[#7a6a9a] italic mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
