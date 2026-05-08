"use client";

import type { StepProps } from "@/lib/create/types";

export function StepPersonality({ draft, setDraft, goNext, goBack }: StepProps) {
  return (
    <div className="space-y-7">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Personality
        </h2>
        <p
          className="text-sm text-[#a78bfa] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          How does the world see them? What&apos;s the first thing they say?
        </p>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={4}
          maxLength={2000}
          placeholder="A short 'about' paragraph shown on the character's profile. Describe who they are, their vibe, what makes them special."
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <p
          className="text-[10px] text-[#7a6a9a] mt-1.5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Profile copy — written about them (third person is fine). {draft.description.length}/2000
        </p>
      </div>

      <div>
        <Label>Greeting</Label>
        <textarea
          value={draft.greeting}
          onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
          rows={3}
          maxLength={2500}
          placeholder={`The first words they'll say in every new chat.

Example: "The stars told me you'd arrive. I've been mapping your constellation since before you knew you were lost…"`}
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <p
          className="text-[10px] text-[#7a6a9a] mt-1.5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          First impression matters — make it feel alive. {draft.greeting.length}/2500
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={goBack}
          className="px-6 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← BACK
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_28px_rgba(0,229,255,0.4)] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEXT · MEMORY →
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
