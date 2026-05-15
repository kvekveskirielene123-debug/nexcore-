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

/* ── Per-section accent palette ───────────────────────────────── */
const SEC: Record<number, { color: string; rgb: string }> = {
  1: { color: "#00e5ff", rgb: "0,229,255"   },
  2: { color: "#a78bfa", rgb: "167,139,250" },
  3: { color: "#60c8ff", rgb: "96,200,255"  },
  4: { color: "#fb923c", rgb: "251,146,60"  },
  5: { color: "#34d399", rgb: "52,211,153"  },
};

/* ── FieldPanel: reactive input container (matches char-create) ─ */
type PanelAccent = "cyan" | "purple" | "blue" | "orange" | "green";

const PANEL_COLORS: Record<PanelAccent, {
  dot: string; glow: string; border: string; label: string; line: string; outer: string;
}> = {
  cyan:   { dot: "#00e5ff",  glow: "rgba(0,229,255,0.75)",   border: "rgba(0,229,255,0.5)",   label: "rgba(0,229,255,0.85)",   line: "rgba(0,229,255,0.55)",   outer: "rgba(0,229,255,0.07)"   },
  purple: { dot: "#a78bfa",  glow: "rgba(167,139,250,0.75)", border: "rgba(167,139,250,0.5)", label: "rgba(167,139,250,0.85)", line: "rgba(167,139,250,0.55)", outer: "rgba(167,139,250,0.06)" },
  blue:   { dot: "#60c8ff",  glow: "rgba(96,200,255,0.75)",  border: "rgba(96,200,255,0.5)",  label: "rgba(96,200,255,0.85)",  line: "rgba(96,200,255,0.55)",  outer: "rgba(96,200,255,0.07)"  },
  orange: { dot: "#fb923c",  glow: "rgba(251,146,60,0.75)",  border: "rgba(251,146,60,0.5)",  label: "rgba(251,146,60,0.85)",  line: "rgba(251,146,60,0.55)",  outer: "rgba(251,146,60,0.07)"  },
  green:  { dot: "#34d399",  glow: "rgba(52,211,153,0.75)",  border: "rgba(52,211,153,0.5)",  label: "rgba(52,211,153,0.85)",  line: "rgba(52,211,153,0.55)",  outer: "rgba(52,211,153,0.07)"  },
};

function FieldPanel({
  label,
  required,
  accent = "cyan",
  charCount,
  maxCount,
  children,
}: {
  label: string;
  required?: boolean;
  accent?: PanelAccent;
  charCount?: number;
  maxCount?: number;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const C = PANEL_COLORS[accent];
  const overLimit =
    charCount !== undefined &&
    maxCount !== undefined &&
    charCount > maxCount * 0.85;

  return (
    <div
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setFocused(false);
      }}
      className="relative rounded-xl overflow-hidden transition-all duration-250"
      style={{
        background: "rgba(5,2,13,0.8)",
        border: `1px solid ${focused ? C.border : "rgba(124,58,237,0.22)"}`,
        boxShadow: focused
          ? `0 0 0 1px ${C.outer}, 0 0 36px ${C.outer}, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.025)`
          : "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
    >
      {/* Top shimmer line */}
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

      {/* Label row */}
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
            {label}
            {required && (
              <span
                style={{
                  color: focused ? C.dot : "rgba(90,74,122,0.7)",
                  marginLeft: 4,
                }}
              >
                ✦
              </span>
            )}
          </span>
        </div>
        {charCount !== undefined && maxCount !== undefined && (
          <span
            className="text-[9px] tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: overLimit ? "#fbbf24" : "rgba(58,42,90,0.8)",
            }}
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
  );
}

/* ── Section card: matches CreateClient step-card style ────────── */
function SectionCard({
  num,
  accent,
  children,
}: {
  num: number;
  accent: { color: string; rgb: string };
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: "rgba(8,4,26,0.88)",
        border: `1px solid rgba(${accent.rgb},0.2)`,
        borderLeft: `3px solid ${accent.color}`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(${accent.rgb},0.04) inset, 0 0 50px rgba(${accent.rgb},0.04)`,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, rgba(${accent.rgb},0.55), transparent)`,
        }}
      />
      {/* Corner dots */}
      <div
        className="absolute top-3.5 left-5 w-1 h-1 rounded-full"
        style={{
          background: `rgba(${accent.rgb},0.55)`,
          boxShadow: `0 0 6px rgba(${accent.rgb},0.8)`,
        }}
      />
      <div
        className="absolute top-3.5 right-5 w-1 h-1 rounded-full"
        style={{ background: "rgba(124,58,237,0.4)" }}
      />
      {/* Step counter */}
      <div
        className="absolute top-3 right-8 text-[8px] tracking-[2px]"
        style={{
          fontFamily: "var(--font-mono)",
          color: `rgba(${accent.rgb},0.3)`,
        }}
      >
        {String(num).padStart(2, "0")} / 05
      </div>

      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}

