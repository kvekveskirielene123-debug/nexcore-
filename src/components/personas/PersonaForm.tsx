"use client";

import { useState, useMemo } from "react";
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

  const completion = useMemo(() => {
    let score = 0;
    if (draft.avatar_url) score += 15;
    if (draft.name.trim().length >= 2) score += 20;
    if (draft.age != null) score += 15;
    if (draft.gender_pronouns) score += 15;
    if (draft.bio.length >= 20) score += 20;
    if (draft.hobbies_text.length >= 10) score += 10;
    if (draft.tags.length >= 1) score += 5;
    return score;
  }, [draft]);

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
        setError(
          data.error === "persona_limit_reached"
            ? (data.message ??
                "You've reached your persona limit. Subscribe to unlock more.")
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
    <div className="max-w-2xl mx-auto">

      {/* ── Encoding progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[8px] tracking-[3px] uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(0,229,255,0.4)",
            }}
          >
            ◈ ENCODING PROGRESS
          </span>
          <span
            className="text-[12px] font-black tabular-nums transition-colors duration-500"
            style={{
              fontFamily: "var(--font-mono)",
              color:
                completion === 100
                  ? "#00e5ff"
                  : completion >= 70
                  ? "rgba(0,229,255,0.8)"
                  : "rgba(167,139,250,0.7)",
            }}
          >
            {completion}%
          </span>
        </div>
        <div
          className="relative h-[3px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
              background: "linear-gradient(90deg, #00e5ff 0%, #a78bfa 100%)",
              boxShadow:
                completion > 0 ? "0 0 14px rgba(0,229,255,0.55)" : "none",
            }}
          />
        </div>
      </div>

      <div className="space-y-5">

        {/* ── [01] VISUAL IDENTITY ── */}
        <Panel num="01" title="VISUAL IDENTITY" encoded={!!draft.avatar_url}>
          <div className="flex flex-col items-center gap-5 py-5">
            {/* Rings + upload */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: 160, height: 160 }}
            >
              <div
                className="nx-persona-ring-1 absolute inset-0 rounded-full"
                style={{ border: "1.5px solid rgba(0,229,255,0.22)" }}
              />
              <div
                className="nx-persona-ring-2 absolute inset-0 rounded-full"
                style={{ border: "1.5px solid rgba(0,229,255,0.14)" }}
              />
              <div
                className="nx-persona-ring-3 absolute inset-0 rounded-full"
                style={{ border: "1.5px solid rgba(0,229,255,0.07)" }}
              />
              <PersonaAvatarUpload
                currentUrl={draft.avatar_url}
                onUploaded={(url) => setDraft({ ...draft, avatar_url: url })}
                size={144}
              />
            </div>
            <div className="text-center">
              <p
                className="text-[9px] tracking-[3px] uppercase transition-colors duration-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: draft.avatar_url
                    ? "rgba(0,229,255,0.65)"
                    : "rgba(122,106,154,0.5)",
                }}
              >
                {draft.avatar_url
                  ? "◈ VISUAL SIGNATURE ENCODED"
                  : "◈ TAP TO UPLOAD VISUAL SIGNATURE"}
              </p>
              <p
                className="text-[10px] italic mt-1"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(122,106,154,0.32)",
                }}
              >
                Square images recommended · Max 20 MB
              </p>
            </div>
          </div>
        </Panel>

        {/* ── [02] IDENTITY DATA ── */}
        <Panel
          num="02"
          title="IDENTITY DATA"
          encoded={
            draft.name.trim().length >= 2 &&
            draft.age != null &&
            !!draft.gender_pronouns
          }
        >
          <div className="space-y-5">
            <Field label={`NAME SIGNATURE · ${draft.name.length} / ${MAX_NAME_LEN}`}>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                maxLength={MAX_NAME_LEN}
                placeholder="What should they call you?"
                className="nx-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="AGE VECTOR *">
                <input
                  type="number"
                  value={draft.age ?? ""}
                  onChange={(e) => {
                    const n =
                      e.target.value === ""
                        ? null
                        : parseInt(e.target.value, 10);
                    setDraft({
                      ...draft,
                      age: Number.isNaN(n) ? null : n,
                    });
                  }}
                  min={MIN_AGE}
                  max={MAX_AGE}
                  placeholder="18"
                  className="nx-field"
                />
              </Field>
              <Field label="TONE FREQUENCY">
                <select
                  value={draft.tone}
                  onChange={(e) =>
                    setDraft({ ...draft, tone: e.target.value as PersonaTone })
                  }
                  className="nx-field"
                >
                  {PERSONA_TONES.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      className="bg-[#08041a]"
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="GENDER · PRONOUNS *">
              {genderMode === "preset" ? (
                <select
                  value={draft.gender_pronouns}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setGenderMode("custom");
                      setDraft({ ...draft, gender_pronouns: "" });
                    } else {
                      setDraft({
                        ...draft,
                        gender_pronouns: e.target.value,
                      });
                    }
                  }}
                  className="nx-field"
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draft.gender_pronouns}
                    onChange={(e) =>
                      setDraft({ ...draft, gender_pronouns: e.target.value })
                    }
                    placeholder="e.g. Xenogender · xe/xem"
                    autoFocus
                    maxLength={60}
                    className="nx-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGenderMode("preset");
                      setDraft({ ...draft, gender_pronouns: "" });
                    }}
                    className="flex-shrink-0 px-4 rounded-xl text-[10px] tracking-[2px] transition-all active:scale-95"
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
          </div>
        </Panel>

        {/* ── [03] NEURAL IMPRINT ── */}
        <Panel
          num="03"
          title="NEURAL IMPRINT"
          encoded={draft.bio.length >= 20}
        >
          <Field
            label={`BIO SEQUENCE · ${draft.bio.length} / ${MAX_BIO_LEN}`}
          >
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={7}
              maxLength={MAX_BIO_LEN}
              placeholder="Who are you? What should the AI know about you? Personality, backstory, communication style, what makes you tick — the more you encode here, the more precisely the AI mirrors you."
              className="nx-field"
            />
          </Field>
        </Panel>

        {/* ── [04] BEHAVIORAL MATRIX ── */}
        <Panel
          num="04"
          title="BEHAVIORAL MATRIX"
          encoded={draft.hobbies_text.length >= 10}
        >
          <Field
            label={`INTEREST LATTICE · ${draft.hobbies_text.length} / ${MAX_HOBBIES_LEN}`}
          >
            <textarea
              value={draft.hobbies_text}
              onChange={(e) =>
                setDraft({ ...draft, hobbies_text: e.target.value })
              }
              rows={4}
              maxLength={MAX_HOBBIES_LEN}
              placeholder="What do you love? Books, music, gaming, anime — the things that light you up. The AI weaves these naturally into every conversation."
              className="nx-field"
            />
          </Field>
        </Panel>

        {/* ── [05] SIGNATURE TAGS ── */}
        <Panel
          num="05"
          title="SIGNATURE TAGS"
          encoded={draft.tags.length >= 1}
        >
          <p
            className="text-[11px] italic mb-4"
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(122,106,154,0.45)",
            }}
          >
            Tag yourself — helps the AI understand your vibe at a glance.
          </p>
          <TagsInput
            value={draft.tags}
            onChange={(tags) => setDraft({ ...draft, tags })}
          />
        </Panel>

        {/* Error */}
        {error && (
          <div
            className="px-5 py-4 rounded-xl text-[13px] leading-relaxed"
            style={{
              border: "1px solid rgba(239,68,68,0.28)",
              borderLeft: "3px solid rgba(239,68,68,0.65)",
              background: "rgba(239,68,68,0.05)",
              color: "#f87171",
              fontFamily: "var(--font-body)",
            }}
          >
            ◈ {error}
          </div>
        )}

        {/* ── Actions ── */}
        <div
          className="flex flex-col-reverse sm:flex-row gap-3 pt-2"
          style={{
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          }}
        >
          <button
            onClick={() => router.back()}
            className="flex-1 sm:flex-none sm:px-8 py-4 rounded-xl text-[11px] tracking-[3px] transition-all active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(124,58,237,0.18)",
              color: "rgba(167,139,250,0.55)",
            }}
          >
            ← ABORT
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-4 rounded-xl font-black text-[11px] tracking-[4px] disabled:opacity-50 transition-all active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-mono)",
              background: submitting
                ? "rgba(0,229,255,0.6)"
                : "linear-gradient(90deg, #00e5ff 0%, #00ccff 100%)",
              color: "#000",
              boxShadow: submitting
                ? "none"
                : "0 0 40px rgba(0,229,255,0.35), 0 0 80px rgba(0,229,255,0.12), 0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {submitting
              ? "◈ ENCODING SEQUENCE..."
              : isEdit
              ? "◈ COMMIT CHANGES →"
              : "◈ INITIALIZE PERSONA SEQUENCE →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Terminal panel wrapper ──────────────────────────────────────
