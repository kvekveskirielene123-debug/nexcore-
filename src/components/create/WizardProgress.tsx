"use client";

import { STEPS, type StepId } from "@/lib/create/types";

interface WizardProgressProps {
  currentStep: StepId;
  onJump?: (stepId: StepId) => void; // called only on Review page to jump back
}

export function WizardProgress({ currentStep, onJump }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-3 mb-8 px-2">
      {STEPS.map((step, i) => {
        const active = currentStep === step.id;
        const done = currentStep > step.id;
        const clickable = !!onJump && done;

        return (
          <div key={step.id} className="flex-1 flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(step.id)}
              className={`flex-1 flex flex-col items-start gap-1.5 py-1.5 px-1 transition-all ${
                clickable ? "cursor-pointer hover:opacity-100" : "cursor-default"
              }`}
              aria-current={active ? "step" : undefined}
            >
              <div
                className="w-full h-[2px] rounded-full transition-all"
                style={{
                  background: done
                    ? "rgba(0,229,255,0.7)"
                    : active
                    ? "linear-gradient(to right, rgba(0,229,255,0.7) 50%, rgba(124,58,237,0.2) 50%)"
                    : "rgba(124,58,237,0.18)",
                  boxShadow: active ? "0 0 10px rgba(0,229,255,0.3)" : "none",
                }}
              />
              <div
                className="hidden sm:flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "2px",
                }}
              >
                <span
                  style={{
                    color: active || done ? "#00e5ff" : "rgba(122,106,154,0.5)",
                  }}
                >
                  {String(step.id).padStart(2, "0")}
                </span>
                <span
                  style={{
                    color: active
                      ? "#fff"
                      : done
                      ? "rgba(226,217,243,0.7)"
                      : "rgba(122,106,154,0.5)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="hidden sm:block"
                style={{ color: "rgba(122,106,154,0.3)", fontSize: 8 }}
              >
                →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
