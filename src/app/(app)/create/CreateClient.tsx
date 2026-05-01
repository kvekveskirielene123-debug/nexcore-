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
  /** Defaults to 'create'. Pass 'edit' from the edit page. */
  mode?: "create" | "edit";
  /** Required in edit mode — the character being edited. */
  characterId?: string;
  /** Required in edit mode — the current character data to pre-fill. */
  initialDraft?: CharacterDraft;
}

export function CreateClient({
  mode = "create",
  characterId,
  initialDraft,
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

  return (
    <div className="min-h-screen bg-[#05020d] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ {isEdit ? "EDIT CHAMBER" : "SYNTHESIS CHAMBER"} · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[38px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 40px rgba(0,229,255,0.25)",
            }}
          >
            {isEdit ? "EDIT ENTITY" : "CREATE ENTITY"}
          </h1>
          <p
            className="text-sm text-[#7a6a9a] italic mt-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {isEdit
              ? "Refine your creation. Your changes apply instantly."
              : "Build a new character from scratch. Take your time."}
          </p>
        </div>

        {/* Progress */}
        <WizardProgress
          currentStep={currentStep}
          onJump={currentStep === 5 || isEdit ? jumpTo : undefined}
        />

        {/* Current step content */}
        <div className="rounded-2xl border border-purple-700/20 bg-[#0c0520]/70 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

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
            />
          )}
          {currentStep === 4 && (
            <StepSettings
              draft={draft}
              setDraft={setDraft}
              goNext={goNext}
              goBack={goBack}
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