function Panel({
  num,
  title,
  encoded,
  children,
}: {
  num: string;
  title: string;
  encoded: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(4,1,16,0.82)",
        border: "1px solid rgba(0,229,255,0.07)",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.015)",
      }}
    >
      {/* Terminal header strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(0,229,255,0.035)",
          borderBottom: "1px solid rgba(0,229,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Live status dot */}
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-700"
            style={{
              background: encoded ? "#00e5ff" : "rgba(122,106,154,0.3)",
              boxShadow: encoded
                ? "0 0 8px rgba(0,229,255,0.85)"
                : "none",
            }}
          />
          <span
            className="text-[9px] tracking-[3px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(0,229,255,0.5)",
            }}
          >
            [{num}]
          </span>
          <span
            className="text-[10px] tracking-[3px] uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-[7px] tracking-[2px] px-2 py-0.5 rounded transition-all duration-700"
          style={{
            fontFamily: "var(--font-mono)",
            color: encoded
              ? "rgba(0,229,255,0.85)"
              : "rgba(122,106,154,0.38)",
            background: encoded
              ? "rgba(0,229,255,0.07)"
              : "rgba(255,255,255,0.018)",
            border: `1px solid ${
              encoded
                ? "rgba(0,229,255,0.22)"
                : "rgba(122,106,154,0.1)"
            }`,
          }}
        >
          {encoded ? "ENCODED" : "PENDING"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

// ── Field label ────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[8px] tracking-[2.5px] uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: "rgba(0,229,255,0.35)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
