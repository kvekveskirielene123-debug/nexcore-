"use client";

import type { StepProps } from "@/lib/create/types";

export function StepPersonality({ draft, setDraft, goNext, goBack }: StepProps) {
  return (
    <div className="space-y-8">
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
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "rgba(8,4,26,0.6)", border: "1px solid rgba(124,58,237,0.18)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.8)" }} />
          <span className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "#a78bfa" }}>
            ABOUT · PROFILE COPY
          </span>
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={5}
          maxLength={2000}
          placeholder="A short 'about' paragraph shown on the character's profile page. Describe who they are, their vibe, what makes them feel real. Written about them — third person works great."
          className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
          onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(167,139,250,0.4)")}
          onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(124,58,237,0.18)")}
        />
        <div className="flex justify-between items-center pt-1 border-t border-purple-700/15">
          <span className="text-[10px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-body)" }}>
            Shown on their profile page
          </span>
          <span className="text-[10px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: draft.description.length > 1800 ? "#fbbf24" : "#3a2a5a" }}>
            {draft.description.length}/2000
          </span>
        </div>
      </div>

      {/* Greeting */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "rgba(8,4,26,0.6)", border: "1px solid rgba(0,229,255,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.8)" }} />
          <span className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "#00e5ff" }}>
            FIRST TRANSMISSION · OPENING LINE
          </span>
        </div>
        <textarea
          value={draft.greeting}
          onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
          rows={4}
          maxLength={2500}
          placeholder={`The first message they send in every new chat.\n\nExample: "The stars told me you'd arrive. I've been mapping your constellation since before you knew you were lost…"`}
          className="w-full bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
          onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(0,229,255,0.4)")}
          onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(0,229,255,0.15)")}
        />

        {/* Live preview of greeting */}
        {draft.greeting && (
          <div className="rounded-lg p-3 mt-1" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <p className="text-[9px] tracking-[2px] text-[#5a4a7a] uppercase mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>Preview</p>
            <p className="text-[12px] text-[#c0b8d8] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              &ldquo;{draft.greeting}&rdquo;
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-1 border-t border-cyan-400/10">
          <span className="text-[10px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-body)" }}>
            Make it feel alive — first impressions matter
          </span>
          <span className="text-[10px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: draft.greeting.length > 2300 ? "#fbbf24" : "#3a2a5a" }}>
            {draft.greeting.length}/2500
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={goBack}
          className="px-6 py-3 rounded-lg text-[11px] tracking-[2px] transition-all"
          style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}
        >
          ← BACK
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 rounded-lg font-bold text-[11px] tracking-[3px] transition-all active:scale-95"
          style={{ fontFamily: "var(--font-mono)", background: "#00e5ff", color: "#05020d", boxShadow: "0 0 24px rgba(0,229,255,0.3)" }}
        >
          NEXT · MEMORY →
        </button>
      </div>
    </div>
  );
}
