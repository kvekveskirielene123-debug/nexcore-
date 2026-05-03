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
  /** When set, we're in edit mode. */
  personaId?: string;
  /** Existing data to pre-fill (edit mode). */
  initialDraft?: PersonaDraft;
}

export function PersonaForm({ personaId, initialDraft }: PersonaFormProps) {
  const router = useRouter();
  const isEdit = !!personaId;

  const [draft, setDraft] = useState<PersonaDraft>(
    initialDraft ?? EMPTY_PERSONA_DRAFT
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genderMode, setGenderMode] = useState<"preset" | "custom">(
    !initialDraft?.gender_pronouns ||
      (PERSONA_GENDER_PRESETS as readonly string[]).includes(
        initialDraft.gender_pronouns
      )
      ? "preset"
      : "custom"
  );

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);

    const validation = validatePersonaDraft(draft);
    if (validation.ok === false) {
      setError(validation.error);
      return;
    }

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
        if (data.error === "persona_limit_reached") {
          setError(
            data.message ?? "You've reached your persona limit. Subscribe to unlock unlimited personas."
          );
        } else {
          setError(data.error ?? "Could not save persona.");
        }
        setSubmitting(false);
        return;
      }
      router.push("/personas");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Network error.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      {/* Avatar + name row */}
      <div className="flex items-start gap-5">
        <PersonaAvatarUpload
          currentUrl={draft.avatar_url}
          onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
        />
        <div className="flex-1 space-y-4">
          <div>
            <Label>Name *</Label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              maxLength={MAX_NAME_LEN}
              placeholder="What should they call you?"
              className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <p className="text-[10px] text-[#7a6a9a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
              {draft.name.length}/{MAX_NAME_LEN}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age *</Label>
              <input
                type="number"
                value={draft.age ?? ""}
                onChange={(e) => {
                  const n = e.target.value === "" ? null : parseInt(e.target.value, 10);
                  setDraft({ ...draft, age: Number.isNaN(n) ? null : n });
                }}
                min={MIN_AGE}
                max={MAX_AGE}
                placeholder="18+"
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
            <div>
              <Label>Tone</Label>
              <select
                value={draft.tone}
                onChange={(e) => setDraft({ ...draft, tone: e.target.value as PersonaTone })}
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] focus:outline-none focus:border-cyan-400/40 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {PERSONA_TONES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#08041a]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gender */}
      <div>
        <Label>Gender · Pronouns *</Label>
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
            className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] focus:outline-none focus:border-cyan-400/40 transition-all"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="" disabled className="bg-[#08041a]">
              Choose gender · pronouns
            </option>
            {PERSONA_GENDER_PRESETS.map((g) => (
              <option key={g} value={g} className="bg-[#08041a]">
                {g}
              </option>
            ))}
            <option value="__custom__" className="bg-[#08041a]">
              + Custom (type your own)
            </option>
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft.gender_pronouns}
              onChange={(e) => setDraft({ ...draft, gender_pronouns: e.target.value })}
              placeholder="e.g. Xenogender · xe/xem"
              autoFocus
              maxLength={60}
              className="flex-1 bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <button
              type="button"
              onClick={() => {
                setGenderMode("preset");
                setDraft({ ...draft, gender_pronouns: "" });
              }}
              className="text-[10px] tracking-[2px] text-[#7a6a9a] hover:text-cyan-400 px-3 py-2 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← USE PRESET
            </button>
          </div>
        )}
      </div>

      {/* Bio */}
      <div>
        <Label>Bio</Label>
        <textarea
          value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          rows={5}
          maxLength={MAX_BIO_LEN}
          placeholder="Who are you? What should the AI know about you? Be as detailed as you want."
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <p className="text-[10px] text-[#7a6a9a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
          {draft.bio.length}/{MAX_BIO_LEN}
        </p>
      </div>

      {/* Hobbies */}
      <div>
        <Label>Interests &amp; Hobbies</Label>
        <textarea
          value={draft.hobbies_text}
          onChange={(e) => setDraft({ ...draft, hobbies_text: e.target.value })}
          rows={3}
          maxLength={MAX_HOBBIES_LEN}
          placeholder="What do you love? Books, music, hobbies, the things that light you up."
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <p className="text-[10px] text-[#7a6a9a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
          {draft.hobbies_text.length}/{MAX_HOBBIES_LEN}
        </p>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <TagsInput
          value={draft.tags}
          onChange={(tags) => setDraft({ ...draft, tags })}
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← CANCEL
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] disabled:opacity-50 hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {submitting ? "SAVING..." : isEdit ? "◈ SAVE CHANGES →" : "◈ CREATE PERSONA →"}
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
