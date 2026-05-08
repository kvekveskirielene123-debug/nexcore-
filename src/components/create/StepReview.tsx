"use client";

import type { StepProps, StepId } from "@/lib/create/types";
import { MessageText } from "@/components/ui/MessageText";

interface StepReviewProps extends StepProps {
  onJumpToStep: (step: StepId) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;
  submitLabel?: string;
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
  const name     = draft.name     || "(no name)";
  const rawGreeting = draft.greeting.trim();
  const greeting = rawGreeting
    .replace(/\{\{char\}\}/gi, name)
    .replace(/\{\{user\}\}/gi, "you");

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg tracking-[3px] uppercase font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            Review
          </h2>
          <p className="text-[12px] text-[#7a6a9a] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            One last look before synthesis.
          </p>
        </div>
      </div>

      {/* Two-column layout: chat preview + info */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-6 items-start">

        {/* Left — chat preview */}
        <div
          className="rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: "rgba(5,2,13,0.95)", border: "1px solid rgba(124,58,237,0.25)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "rgba(8,4,26,0.9)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
            <div className="relative flex-shrink-0 rounded-full overflow-hidden" style={{ width: 34, height: 34, border: "1.5px solid rgba(0,229,255,0.3)" }}>
              {draft.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
                  <span className="text-[12px] font-black text-purple-400" style={{ fontFamily: "var(--font-display)" }}>{name[0]?.toUpperCase()}</span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: "#4ade80", borderColor: "#08041a" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-tight" style={{ fontFamily: "var(--font-display)" }}>{name}</p>
              <p className="text-[9px] text-[#5a4a7a] leading-tight" style={{ fontFamily: "var(--font-mono)" }}>{draft.gender_pronouns || "—"}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
              <span className="text-[9px] tracking-[2px] text-[#2e1e4a]" style={{ fontFamily: "var(--font-mono)" }}>TODAY</span>
              <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
            </div>

            {greeting ? (
              <div className="flex items-end gap-2 max-w-[92%]">
                <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 26, height: 26, border: "1px solid rgba(124,58,237,0.3)" }}>
                  {draft.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
                      <span className="text-[9px] font-black text-purple-400" style={{ fontFamily: "var(--font-display)" }}>{name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-3 py-2.5 text-[12px] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.22)", color: "#e2d9f3" }}
                >
                  <MessageText text={greeting} truncate={300} />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-[#3a2a5a] italic" style={{ fontFamily: "var(--font-body)" }}>
                No greeting — add one in Personality step
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "rgba(8,4,26,0.8)", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
            <div className="flex-1 rounded-xl px-3 py-1.5 text-[11px] text-[#2e1e4a]" style={{ fontFamily: "var(--font-body)", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
              Say something…
            </div>
            <div className="flex-shrink-0 rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.18)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Right — character info */}
        <div className="space-y-4">
          {/* Name + badges */}
          <div>
            <h3 className="text-2xl font-black uppercase tracking-[3px]" style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.3)" }}>
              {name}
            </h3>
            {draft.subtitle && (
              <p className="text-sm italic text-[#a78bfa] mt-1 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {draft.subtitle}
              </p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge color={draft.visibility === "public" ? "cyan" : "purple"}>{draft.visibility === "public" ? "PUBLIC" : "PRIVATE"}</Badge>
              {draft.is_nsfw && <Badge color="amber">NSFW</Badge>}
            </div>
          </div>

          {/* Description */}
          {draft.description && (
            <InfoBlock label="About" accent="purple">
              <p className="text-[13px] text-[#c0b8d8] leading-relaxed line-clamp-4" style={{ fontFamily: "var(--font-body)" }}>
                {draft.description}
              </p>
            </InfoBlock>
          )}

          {/* Memory summary */}
          {draft.long_term_memory && (
            <InfoBlock label="Memory" accent="cyan">
              <pre className="text-[11px] text-[#a78bfa] whitespace-pre-wrap leading-relaxed line-clamp-5 overflow-hidden" style={{ fontFamily: "var(--font-mono)" }}>
                {draft.long_term_memory.slice(0, 300)}{draft.long_term_memory.length > 300 ? "\n…" : ""}
              </pre>
            </InfoBlock>
          )}
        </div>
      </div>

      {/* Edit links */}
      <div className="flex flex-wrap gap-2">
        {([
          { step: 1 as StepId, label: "Identity" },
          { step: 2 as StepId, label: "Personality" },
          { step: 3 as StepId, label: "Memory" },
          { step: 4 as StepId, label: "Settings" },
        ] as { step: StepId; label: string }[]).map((b) => (
          <button
            key={b.step}
            onClick={() => onJumpToStep(b.step)}
            className="text-[10px] tracking-[2px] px-3 py-1.5 rounded-lg transition-all hover:border-cyan-400/40 hover:text-cyan-400"
            style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
          >
            ◈ Edit {b.label}
          </button>
        ))}
      </div>

      {submitError && (
        <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8 text-red-300 text-[13px]" style={{ fontFamily: "var(--font-body)" }}>
          {submitError}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={goBack}
          disabled={submitting}
          className="px-6 py-3 rounded-lg text-[11px] tracking-[2px] transition-all disabled:opacity-40"
          style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}
        >
          ← BACK
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-10 py-3 rounded-lg font-bold text-[11px] tracking-[3px] transition-all active:scale-95 disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)", background: submitting ? "rgba(0,229,255,0.3)" : "#00e5ff", color: "#05020d", boxShadow: submitting ? "none" : "0 0 32px rgba(0,229,255,0.4)" }}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

function InfoBlock({ label, accent, children }: { label: string; accent: "cyan" | "purple"; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(8,4,26,0.6)", border: `1px solid rgba(${accent === "cyan" ? "0,229,255" : "124,58,237"},0.15)` }}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1 h-1 rounded-full" style={{ background: accent === "cyan" ? "#00e5ff" : "#a78bfa" }} />
        <span className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: accent === "cyan" ? "#00e5ff" : "#a78bfa", opacity: 0.7 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Badge({ color, children }: { color: "cyan" | "purple" | "amber"; children: React.ReactNode }) {
  const s = {
    cyan:   { border: "rgba(0,229,255,0.35)",   bg: "rgba(0,229,255,0.08)",   color: "#00e5ff" },
    purple: { border: "rgba(124,58,237,0.35)",  bg: "rgba(124,58,237,0.08)",  color: "#a78bfa" },
    amber:  { border: "rgba(245,158,11,0.35)",  bg: "rgba(245,158,11,0.08)",  color: "#fbbf24" },
  }[color];
  return (
    <span className="inline-block px-2 py-0.5 rounded-md border text-[9px] tracking-[2px]" style={{ fontFamily: "var(--font-mono)", borderColor: s.border, background: s.bg, color: s.color }}>
      {children}
    </span>
  );
}
