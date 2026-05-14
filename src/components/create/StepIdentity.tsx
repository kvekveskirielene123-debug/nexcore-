"use client";

import { useState } from "react";
import type { StepProps } from "@/lib/create/types";
import { AvatarUpload } from "./AvatarUpload";
import { GenderPronounsSelect } from "./GenderPronounsSelect";

/* ── Shared FieldPanel ─────────────────────────────────────────────────── */

function FieldPanel({
  label,
  required,
  accent = "cyan",
  charCount,
  maxCount,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  accent?: "cyan" | "purple";
  charCount?: number;
  maxCount?: number;
  error?: string;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const C = {
    cyan:   { dot: "#00e5ff", glow: "rgba(0,229,255,0.75)", border: "rgba(0,229,255,0.5)",   label: "rgba(0,229,255,0.8)",   line: "rgba(0,229,255,0.55)",   outer: "rgba(0,229,255,0.07)" },
    purple: { dot: "#a78bfa", glow: "rgba(167,139,250,0.75)", border: "rgba(167,139,250,0.5)", label: "rgba(167,139,250,0.8)", line: "rgba(167,139,250,0.55)", outer: "rgba(167,139,250,0.06)" },
  }[accent];
  const overLimit = charCount !== undefined && maxCount !== undefined && charCount > maxCount * 0.85;

  return (
    <div>
      <div
        onFocus={() => setFocused(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
        className="relative rounded-xl overflow-hidden transition-all duration-250"
        style={{
          background: "rgba(5,2,13,0.8)",
          border: `1px solid ${error ? "rgba(248,113,113,0.45)" : focused ? C.border : "rgba(124,58,237,0.22)"}`,
          boxShadow: focused
            ? `0 0 0 1px ${C.outer}, 0 0 36px ${C.outer}, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.025)`
            : "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: focused
              ? `linear-gradient(90deg,transparent,${C.line},transparent)`
              : "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)",
            transition: "background 0.25s",
          }}
        />
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: focused
              ? `linear-gradient(180deg,transparent 0%,${C.dot} 35%,${C.dot} 65%,transparent 100%)`
              : "linear-gradient(180deg,transparent 0%,rgba(124,58,237,0.35) 35%,rgba(124,58,237,0.35) 65%,transparent 100%)",
            transition: "background 0.25s",
          }}
        />

        {/* Label header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: focused ? C.dot : "rgba(124,58,237,0.55)",
                boxShadow: focused ? `0 0 10px ${C.glow}` : "none",
                transition: "background 0.25s, box-shadow 0.25s",
              }}
            />
            <span
              className="text-[9px] tracking-[3.5px] uppercase font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                color: focused ? C.label : "rgba(122,106,154,0.6)",
                transition: "color 0.25s",
              }}
            >
              {label}{required && <span style={{ color: focused ? C.dot : "rgba(90,74,122,0.7)", marginLeft: 4 }}>✦</span>}
            </span>
          </div>
          {charCount !== undefined && maxCount !== undefined && (
            <span
              className="text-[9px] tabular-nums"
              style={{ fontFamily: "var(--font-mono)", color: overLimit ? "#fbbf24" : "rgba(58,42,90,0.8)" }}
            >
              {charCount}/{maxCount}
            </span>
          )}
        </div>

        {/* Separator */}
        <div className="mx-4 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />

        {/* Content */}
        <div className="px-4 py-3">{children}</div>
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-400" style={{ fontFamily: "var(--font-body)" }}>
          <span style={{ opacity: 0.8 }}>◈</span> {error}
        </p>
      )}
    </div>
  );
}

/* ── Step ──────────────────────────────────────────────────────────────── */

export function StepIdentity({ draft, setDraft, goNext }: StepProps) {
  const [attempted, setAttempted] = useState(false);

  const nameError   = attempted && !draft.name.trim()            ? "Name is required" : "";
  const genderError = attempted && !draft.gender_pronouns.trim() ? "Select gender · pronouns" : "";
  const avatarError = attempted && !draft.avatar_url             ? "Avatar is required" : "";
  const canProceed  = draft.name.trim() && draft.gender_pronouns.trim() && draft.avatar_url;

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
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Avatar */}
        <AvatarUpload
          currentUrl={draft.avatar_url}
          onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
          error={avatarError || undefined}
        />

        {/* Right-side fields */}
        <div className="space-y-4">
          <FieldPanel
            label="Name"
            required
            accent="cyan"
            charCount={draft.name.length}
            maxCount={60}
            error={nameError}
          >
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Sistra, Subject 07, Mira"
              maxLength={60}
              className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none"
              style={{ fontFamily: "var(--font-body)" }}
            />
          </FieldPanel>

          <FieldPanel
            label="Gender · Pronouns"
            required
            accent="purple"
            error={genderError}
          >
            <GenderPronounsSelect
              value={draft.gender_pronouns}
              onChange={(v) => setDraft({ ...draft, gender_pronouns: v })}
            />
          </FieldPanel>

          <FieldPanel
            label="Subtitle"
            accent="purple"
            charCount={draft.subtitle.length}
            maxCount={1500}
          >
            <textarea
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              rows={3}
              maxLength={1500}
              placeholder="A tagline under the name — e.g. Echo Weaver · Cosmic Traveler · Last of her kind"
              className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-none leading-relaxed"
              style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
            />
          </FieldPanel>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => { if (!canProceed) { setAttempted(true); return; } goNext(); }}
          className="cr-btn-primary relative flex items-center gap-2.5 px-9 py-3.5 rounded-xl font-bold text-[11px] tracking-[4px] uppercase transition-all duration-200 active:scale-95"
          style={{
            fontFamily: "var(--font-mono)",
            background: canProceed
              ? "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)"
              : "rgba(0,229,255,0.07)",
            color: canProceed ? "#05020d" : "rgba(0,229,255,0.3)",
            boxShadow: canProceed
              ? "0 0 40px rgba(0,229,255,0.5), 0 8px 28px rgba(0,0,0,0.4)"
              : "none",
            border: canProceed ? "none" : "1px solid rgba(0,229,255,0.18)",
          }}
        >
          <span className="relative z-10 flex items-center gap-2.5">
            IMPRINT
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
