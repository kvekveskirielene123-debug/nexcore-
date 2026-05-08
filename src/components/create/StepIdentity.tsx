"use client";

import { useState } from "react";
import type { StepProps } from "@/lib/create/types";
import { AvatarUpload } from "./AvatarUpload";
import { GenderPronounsSelect } from "./GenderPronounsSelect";

export function StepIdentity({ draft, setDraft, goNext }: StepProps) {
  const [attempted, setAttempted] = useState(false);

  const nameError    = attempted && !draft.name.trim()            ? "Name is required" : "";
  const genderError  = attempted && !draft.gender_pronouns.trim() ? "Gender · pronouns required" : "";
  const avatarError  = attempted && !draft.avatar_url             ? "Avatar is required" : "";
  const canProceed   = draft.name.trim() && draft.gender_pronouns.trim() && draft.avatar_url;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg tracking-[3px] uppercase font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            Identity
          </h2>
          <p className="text-[12px] text-[#7a6a9a] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            Who is this entity? Start with the surface.
          </p>
        </div>
      </div>

      {/* Avatar + fields */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Avatar */}
        <div>
          <FieldLabel>Avatar *</FieldLabel>
          <AvatarUpload
            currentUrl={draft.avatar_url}
            onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
          />
          {avatarError && <FieldError>{avatarError}</FieldError>}
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <FieldLabel>Name *</FieldLabel>
            <div className="relative">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Sistra, Subject 07, Mira"
                maxLength={60}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none transition-all"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "rgba(8,4,26,0.8)",
                  border: nameError ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(124,58,237,0.2)",
                  boxShadow: draft.name ? "0 0 0 1px rgba(0,229,255,0.08) inset" : "none",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(0,229,255,0.4)")}
                onBlur={(e) => (e.currentTarget.style.border = nameError ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(124,58,237,0.2)")}
              />
              {draft.name && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-mono)" }}>
                  {draft.name.length}/60
                </span>
              )}
            </div>
            {nameError && <FieldError>{nameError}</FieldError>}
          </div>

          <div>
            <FieldLabel>Gender · Pronouns *</FieldLabel>
            <GenderPronounsSelect
              value={draft.gender_pronouns}
              onChange={(v) => setDraft({ ...draft, gender_pronouns: v })}
            />
            {genderError && <FieldError>{genderError}</FieldError>}
          </div>

          <div>
            <FieldLabel>Subtitle <span className="text-[#3a2a5a] normal-case tracking-normal">optional</span></FieldLabel>
            <textarea
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              rows={3}
              maxLength={1500}
              placeholder="A tagline shown under the name — e.g. Echo Weaver · Cosmic Traveler · Last of her kind"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-none transition-all leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                background: "rgba(8,4,26,0.8)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(0,229,255,0.4)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.2)")}
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: draft.subtitle.length > 1400 ? "#fbbf24" : "#3a2a5a" }}>
                {draft.subtitle.length}/1500
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => { if (!canProceed) { setAttempted(true); return; } goNext(); }}
          className="px-8 py-3 rounded-lg font-bold text-[11px] tracking-[3px] transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-mono)",
            background: canProceed ? "#00e5ff" : "rgba(0,229,255,0.15)",
            color: canProceed ? "#05020d" : "rgba(0,229,255,0.4)",
            boxShadow: canProceed ? "0 0 24px rgba(0,229,255,0.3)" : "none",
            border: canProceed ? "none" : "1px solid rgba(0,229,255,0.2)",
          }}
        >
          NEXT · PERSONALITY →
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[9px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "var(--font-mono)", color: "#5a4a7a" }}>
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] text-red-400" style={{ fontFamily: "var(--font-body)" }}>{children}</p>
  );
}
