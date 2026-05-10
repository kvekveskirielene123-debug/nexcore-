"use client";

import { STEPS, type StepId } from "@/lib/create/types";

const STEP_COLORS: Record<number, { main: string; rgb: string }> = {
  1: { main: "#00e5ff", rgb: "0,229,255"   },
  2: { main: "#a78bfa", rgb: "167,139,250" },
  3: { main: "#60c8ff", rgb: "96,200,255"  },
  4: { main: "#fb923c", rgb: "251,146,60"  },
  5: { main: "#34d399", rgb: "52,211,153"  },
};

interface WizardProgressProps {
  currentStep: StepId;
  onJump?: (stepId: StepId) => void;
}

export function WizardProgress({ currentStep, onJump }: WizardProgressProps) {
  const fillPct = ((currentStep - 1) / (STEPS.length - 1)) * 80;
  const currentCol = STEP_COLORS[currentStep];

  return (
    <div className="relative mb-10 px-2">
      {/* ── Track ── */}
      {/* Base track */}
      <div
        className="absolute top-[15px] pointer-events-none"
        style={{
          left: "calc(10% + 14px)",
          right: "calc(10% + 14px)",
          height: 1,
          background: "rgba(124,58,237,0.14)",
        }}
      />
      {/* Filled glowing track */}
      <div
        className="absolute top-[15px] pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: "calc(10% + 14px)",
          height: 1,
          width: `calc(${fillPct}%)`,
          background: `linear-gradient(to right, #00e5ff, ${currentCol.main})`,
          boxShadow: `0 0 8px rgba(${currentCol.rgb},0.55)`,
        }}
      />

      {/* ── Steps ── */}
      <div className="flex items-start justify-between">
        {STEPS.map(step => {
          const col       = STEP_COLORS[step.id];
          const active    = currentStep === step.id;
          const done      = currentStep > step.id;
          const clickable = !!onJump && done;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(step.id as StepId)}
              className="flex flex-col items-center gap-2 flex-1"
              style={{ cursor: clickable ? "pointer" : "default" }}
              aria-current={active ? "step" : undefined}
            >
              {/* ── Node ── */}
              <div className="relative flex items-center justify-center" style={{ width: 30, height: 30 }}>

                {/* Outer glow halo — active only */}
                {active && (
                  <>
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ boxShadow: `0 0 0 4px rgba(${col.rgb},0.14)`, borderRadius: "50%" }}
                    />
                    <span
                      className="absolute rounded-full animate-ping pointer-events-none"
                      style={{
                        inset: -3,
                        background: `rgba(${col.rgb},0.18)`,
                        animationDuration: "1.7s",
                        borderRadius: "50%",
                      }}
                    />
                  </>
                )}

                {/* Done: faint outer ring */}
                {done && (
                  <span
                    className="absolute rounded-full pointer-events-none"
                    style={{ inset: -2, border: `1px solid ${col.main}`, opacity: 0.2, borderRadius: "50%" }}
                  />
                )}

                {/* Main node circle */}
                <span
                  className="relative z-10 flex items-center justify-center rounded-full transition-all duration-350"
                  style={{
                    width: 30,
                    height: 30,
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    fontWeight: 900,
                    background: done
                      ? col.main
                      : active
                      ? `rgba(${col.rgb},0.16)`
                      : "rgba(14,6,36,0.9)",
                    border: done
                      ? `2px solid ${col.main}`
                      : active
                      ? `2px solid ${col.main}`
                      : "2px solid rgba(124,58,237,0.2)",
                    color: done ? "#05020d" : active ? col.main : "rgba(122,106,154,0.38)",
                    boxShadow: active
                      ? `0 0 20px rgba(${col.rgb},0.65), 0 0 40px rgba(${col.rgb},0.22)`
                      : done
                      ? `0 0 12px rgba(${col.rgb},0.4)`
                      : "none",
                  }}
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    String(step.id).padStart(2, "0")
                  )}
                </span>
              </div>

              {/* ── Label ── */}
              <span
                className="hidden sm:block text-center leading-tight transition-all duration-300"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "1.5px",
                  color: active
                    ? col.main
                    : done
                    ? `rgba(${col.rgb},0.45)`
                    : "rgba(122,106,154,0.3)",
                  textShadow: active ? `0 0 10px rgba(${col.rgb},0.65)` : "none",
                }}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
