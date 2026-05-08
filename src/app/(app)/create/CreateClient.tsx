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

export function CreateClient({
  mode = "create",
  characterId,
  initialDraft,
  isBrilliant = false,
}: CreateClientProps = {}) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft ?? EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCharacter | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isEdit = mode === "edit";

  const goNext = () => {
    if (currentStep < 5) setCurrentStep((s) => (s + 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (step: StepId) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEdit && characterId) {
        // Update existing character
        const res = await fetch(`/api/characters/${characterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Could not save changes.");
          setSubmitting(false);
          return;
        }
        // Redirect back to the character's profile
        router.push(`/character/${characterId}`);
        router.refresh();
      } else {
        // Create new character
        const res = await fetch("/api/characters/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Something went wrong. Try again.");
          setSubmitting(false);
          return;
        }
        setCreated(data);
      }
    } catch (err: any) {
      setSubmitError(err.message ?? "Network error. Try again.");
      setSubmitting(false);
    }
  };

  // After successful creation, swap the whole view for the celebration screen.
  // (Only in create mode — edit mode redirects back to the profile.)
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
    if (isEdit && characterId) {
      router.push(`/character/${characterId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 md:px-8" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 60%), #05020d" }}>
      {/* Ambient grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <button
            onClick={handleCancel}
            aria-label="Cancel and go back"
            className="absolute right-0 top-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
            style={{ border: "1px solid rgba(124,58,237,0.25)", color: "#5a4a7a" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="text-[9px] tracking-[4px] mb-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}>
            ◈ {isEdit ? "EDIT CHAMBER" : "SYNTHESIS CHAMBER"} · 324B21
          </div>
          <h1
            className="text-[26px] md:text-[34px] font-black tracking-[5px] uppercase"
            style={{ fontFamily: "var(--font-display)", color: "#fff", textShadow: "0 0 40px rgba(0,229,255,0.2)" }}
          >
            {isEdit ? "EDIT ENTITY" : "CREATE ENTITY"}
          </h1>
          <p className="text-[12px] text-[#5a4a7a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
            {isEdit ? "Refine your creation. Changes apply instantly." : "Synthesize a new character from scratch."}
          </p>
        </div>

        {/* Progress */}
        <WizardProgress
          currentStep={currentStep}
          onJump={currentStep === 5 || isEdit ? jumpTo : undefined}
        />

        {/* Step card */}
        <div
          className="rounded-2xl relative overflow-hidden"
          style={{
            background: "rgba(10,4,28,0.85)",
            border: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.04) inset",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          {/* Corner dots */}
          <div className="absolute top-3 left-3 w-1 h-1 rounded-full" style={{ background: "rgba(0,229,255,0.3)" }} />
          <div className="absolute top-3 right-3 w-1 h-1 rounded-full" style={{ background: "rgba(124,58,237,0.3)" }} />

          <div className="p-6 md:p-8">

          {currentStep === 1 && (
            <StepIdentity
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
            />
          )}
          {currentStep === 2 && (
            <StepPersonality
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepMemory
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
              isBrilliant={isBrilliant}
            />
          )}
          {currentStep === 4 && (
            <StepSettings
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
              characterId={characterId}
            />
          )}
          {currentStep === 5 && (
            <StepReview
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
              onJumpToStep={jumpTo}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
              submitLabel={isEdit ? "◈ SAVE CHANGES →" : undefined}
              submittingLabel={isEdit ? "SAVING..." : undefined}
            />
          )}
          </div>
        </div>

        {/* Cancel link */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={handleCancel}
            className="text-[9px] tracking-[2px] transition-colors uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "#3a2a5a" }}
          >
            ← {isEdit ? "BACK TO CHARACTER" : "CANCEL"}
          </button>
        </div>

        {/* Danger zone (edit mode only) */}
        {isEdit && characterId && (
          <div className="mt-10 pt-6 border-t border-red-500/15">
            <div
              className="text-[10px] tracking-[3px] text-red-400/60 uppercase mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ DANGER ZONE
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <div
                  className="text-[13px] text-[#e2d9f3] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Delete this character
                </div>
                <p
                  className="text-[12px] text-[#7a6a9a]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Users&apos; chat history stays intact. The character becomes
                  unreachable.
                </p>
              </div>
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-5 py-2.5 rounded-lg border border-red-500/40 text-[10px] tracking-[2px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all self-start sm:self-auto whitespace-nowrap"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                DELETE CHARACTER
              </button>
            </div>
          </div>
        )}

        <p
          className="text-[9px] tracking-[3px] text-purple-500/20 text-center mt-6 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
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
    </div>
  );
}
