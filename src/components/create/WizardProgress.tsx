"use client";

import { STEPS, type StepId } from "@/lib/create/types";

interface WizardProgressProps {
  currentStep: StepId;
  onJump?: (stepId: StepId) => void;
}

export function WizardProgress({ currentStep, onJump }: WizardProgressProps) {
  return (
    <div className="relative mb-10 px-2">
      {/* Connecting track */}
      <div
        className="absolute top-[13px] left-[calc(10%+10px)] right-[calc(10%+10px)] h-px pointer-events-none"
        style={{ background: "rgba(124,58,237,0.15)" }}
      />
      {/* Filled track up to current step */}
      <div
        className="absolute top-[13px] left-[calc(10%+10px)] h-px pointer-events-none transition-all duration-500"
        style={{
          background: "linear-gradient(to right, rgba(0,229,255,0.7), rgba(0,229,255,0.3))",
          width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 80}% )`,
          boxShadow: "0 0 8px rgba(0,229,255,0.4)",
        }}
      />

      <div className="flex items-start justify-between">
        {STEPS.map((step) => {
          const active = currentStep === step.id;
          const done = currentStep > step.id;
          const clickable = !!onJump && done;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(step.id)}
              className="flex flex-col items-center gap-2 flex-1"
              style={{ cursor: clickable ? "pointer" : "default" }}
              aria-current={active ? "step" : undefined}
            >
              {/* Node */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: 26, height: 26 }}
              >
                {/* Pulse ring on active */}
                {active && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background: "rgba(0,229,255,0.15)",
                      animationDuration: "1.8s",
                    }}
                  />
                )}
                <span
                  className="relative z-10 flex items-center justify-center rounded-full text-[9px] font-black transition-all duration-300"
                  style={{
                    width: 26,
                    height: 26,
                    fontFamily: "var(--font-mono)",
                    background: done
                      ? "#00e5ff"
                      : active
                      ? "rgba(0,229,255,0.15)"
                      : "rgba(20,8,50,0.8)",
                    border: done
                      ? "2px solid #00e5ff"
                      : active
                      ? "2px solid rgba(0,229,255,0.9)"
                      : "2px solid rgba(124,58,237,0.25)",
                    color: done ? "#05020d" : active ? "#00e5ff" : "rgba(122,106,154,0.5)",
                    boxShadow: active
                      ? "0 0 16px rgba(0,229,255,0.5), 0 0 32px rgba(0,229,255,0.2)"
                      : done
                      ? "0 0 10px rgba(0,229,255,0.3)"
                      : "none",
                  }}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    String(step.id).padStart(2, "0")
                  )}
                </span>
              </div>

              {/* Label */}
              <span
                className="hidden sm:block text-center leading-tight transition-all duration-300"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "1.5px",
                  color: active
                    ? "#00e5ff"
                    : done
                    ? "rgba(0,229,255,0.5)"
                    : "rgba(122,106,154,0.35)",
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
