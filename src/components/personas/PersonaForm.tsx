"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaAvatarUpload } from "./PersonaAvatarUpload";
import { TagsInput } from "./TagsInput";
import {
  EMPTY_PERSONA_DRAFT,
  PERSONA_TONES,
  PERSONA_GENDER_PRESETS,
  validatePersonaDraft,
  type PersonaDraft,
  type PersonaTone,
  MIN_AGE,
  MAX_AGE,
  MAX_BIO_LEN,
  MAX_HOBBIES_LEN,
  MAX_NAME_LEN,
} from "@/lib/personas/types";

interface PersonaFormProps {
  personaId?: string;
  initialDraft?: PersonaDraft;
}

const INPUT =
  "w-full bg-[#08041a] border border-purple-700/25 rounded-xl px-4 py-3.5 text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all";
const INPUT_STYLE = { fontFamily: "var(--font-body)", fontSize: "16px" };

export function PersonaForm({ personaId, initialDraft }: PersonaFormProps) {
  const router = useRouter();
  const isEdit = !!personaId;

  const [draft, setDraft] = useState<PersonaDraft>(initialDraft ?? EMPTY_PERSONA_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genderMode, setGenderMode] = useState<"preset" | "custom">(
    !initialDraft?.gender_pronouns ||
      (PERSONA_GENDER_PRESETS as readonly string[]).includes(initialDraft.gender_pronouns)
      ? "preset"
      : "custom"
  );

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    const validation = validatePersonaDraft(draft);
    if (validation.ok === false) { setError(validation.error); return; }
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/personas/${personaId}` : "/api/personas";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "persona_limit_reached"
            ? (data.message ?? "You've reached your persona limit. Subscribe to unlock more.")
            : (data.error ?? "Could not save persona.")
        );
        setSubmitting(false);
        return;
      }
      router.push("/personas");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── [01] VISUAL SIGNATURE ── */}
      <Section num="01" title="VISUAL SIGNATURE">
        <div className="flex flex-col items-center gap-4 py-4">
          <PersonaAvatarUpload
            currentUrl={draft.avatar_url}
            onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
            size={120}
          />
          <div className="text-center">
            <p
              className="text-[9px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
            >
              {draft.avatar_url ? "TAP TO CHANGE AVATAR" : "TAP TO UPLOAD AVATAR"}
            </p>
            <p
              className="text-[11px] italic mt-1"
              style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.38)" }}
            >
              Square images recommended · Max 20 MB
            </p>
          </div>
        </div>
      </Section>

      {/* ── [02] IDENTITY DATA ── */}
      <Section num="02" title="IDENTITY DATA">
        {/* Name */}
        <Field label={`Name * · ${draft.name.length}/${MAX_NAME_LEN}`}>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            maxLength={MAX_NAME_LEN}
            placeholder="What should they call you?"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </Field>

        {/* Age + Tone */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age *">
            <input
              type="number"
              value={draft.age ?? ""}
              onChange={(e) => {
                const n = e.target.value === "" ? null : parseInt(e.target.value, 10);
                setDraft({ ...draft, age: Number.isNaN(n) ? null : n });
              }}
              min={MIN_AGE}
              max={MAX_AGE}
              placeholder="18"
              className={INPUT}
              style={INPUT_STYLE}
            />
          </Field>
          <Field label="Tone">
            <select
              value={draft.tone}
              onChange={(e) => setDraft({ ...draft, tone: e.target.value as PersonaTone })}
              className={INPUT}
              style={INPUT_STYLE}
            >
              {PERSONA_TONES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#08041a]">
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Gender */}
        <Field label="Gender · Pronouns *">
          {genderMode === "preset" ? (
            <select
              value={draft.gender_pronouns}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setGenderMode("custom");
                  setDraft({ ...draft, gender_pronouns: "" });
                } else {
                  setDraft({ ...draft, gender_pronouns: e.target.value });
                }
              }}
              className={INPUT}
              style={INPUT_STYLE}
            >
              <option value="" disabled className="bg-[#08041a]">Choose gender · pronouns</option>
              {PERSONA_GENDER_PRESETS.map((g) => (
                <option key={g} value={g} className="bg-[#08041a]">{g}</option>
              ))}
              <option value="__custom__" className="bg-[#08041a]">+ Custom (type your own)</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={draft.gender_pronouns}
                onChange={(e) => setDraft({ ...draft, gender_pronouns: e.target.value })}
                placeholder="e.g. Xenogender · xe/xem"
                autoFocus
                maxLength={60}
                className={`${INPUT} flex-1`}
                style={INPUT_STYLE}
              />
              <button
                type="button"
                onClick={() => { setGenderMode("preset"); setDraft({ ...draft, gender_pronouns: "" }); }}
                className="flex-shrink-0 px-4 rounded-xl text-[10px] tracking-[2px] transition-colors active:scale-95"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "16px",
                  color: "rgba(122,106,154,0.8)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  background: "rgba(124,58,237,0.07)",
                }}
              >
                ← PRESET
              </button>
            </div>
          )}
        </Field>
      </Section>

      {/* ── [03] NEURAL PROFILE ── */}
      <Section num="03" title="NEURAL PROFILE">
        <Field label={`Bio · ${draft.bio.length} / ${MAX_BIO_LEN}`}>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            rows={6}
            maxLength={MAX_BIO_LEN}
            placeholder="Who are you? What should the AI know about you? Personality, backstory, communication style, things that make you tick — the more detail, the better."
            className={`${INPUT} resize-y leading-relaxed`}
            style={INPUT_STYLE}
          />
        </Field>
      </Section>

      {/* ── [04] BEHAVIORAL MATRIX ── */}
      <Section num="04" title="BEHAVIORAL MATRIX">
        <Field label={`Interests & Hobbies · ${draft.hobbies_text.length} / ${MAX_HOBBIES_LEN}`}>
          <textarea
            value={draft.hobbies_text}
            onChange={(e) => setDraft({ ...draft, hobbies_text: e.target.value })}
            rows={4}
            maxLength={MAX_HOBBIES_LEN}
            placeholder="What do you love? Books, music, gaming, anime, the things that light you up. The AI will weave these naturally into conversation."
            className={`${INPUT} resize-y leading-relaxed`}
            style={INPUT_STYLE}
          />
        </Field>
      </Section>

      {/* ── [05] SIGNATURE TAGS ── */}
      <Section num="05" title="SIGNATURE TAGS">
        <p
          className="text-[11px] italic mb-3"
          style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.55)" }}
        >
          Tag yourself — helps the AI understand your vibe at a glance.
        </p>
        <TagsInput value={draft.tags} onChange={(tags) => setDraft({ ...draft, tags })} />
      </Section>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3.5 rounded-xl text-sm leading-relaxed"
          style={{
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.08)",
            color: "#f87171",
            fontFamily: "var(--font-body)",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Actions ── */}
      <div
        className="flex flex-col-reverse sm:flex-row gap-3 pt-2"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => router.back()}
          className="flex-1 sm:flex-none sm:px-8 py-4 rounded-xl text-[11px] tracking-[2px] transition-all active:scale-[0.97]"
          style={{
            fontFamily: "var(--font-mono)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "rgba(167,139,250,0.8)",
          }}
        >
          ← CANCEL
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-4 rounded-xl font-black text-[11px] tracking-[3px] disabled:opacity-50 transition-all active:scale-[0.97]"
          style={{
            fontFamily: "var(--font-mono)",
            background: submitting ? "rgba(0,229,255,0.65)" : "#00e5ff",
            color: "#000",
            boxShadow: submitting ? "none" : "0 0 32px rgba(0,229,255,0.28), 0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {submitting
            ? "ENCODING..."
            : isEdit
            ? "◈ SAVE CHANGES →"
            : "◈ INITIALIZE PERSONA →"}
        </button>
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span
          className="text-[9px] tracking-[3px] flex-shrink-0"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
        >
          [{num}]
        </span>
        <span
          className="text-[10px] tracking-[4px] uppercase flex-shrink-0"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.5)" }}
        >
          {title}
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(to right, rgba(124,58,237,0.35), transparent)" }}
        />
      </div>
      {/* Card */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-5"
        style={{
          background: "rgba(8,4,26,0.65)",
          border: "1px solid rgba(124,58,237,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Field label ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[9px] tracking-[2px] uppercase"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.7)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
