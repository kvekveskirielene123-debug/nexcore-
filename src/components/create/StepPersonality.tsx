"use client";

import { useState } from "react";
import type { StepProps } from "@/lib/create/types";
import { MessageText } from "@/components/ui/MessageText";

/* ── FieldPanel ─────────────────────────────────────────────────────────── */

function FieldPanel({
  label,
  accent = "cyan",
  charCount,
  maxCount,
  hint,
  children,
}: {
  label: string;
  accent?: "cyan" | "purple";
  charCount?: number;
  maxCount?: number;
  hint?: string;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const C = {
    cyan:   { dot: "#00e5ff", glow: "rgba(0,229,255,0.75)", border: "rgba(0,229,255,0.5)",   label: "rgba(0,229,255,0.8)",   line: "rgba(0,229,255,0.55)",   outer: "rgba(0,229,255,0.07)" },
    purple: { dot: "#a78bfa", glow: "rgba(167,139,250,0.75)", border: "rgba(167,139,250,0.5)", label: "rgba(167,139,250,0.8)", line: "rgba(167,139,250,0.55)", outer: "rgba(167,139,250,0.06)" },
  }[accent];
  const overLimit = charCount !== undefined && maxCount !== undefined && charCount > maxCount * 0.85;

  return (
    <div
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
      className="relative rounded-xl overflow-hidden transition-all duration-250"
      style={{
        background: "rgba(5,2,13,0.8)",
        border: `1px solid ${focused ? C.border : "rgba(124,58,237,0.22)"}`,
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
            {label}
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

      {hint && (
        <div className="px-4 pb-3 -mt-1 flex items-center" style={{ borderTop: "1px solid rgba(124,58,237,0.07)" }}>
          <span className="text-[9px]" style={{ fontFamily: "var(--font-body)", color: "rgba(58,42,90,0.7)" }}>{hint}</span>
        </div>
      )}
    </div>
  );
}

/* ── Nav buttons ────────────────────────────────────────────────────────── */

function CrBackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] tracking-[2px] uppercase transition-all duration-200 active:scale-95"
      style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(167,139,250,0.7)", background: "rgba(124,58,237,0.04)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.45)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.25)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.7)"; }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      BACK
    </button>
  );
}

function CrNextBtn({ onClick, label = "NEXT" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="cr-btn-primary relative flex items-center gap-2.5 px-9 py-3.5 rounded-xl font-bold text-[11px] tracking-[4px] uppercase transition-all duration-200 active:scale-95"
      style={{ fontFamily: "var(--font-mono)", background: "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)", color: "#05020d", boxShadow: "0 0 40px rgba(0,229,255,0.5), 0 8px 28px rgba(0,0,0,0.4)" }}
    >
      <span className="relative z-10 flex items-center gap-2.5">
        {label}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </span>
    </button>
  );
}

/* ── Step ──────────────────────────────────────────────────────────────── */

export function StepPersonality({ draft, setDraft, goNext, goBack }: StepProps) {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg tracking-[3px] uppercase font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            Personality
          </h2>
          <p className="text-[12px] text-[#7a6a9a] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            How do they present themselves to the world?
          </p>
        </div>
      </div>

      {/* Description */}
      <FieldPanel
        label="About · Profile Copy"
        accent="purple"
        charCount={draft.description.length}
        maxCount={2000}
        hint="Shown on their profile page"
      >
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={5}
          maxLength={2000}
          placeholder="A short 'about' paragraph shown on the character's profile page. Describe who they are, their vibe, what makes them feel real. Written about them — third person works great."
          className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
        />
      </FieldPanel>

      {/* Greeting */}
      <FieldPanel
        label="First Transmission · Opening Line"
        accent="cyan"
        charCount={draft.greeting.length}
        maxCount={2500}
        hint="Make it feel alive — first impressions matter"
      >
        <textarea
          value={draft.greeting}
          onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
          rows={4}
          maxLength={2500}
          placeholder={`The first message they send in every new chat.\n\nExample: "The stars told me you'd arrive. I've been mapping your constellation since before you knew you were lost…"`}
          className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
        />

        {draft.greeting && (
          <div className="mt-3 rounded-lg px-3 py-3" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.14)" }}>
            <p className="text-[8px] tracking-[2.5px] uppercase mb-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.35)" }}>◈ PREVIEW</p>
            <p className="text-[12px] text-[#c0b8d8] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <MessageText text={draft.greeting} />
            </p>
          </div>
        )}
      </FieldPanel>

      <div className="flex justify-between pt-2">
        <CrBackBtn onClick={goBack} />
        <CrNextBtn onClick={goNext} label="ENCODE" />
      </div>
    </div>
  );
}
