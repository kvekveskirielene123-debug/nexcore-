"use client";

import { useState } from "react";
import type { StepProps } from "@/lib/create/types";
import { AvatarUpload } from "./AvatarUpload";
import { GenderPronounsSelect } from "./GenderPronounsSelect";

export function StepIdentity({ draft, setDraft, goNext }: StepProps) {
  const [attempted, setAttempted] = useState(false);

  const nameError = attempted && !draft.name.trim() ? "Name is required" : "";
  const genderError = attempted && !draft.gender_pronouns.trim() ? "Gender · pronouns required" : "";
  const avatarError = attempted && !draft.avatar_url ? "Avatar is required" : "";

  const canProceed = draft.name.trim() && draft.gender_pronouns.trim() && draft.avatar_url;

  const handleNext = () => {
    if (!canProceed) {
      setAttempted(true);
      return;
    }
    goNext();
  };

  return (
    <div className="space-y-7">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Identity
        </h2>
        <p
          className="text-sm text-[#a78bfa] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Who is this entity? Start with the surface.
        </p>
      </div>

      {/* Avatar + basics side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <div>
          <Label>Avatar *</Label>
          <AvatarUpload
            currentUrl={draft.avatar_url}
            onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
          />
          {avatarError && <FieldError>{avatarError}</FieldError>}
        </div>

        <div className="space-y-5">
          <div>
            <Label>Name *</Label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Sistra, Subject 07, Mira"
              maxLength={60}
              className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            {nameError && <FieldError>{nameError}</FieldError>}
          </div>

          <div>
            <Label>Gender · Pronouns *</Label>
            <GenderPronounsSelect
              value={draft.gender_pronouns}
              onChange={(v) => setDraft({ ...draft, gender_pronouns: v })}
            />
            {genderError && <FieldError>{genderError}</FieldError>}
          </div>

          <div>
            <Label>Subtitle (optional)</Label>
            <input
              type="text"
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              placeholder="Short tagline · e.g. Echo Weaver · Cosmic Traveler"
              maxLength={1500}
              className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <p
              className="text-[10px] text-[#7a6a9a] mt-1.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Shown below the name on cards and profile. {draft.subtitle.length}/1500
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_28px_rgba(0,229,255,0.4)] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEXT · PERSONALITY →
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] text-red-400" style={{ fontFamily: "var(--font-body)" }}>
      {children}
    </p>
  );
}
