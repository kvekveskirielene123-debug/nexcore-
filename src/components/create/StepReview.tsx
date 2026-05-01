"use client";

import type { StepProps, StepId } from "@/lib/create/types";

interface StepReviewProps extends StepProps {
  onJumpToStep: (step: StepId) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;
  /** Override submit button label (edit mode). Default: "◈ SYNTHESIZE ENTITY →" */
  submitLabel?: string;
  /** Override submitting label. Default: "SYNTHESIZING..." */
  submittingLabel?: string;
}

export function StepReview({
  draft,
  onJumpToStep,
  goBack,
  onSubmit,
  submitting,
  submitError,
  submitLabel = "◈ SYNTHESIZE ENTITY →",
  submittingLabel = "SYNTHESIZING...",
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Review
        </h2>
        <p
          className="text-sm text-[#a78bfa] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          One last look before synthesis.
        </p>
      </div>

      {/* Card-style preview */}
      <div className="rounded-2xl border border-cyan-400/20 bg-[#0c0520]/80 overflow-hidden">
        <div className="absolute" />
        <div className="relative">
          {/* Top gradient */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="p-6 flex gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {draft.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.avatar_url}
                  alt={draft.name}
                  className="w-24 h-24 rounded-xl object-cover border border-cyan-400/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-[#150035] border border-purple-700/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-2xl font-black uppercase tracking-[3px] text-cyan-400"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 0 16px rgba(0,229,255,0.3)",
                }}
              >
                {draft.name || "(no name)"}
              </h3>
              {draft.subtitle && (
                <p
                  className="text-sm italic text-[#a78bfa] mt-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {draft.subtitle}
                </p>
              )}
              <p
                className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase mt-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {draft.gender_pronouns || "—"}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge color={draft.visibility === "public" ? "cyan" : "purple"}>
                  {draft.visibility === "public" ? "PUBLIC" : "PRIVATE"}
                </Badge>
                {draft.is_nsfw && <Badge color="amber">NSFW</Badge>}
              </div>
            </div>
          </div>

          {draft.greeting && (
            <div className="px-6 pb-4">
              <SectionHeader>First Transmission</SectionHeader>
              <div
                className="rounded-lg bg-purple-900/15 border border-purple-700/25 p-4 text-sm italic text-[#d0c4f0] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                &ldquo;{draft.greeting}&rdquo;
              </div>
            </div>
          )}

          {draft.description && (
            <div className="px-6 pb-4">
              <SectionHeader>About</SectionHeader>
              <p
                className="text-sm text-[#c0b8d8] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {draft.description}
              </p>
            </div>
          )}

          {draft.long_term_memory && (
            <div className="px-6 pb-6">
              <SectionHeader>Memory</SectionHeader>
              <pre
                className="text-[12px] text-[#a78bfa] whitespace-pre-wrap bg-[#08041a] border border-purple-700/20 rounded-lg p-3 max-h-48 overflow-auto leading-relaxed"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {draft.long_term_memory.slice(0, 600)}
                {draft.long_term_memory.length > 600 && "\n\n… (truncated for preview)"}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Edit jump links */}
      <div className="flex flex-wrap gap-2">
        {[
          { step: 1, label: "◈ Edit Identity" },
          { step: 2, label: "◈ Edit Personality" },
          { step: 3, label: "◈ Edit Memory" },
          { step: 4, label: "◈ Edit Settings" },
        ].map((b) => (
          <button
            key={b.step}
            onClick={() => onJumpToStep(b.step as StepId)}
            className="text-[10px] tracking-[2px] px-3 py-1.5 rounded-md border border-purple-700/25 text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {submitError && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={goBack}
          disabled={submitting}
          className="px-6 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← BACK
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-10 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] disabled:opacity-50 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[9px] tracking-[3px] text-[#5a4a7a] uppercase mb-2"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      ◈ {children}
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: "cyan" | "purple" | "amber";
  children: React.ReactNode;
}) {
  const styles = {
    cyan: {
      border: "rgba(0,229,255,0.4)",
      bg: "rgba(0,229,255,0.08)",
      color: "#00e5ff",
    },
    purple: {
      border: "rgba(124,58,237,0.4)",
      bg: "rgba(124,58,237,0.08)",
      color: "#a78bfa",
    },
    amber: {
      border: "rgba(245,158,11,0.4)",
      bg: "rgba(245,158,11,0.08)",
      color: "#fbbf24",
    },
  }[color];

  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md border text-[9px] tracking-[2px]"
      style={{
        fontFamily: "var(--font-mono)",
        borderColor: styles.border,
        background: styles.bg,
        color: styles.color,
      }}
    >
      {children}
    </span>
  );
}
