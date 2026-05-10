"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EMPTY_DRAFT,
  type CharacterDraft,
  type StepId,
} from "@/lib/create/types";
import { WizardProgress } from "@/components/create/WizardProgress";
import { StepIdentity } from "@/components/create/StepIdentity";
import { StepPersonality } from "@/components/create/StepPersonality";
import { StepMemory } from "@/components/create/StepMemory";
import { StepSettings } from "@/components/create/StepSettings";
import { StepReview } from "@/components/create/StepReview";
import { SuccessScreen } from "@/components/create/SuccessScreen";
import { DeleteCharacterDialog } from "@/components/character/DeleteCharacterDialog";

/* ── Per-step accent colors ─────────────────────────────────── */
const STEP_ACCENT: Record<number, string> = {
  1: "#00e5ff", 2: "#a78bfa", 3: "#60c8ff", 4: "#fb923c", 5: "#34d399",
};
const STEP_ACCENT_RGB: Record<number, string> = {
  1: "0,229,255", 2: "167,139,250", 3: "96,200,255", 4: "251,146,60", 5: "52,211,153",
};

/* ── Synthesis Logo ─────────────────────────────────────────── */
function SynthesisLogo() {
  return (
    <div
      className="relative inline-flex items-center justify-center mb-5"
      style={{ width: 90, height: 90 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none cr-breathe"
        style={{
          inset: -22,
          background:
            "radial-gradient(circle, rgba(0,229,255,0.18) 0%, rgba(167,139,250,0.07) 45%, transparent 70%)",
        }}
      />

      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
        {/* Outer orbital ring + 4 cardinal nodes */}
        <g className="cr-ring">
          <circle cx="45" cy="45" r="42" stroke="rgba(0,229,255,0.18)" strokeWidth="1" strokeDasharray="5 9"/>
          <circle cx="45" cy="3"  r="2.8" fill="#00e5ff"  className="cr-node"/>
          <circle cx="87" cy="45" r="2.8" fill="#a78bfa"  className="cr-node" style={{ animationDelay: "0.7s" }}/>
          <circle cx="45" cy="87" r="2.8" fill="#00e5ff"  className="cr-node" style={{ animationDelay: "1.4s" }}/>
          <circle cx="3"  cy="45" r="2.8" fill="#a78bfa"  className="cr-node" style={{ animationDelay: "2.1s" }}/>
        </g>

        {/* Inner ring */}
        <circle cx="45" cy="45" r="29" stroke="rgba(167,139,250,0.07)" strokeWidth="0.8"/>

        {/* DNA double helix (vertical axis) */}
        <path d="M45 14 C38 19.5 52 25 45 30.5 C38 36 52 41.5 45 47 C38 52.5 52 58 45 63.5 C38 69 52 74.5 45 80"
              stroke="rgba(0,229,255,0.55)" strokeWidth="1.4" fill="none" className="cr-helix"/>
        <path d="M45 14 C52 19.5 38 25 45 30.5 C52 36 38 41.5 45 47 C52 52.5 38 58 45 63.5 C52 69 38 74.5 45 80"
              stroke="rgba(167,139,250,0.55)" strokeWidth="1.4" fill="none" className="cr-helix"
              style={{ animationDelay: "0.5s" }}/>

        {/* Base-pair rungs */}
        {([22, 30.5, 39, 47, 55.5, 64, 72.5] as number[]).map((y, i) => (
          <line key={y} x1="41.5" y1={y} x2="48.5" y2={y}
            stroke={i % 2 === 0 ? "rgba(0,229,255,0.28)" : "rgba(167,139,250,0.28)"}
            strokeWidth="0.8"/>
        ))}

        {/* Horizontal crosshair (gap at center) */}
        <line x1="5"  y1="45" x2="39" y2="45" stroke="rgba(0,229,255,0.13)" strokeWidth="0.8"/>
        <line x1="51" y1="45" x2="85" y2="45" stroke="rgba(0,229,255,0.13)" strokeWidth="0.8"/>

        {/* Scattered signal pings */}
        <circle cx="18" cy="25" r="1.7" fill="#00d4ff" className="cr-ping"/>
        <circle cx="72" cy="62" r="1.5" fill="#a78bfa" className="cr-ping" style={{ animationDelay: "1.1s" }}/>
        <circle cx="22" cy="67" r="1.4" fill="#00d4ff" className="cr-ping" style={{ animationDelay: "0.6s" }}/>
        <circle cx="68" cy="23" r="1.3" fill="#a78bfa" className="cr-ping" style={{ animationDelay: "1.8s" }}/>

        {/* Expanding pulse rings */}
        <circle cx="45" cy="45" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" r="5">
          <animate attributeName="r"       values="5;38"  dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="45" cy="45" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1" r="5">
          <animate attributeName="r"       values="5;38"  dur="2.5s" begin="1.25s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0" dur="2.5s" begin="1.25s" repeatCount="indefinite"/>
        </circle>

        {/* Center crosshair ticks */}
        <line x1="41" y1="45" x2="38" y2="45" stroke="rgba(0,229,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="49" y1="45" x2="52" y2="45" stroke="rgba(0,229,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="45" y1="41" x2="45" y2="38" stroke="rgba(0,229,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="45" y1="49" x2="45" y2="52" stroke="rgba(0,229,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>

        {/* Center ⟡ diamond */}
        <polygon points="45,38 52,45 45,52 38,45" fill="rgba(0,229,255,0.92)" stroke="white" strokeWidth="0.5"/>
        <circle cx="45" cy="45" r="1.8" fill="white" opacity="0.95"/>
      </svg>
    </div>
  );
}

/* ── Animated page title ────────────────────────────────────── */
function AnimatedTitle({ text }: { text: string }) {
  return (
    <h1
      className="font-black tracking-[6px] uppercase mb-1"
      style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,4vw,36px)", color: "#fff" }}
      aria-label={text}
    >
      {text.split("").map((letter, i) => (
        <span
          key={i}
          className="cr-title-letter inline-block"
          style={{ animationDelay: `${i * 0.055}s, ${i * 0.28}s` }}
        >
          {letter === " " ? " " : letter}
        </span>
      ))}
    </h1>
  );
}

/* ── Types ──────────────────────────────────────────────────── */
interface CreatedCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  greeting: string | null;
}

export interface CreateClientProps {
  mode?: "create" | "edit";
  characterId?: string;
  initialDraft?: CharacterDraft;
  isBrilliant?: boolean;
}

/* ── Main component ─────────────────────────────────────────── */
export function CreateClient({
  mode = "create",
  characterId,
  initialDraft,
  isBrilliant = false,
}: CreateClientProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [stepDir,     setStepDir]     = useState<"forward" | "back">("forward");
  const [draft,       setDraft]       = useState<CharacterDraft>(initialDraft ?? EMPTY_DRAFT);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created,     setCreated]     = useState<CreatedCharacter | null>(null);
  const [deleteOpen,  setDeleteOpen]  = useState(false);

  const isEdit = mode === "edit";

  const goNext = () => {
    if (currentStep < 5) {
      setStepDir("forward");
      setCurrentStep(s => (s + 1) as StepId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (currentStep > 1) {
      setStepDir("back");
      setCurrentStep(s => (s - 1) as StepId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (step: StepId) => {
    setStepDir(step < currentStep ? "back" : "forward");
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEdit && characterId) {
        const res  = await fetch(`/api/characters/${characterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await res.json();
        if (!res.ok) { setSubmitError(data.error ?? "Could not save changes."); setSubmitting(false); return; }
        router.push(`/character/${characterId}`);
        router.refresh();
      } else {
        const res  = await fetch("/api/characters/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await res.json();
        if (!res.ok) { setSubmitError(data.error ?? "Something went wrong. Try again."); setSubmitting(false); return; }
        setCreated(data);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Network error. Try again.");
      setSubmitting(false);
    }
  };

  if (!isEdit && created) {
    return (
      <SuccessScreen
        characterId={created.id}
        characterName={created.name}
        characterAvatarUrl={created.avatar_url}
        greeting={created.greeting ?? draft.greeting}
      />
    );
  }

  const handleCancel = () => {
    if (isEdit && characterId) router.push(`/character/${characterId}`);
    else router.back();
  };

  const accent    = STEP_ACCENT[currentStep];
  const accentRgb = STEP_ACCENT_RGB[currentStep];

  return (
    <div className="min-h-screen bg-[#05020d] relative">

      {/* ── Background ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.018,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%,rgba(0,212,255,0.1) 0%,transparent 65%)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-28">

        {/* ── Page header ── */}
        <div className="flex flex-col items-center text-center mb-8 relative">

          {/* Close / cancel button */}
          <button
            onClick={handleCancel}
            aria-label="Cancel and go back"
            className="absolute right-0 top-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              border: "1px solid rgba(124,58,237,0.22)",
              color: "rgba(122,106,154,0.5)",
              background: "rgba(12,5,32,0.5)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,114,182,0.45)";
              (e.currentTarget as HTMLElement).style.color = "rgba(244,114,182,0.8)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.22)";
              (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <SynthesisLogo />

          {/* System sub-label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,.4))" }}/>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }}/>
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,.4)" }}>
                {isEdit ? "EDIT CHAMBER" : "SYNTHESIS CHAMBER"} · 324B21
              </span>
            </div>
            <div className="w-6 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,.4))" }}/>
          </div>

          <AnimatedTitle text={isEdit ? "EDIT ENTITY" : "CREATE ENTITY"} />

          <p
            className="text-[12px] italic mt-1"
            style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.45)" }}
          >
            {isEdit
              ? "Refine your creation — changes apply immediately."
              : "Synthesize a new character from the void."}
          </p>
        </div>

        {/* ── Step progress ── */}
        <WizardProgress
          currentStep={currentStep}
          onJump={currentStep === 5 || isEdit ? jumpTo : undefined}
        />

        {/* ── Step card ── */}
        <div
          key={`${currentStep}-${stepDir}`}
          className={stepDir === "forward" ? "cr-step-forward" : "cr-step-back"}
        >
          <div
            className="rounded-2xl relative overflow-hidden"
            style={{
              background: "rgba(8,4,26,0.88)",
              border: `1px solid rgba(${accentRgb},0.2)`,
              borderLeft: `3px solid ${accent}`,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(${accentRgb},0.05) inset, 0 0 50px rgba(${accentRgb},0.04)`,
              transition: "border-color 0.4s ease, box-shadow 0.4s ease",
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: `linear-gradient(to right, transparent, rgba(${accentRgb},0.5), transparent)` }}
            />
            {/* Corner dots */}
            <div className="absolute top-3.5 left-5 w-1 h-1 rounded-full" style={{ background: `rgba(${accentRgb},0.5)`, boxShadow: `0 0 6px rgba(${accentRgb},0.8)` }}/>
            <div className="absolute top-3.5 right-5 w-1 h-1 rounded-full" style={{ background: "rgba(124,58,237,0.4)" }}/>
            {/* Step counter */}
            <div
              className="absolute top-3 right-10 text-[8px] tracking-[2px]"
              style={{ fontFamily: "var(--font-mono)", color: `rgba(${accentRgb},0.3)` }}
            >
              {String(currentStep).padStart(2, "0")} / 05
            </div>

            <div className="p-6 md:p-8">
              {currentStep === 1 && <StepIdentity    draft={draft} setDraft={setDraft} goNext={goNext} goBack={goBack} />}
              {currentStep === 2 && <StepPersonality draft={draft} setDraft={setDraft} goNext={goNext} goBack={goBack} />}
              {currentStep === 3 && <StepMemory      draft={draft} setDraft={setDraft} goNext={goNext} goBack={goBack} isBrilliant={isBrilliant} />}
              {currentStep === 4 && <StepSettings    draft={draft} setDraft={setDraft} goNext={goNext} goBack={goBack} characterId={characterId} />}
              {currentStep === 5 && (
                <StepReview
                  draft={draft} setDraft={setDraft} goNext={goNext} goBack={goBack}
                  onJumpToStep={jumpTo} onSubmit={handleSubmit}
                  submitting={submitting} submitError={submitError}
                  submitLabel={isEdit ? "◈ SAVE CHANGES →" : undefined}
                  submittingLabel={isEdit ? "SAVING..." : undefined}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Cancel link ── */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCancel}
            className="text-[9px] tracking-[2px] uppercase transition-colors duration-200"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.4)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.4)"; }}
          >
            ← {isEdit ? "BACK TO CHARACTER" : "CANCEL"}
          </button>
        </div>

        {/* ── Danger zone (edit mode) ── */}
        {isEdit && characterId && (
          <div className="mt-10 pt-6 border-t border-red-500/10">
            <div
              className="text-[9px] tracking-[3px] uppercase mb-3"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(248,113,113,0.45)" }}
            >
              ◈ DANGER ZONE
            </div>
            <div
              className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
              style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <div>
                <div className="text-[13px] text-[#e2d9f3] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Delete this character
                </div>
                <p className="text-[12px] text-[#7a6a9a]" style={{ fontFamily: "var(--font-body)" }}>
                  Users&apos; chat history stays intact. The character becomes unreachable.
                </p>
              </div>
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-5 py-2.5 rounded-lg text-[10px] tracking-[2px] uppercase transition-all self-start sm:self-auto whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "rgba(248,113,113,0.7)",
                  background: "transparent",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.7)"; }}
              >
                DELETE CHARACTER
              </button>
            </div>
          </div>
        )}

        <p
          className="text-[8px] tracking-[3px] text-center mt-8 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.18)" }}
        >
          SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION
        </p>
      </div>

      {isEdit && characterId && (
        <DeleteCharacterDialog
          open={deleteOpen}
          characterId={characterId}
          characterName={draft.name}
          onClose={() => setDeleteOpen(false)}
        />
      )}

      {/* ── CSS ── */}
      <style>{`
        @keyframes crOrbit    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes crNode     { 0%,100% { opacity:.35; transform:scale(1); } 50% { opacity:1; transform:scale(1.65); } }
        @keyframes crHelix    { 0%,100% { opacity:.3; } 50% { opacity:.85; } }
        @keyframes crPing     { 0%,100% { opacity:.15; transform:scale(1); } 50% { opacity:1; transform:scale(1.7); } }
        @keyframes crBreathe  { 0%,100% { transform:scale(1); opacity:.65; } 50% { transform:scale(1.1); opacity:1; } }

        @keyframes crTitleIn  { from { opacity:0; transform:translateY(14px) scaleY(0.8); } to { opacity:1; transform:translateY(0) scaleY(1); } }
        @keyframes crTitleGlow {
          0%,100% { text-shadow:0 0 35px rgba(0,229,255,0.18); }
          50%      { text-shadow:0 0 55px rgba(0,229,255,0.7),0 0 22px rgba(167,139,250,0.3); }
        }

        @keyframes crStepForwardAnim { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes crStepBackAnim    { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }

        @keyframes crShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .cr-ring    { animation: crOrbit 65s linear infinite; transform-origin: 45px 45px; }
        .cr-node    { animation: crNode  2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .cr-helix   { animation: crHelix 3.2s ease-in-out infinite; }
        .cr-ping    { animation: crPing  3.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .cr-breathe { animation: crBreathe 4s ease-in-out infinite; }

        .cr-title-letter {
          animation:
            crTitleIn   0.52s cubic-bezier(0.16,1,0.3,1) both,
            crTitleGlow 3s   ease-in-out                 infinite;
        }

        .cr-step-forward { animation: crStepForwardAnim 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .cr-step-back    { animation: crStepBackAnim    0.38s cubic-bezier(0.16,1,0.3,1) both; }

        /* Shared premium button styles */
        .cr-btn-primary {
          position: relative;
          overflow: hidden;
        }
        .cr-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: crShimmer 2.8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
