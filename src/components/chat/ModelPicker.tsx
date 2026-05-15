"use client";

import { useState } from "react";
import { MODELS, type ModelKey, getModelCost } from "@/lib/ai/modelConfig";

interface ModelPickerProps {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
  isSubscriber: boolean;
  currentBalance: number;
}

export function ModelPicker({ value, onChange, isSubscriber, currentBalance }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const current = MODELS[value];
  const currentCost = getModelCost(value, isSubscriber);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white transition-all"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: current.accentColor, boxShadow: `0 0 5px ${current.accentColor}` }}
        />
        <span>{current.label}</span>
        {currentCost > 0 && (
          <span className="text-slate-500">· {currentCost}⟡</span>
        )}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full right-0 mt-1.5 z-50 w-60 rounded-xl overflow-hidden shadow-xl"
            style={{ background: "#1a1d28", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(Object.keys(MODELS) as ModelKey[]).map((key) => {
              const m = MODELS[key];
              const cost = getModelCost(key, isSubscriber);
              const insufficient = cost > currentBalance;
              const active = key === value;

              return (
                <button
                  key={key}
                  onClick={() => { onChange(key); setOpen(false); }}
                  disabled={insufficient}
                  className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition ${
                    active ? "bg-purple-700/15" : "hover:bg-white/5"
                  } ${insufficient ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: m.accentColor, boxShadow: `0 0 6px ${m.accentColor}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-200">{m.label}</span>
                      <span className="text-[11px] flex-shrink-0">
                        {cost === 0 ? (
                          <span className="text-green-400 font-medium">FREE</span>
                        ) : (
                          <span className={insufficient ? "text-red-400" : "text-slate-400"}>
                            {cost}⟡
                            {isSubscriber && cost < MODELS[key].costStandard && (
                              <span className="ml-1 text-purple-400 text-[9px]">-sub</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{m.description}</p>
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