/* ── Section header (icon + title + desc) ───────────────────────── */
function SectionHeader({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: { color: string; rgb: string };
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="mt-0.5 flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          background: `rgba(${accent.rgb},0.08)`,
          border: `1px solid rgba(${accent.rgb},0.22)`,
        }}
      >
        {icon}
      </div>
      <div>
        <h2
          className="text-[17px] tracking-[3px] uppercase font-black text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p
          className="text-[12px] mt-0.5"
          style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.7)" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ── Main form ─────────────────────────────────────────────────── */
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
      if (isEdit) {
        router.push("/personas");
      } else {
        router.push(`/personas/${data.persona.id}/edit`);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error.");
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-transparent text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none";
  const inputStyle = { fontFamily: "var(--font-body)", fontSize: "16px" };

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  completion > 0 ? "#00e5ff" : "rgba(0,229,255,0.18)",
                boxShadow:
                  completion > 0 ? "0 0 7px rgba(0,229,255,0.85)" : "none",
              }}
            />
            <span
              className="text-[8px] tracking-[3px] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgba(0,229,255,0.4)",
              }}
            >
              ENCODING PROGRESS
            </span>
          </div>
          <span
            className="text-[13px] font-black tabular-nums transition-colors duration-500"
            style={{
              fontFamily: "var(--font-mono)",
              color:
                completion === 100
                  ? "#00e5ff"
                  : completion >= 70
                  ? "rgba(0,229,255,0.85)"
                  : "rgba(167,139,250,0.7)",
            }}
          >
            {completion}%
          </span>
        </div>
        <div
          className="relative h-[2px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
              background: "linear-gradient(90deg,#00e5ff 0%,#a78bfa 100%)",
              boxShadow:
                completion > 0 ? "0 0 10px rgba(0,229,255,0.5)" : "none",
            }}
          />
        </div>
      </div>

      <div className="space-y-5">

        {/* ── [01] VISUAL IDENTITY ── */}
        <div className="pf-section-1">
          <SectionCard num={1} accent={SEC[1]}>
            <SectionHeader
              accent={SEC[1]}
              title="Visual Identity"
              subtitle="Your avatar — the face they see before you speak."
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEC[1].color} strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
                </svg>
              }
            />
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex items-center justify-center"
                style={{ width: 156, height: 156 }}
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
                  onUploaded={(url) =>
                    setDraft({ ...draft, avatar_url: url })
                  }
                  size={140}
                />
              </div>
              <p
                className="text-[10px] tracking-[2px] uppercase transition-colors duration-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: draft.avatar_url
                    ? "rgba(0,229,255,0.65)"
                    : "rgba(122,106,154,0.4)",
                }}
              >
                {draft.avatar_url
                  ? "◈ VISUAL SIGNATURE ENCODED"
                  : "◈ TAP TO UPLOAD VISUAL SIGNATURE"}
              </p>
              <p
                className="text-[11px] italic"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(122,106,154,0.3)",
                }}
              >
                Square images · Max 20 MB
              </p>
            </div>
          </SectionCard>
        </div>

        {/* ── [02] IDENTITY DATA ── */}
        <div className="pf-section-2">
          <SectionCard num={2} accent={SEC[2]}>
            <SectionHeader
              accent={SEC[2]}
              title="Identity Data"
              subtitle="The core facts that shape how you present yourself."
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEC[2].color} strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="9" x2="12" y2="9" />
                  <line x1="7" y1="13" x2="17" y2="13" />
                  <line x1="7" y1="17" x2="14" y2="17" />
                </svg>
              }
            />
            <div className="space-y-3">
              <FieldPanel
                label="Name"
                required
                accent="purple"
                charCount={draft.name.length}
                maxCount={MAX_NAME_LEN}
              >
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  maxLength={MAX_NAME_LEN}
                  placeholder="What should they call you?"
                  className={inputCls}
                  style={inputStyle}
                />
              </FieldPanel>

              <div className="grid grid-cols-2 gap-3">
                <FieldPanel label="Age" required accent="purple">
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
                    className={inputCls}
                    style={inputStyle}
                  />
                </FieldPanel>

                <FieldPanel label="Tone" accent="purple">
                  <div className="relative">
                    <select
                      value={draft.tone}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          tone: e.target.value as PersonaTone,
                        })
                      }
                      className={`${inputCls} appearance-none pr-6 cursor-pointer`}
                      style={inputStyle}
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
                    <svg
                      className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="rgba(167,139,250,0.4)"
                      strokeWidth="2.5" strokeLinecap="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </FieldPanel>
              </div>

              <FieldPanel label="Gender · Pronouns" required accent="purple">
                {genderMode === "preset" ? (
                  <div className="relative">
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
                      className={`${inputCls} appearance-none pr-6 cursor-pointer`}
                      style={inputStyle}
                    >
                      <option value="" disabled className="bg-[#08041a]">
                        Choose gender · pronouns
                      </option>
                      {PERSONA_GENDER_PRESETS.map((g) => (
                        <option
                          key={g}
                          value={g}
                          className="bg-[#08041a]"
                        >
                          {g}
                        </option>
                      ))}
                      <option value="__custom__" className="bg-[#08041a]">
                        + Custom (type your own)
                      </option>
                    </select>
                    <svg
                      className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="rgba(167,139,250,0.4)"
                      strokeWidth="2.5" strokeLinecap="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={draft.gender_pronouns}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          gender_pronouns: e.target.value,
                        })
                      }
                      placeholder="e.g. Xenogender · xe/xem"
                      autoFocus
                      maxLength={60}
                      className={`${inputCls} flex-1`}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGenderMode("preset");
                        setDraft({ ...draft, gender_pronouns: "" });
                      }}
                      className="flex-shrink-0 text-[9px] tracking-[2px] uppercase transition-all active:scale-95 whitespace-nowrap"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "rgba(122,106,154,0.7)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        border: "1px solid rgba(124,58,237,0.25)",
                        background: "rgba(124,58,237,0.07)",
                      }}
                    >
                      ← PRESET
                    </button>
                  </div>
                )}
              </FieldPanel>
            </div>
          </SectionCard>
        </div>

        {/* ── [03] NEURAL IMPRINT ── */}
        <div className="pf-section-3">
          <SectionCard num={3} accent={SEC[3]}>
            <SectionHeader
              accent={SEC[3]}
              title="Neural Imprint"
              subtitle="Who you are at depth — the AI reads this most carefully."
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEC[3].color} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 2a5 5 0 0 1 5 5c0 1.5-.5 3-1.5 4L17 13a2 2 0 0 1 0 4h-1v1a2 2 0 0 1-4 0v-1H8a2 2 0 0 1 0-4l1.5-2C8.5 10 8 8.5 8 7a5 5 0 0 1 4-4.9V2z" />
                </svg>
              }
            />
            <FieldPanel
              label="Bio"
              accent="blue"
              charCount={draft.bio.length}
              maxCount={MAX_BIO_LEN}
            >
              <textarea
                value={draft.bio}
                onChange={(e) =>
                  setDraft({ ...draft, bio: e.target.value })
                }
                rows={7}
                maxLength={MAX_BIO_LEN}
                placeholder="Who are you? Personality, backstory, communication style, what makes you tick — the more you encode here, the more precisely the AI mirrors you."
                className={`${inputCls} resize-none leading-relaxed`}
                style={{ ...inputStyle, lineHeight: 1.75 }}
              />
            </FieldPanel>
          </SectionCard>
        </div>

        {/* ── [04] BEHAVIORAL MATRIX ── */}
        <div className="pf-section-4">
          <SectionCard num={4} accent={SEC[4]}>
            <SectionHeader
              accent={SEC[4]}
              title="Behavioral Matrix"
              subtitle="What you love — woven naturally into every conversation."
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEC[4].color} strokeWidth="1.8" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <FieldPanel
              label="Interests & Hobbies"
              accent="orange"
              charCount={draft.hobbies_text.length}
              maxCount={MAX_HOBBIES_LEN}
            >
              <textarea
                value={draft.hobbies_text}
                onChange={(e) =>
                  setDraft({ ...draft, hobbies_text: e.target.value })
                }
                rows={4}
                maxLength={MAX_HOBBIES_LEN}
                placeholder="Books, music, gaming, anime — the things that light you up."
                className={`${inputCls} resize-none leading-relaxed`}
                style={{ ...inputStyle, lineHeight: 1.75 }}
              />
            </FieldPanel>
          </SectionCard>
        </div>

        {/* ── [05] SIGNATURE TAGS ── */}
        <div className="pf-section-5">
          <SectionCard num={5} accent={SEC[5]}>
            <SectionHeader
              accent={SEC[5]}
              title="Signature Tags"
              subtitle="Tag yourself — gives the AI an instant vibe-read."
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEC[5].color} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              }
            />
            <TagsInput
              value={draft.tags}
              onChange={(tags) => setDraft({ ...draft, tags })}
            />
          </SectionCard>
        </div>

        {/* Error */}
        {error && (
          <div
            className="px-5 py-4 rounded-xl text-[13px] leading-relaxed"
            style={{
              border: "1px solid rgba(239,68,68,0.25)",
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
          className="flex flex-col-reverse sm:flex-row gap-3 pt-1"
          style={{
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          }}
        >
          <button
            onClick={() => router.back()}
            className="flex-1 sm:flex-none sm:px-8 py-4 rounded-xl text-[11px] tracking-[3px] transition-all active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(124,58,237,0.15)",
              color: "rgba(167,139,250,0.5)",
            }}
          >
            ← ABORT
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="pf-btn-primary flex-1 relative overflow-hidden py-4 rounded-xl font-black text-[11px] tracking-[4px] disabled:opacity-40 transition-all active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-mono)",
              background: submitting
                ? "rgba(0,229,255,0.55)"
                : "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)",
              color: "#000",
              boxShadow: submitting
                ? "none"
                : "0 0 40px rgba(0,229,255,0.4), 0 8px 28px rgba(0,0,0,0.5)",
            }}
          >
            <span className="relative z-10">
              {submitting
                ? "◈ ENCODING SEQUENCE..."
                : isEdit
                ? "◈ COMMIT CHANGES →"
                : "◈ INITIALIZE PERSONA →"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes pfSlideIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pfShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .pf-section-1 { animation: pfSlideIn 0.52s cubic-bezier(0.16,1,0.3,1) 0.04s both; }
        .pf-section-2 { animation: pfSlideIn 0.52s cubic-bezier(0.16,1,0.3,1) 0.13s both; }
        .pf-section-3 { animation: pfSlideIn 0.52s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .pf-section-4 { animation: pfSlideIn 0.52s cubic-bezier(0.16,1,0.3,1) 0.31s both; }
        .pf-section-5 { animation: pfSlideIn 0.52s cubic-bezier(0.16,1,0.3,1) 0.40s both; }

        .pf-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: pfShimmer 2.8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
