"use client";

import type { StepProps } from "@/lib/create/types";
import { MEMORY_TEMPLATE, MEMORY_PLACEHOLDER } from "@/lib/create/templateMemory";

export function StepMemory({ draft, setDraft, goNext, goBack }: StepProps) {
  const charCount = draft.long_term_memory.length;

  const insertTemplate = () => {
    if (draft.long_term_memory.trim().length > 0) {
      const ok = confirm(
        "This will replace your current memory text. Continue?"
      );
      if (!ok) return;
    }
    setDraft({ ...draft, long_term_memory: MEMORY_TEMPLATE });
  };

  return (
    <div className="space-y-7">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Memory
        </h2>
        <p
          className="text-sm text-[#a78bfa] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          The core of who they are. The AI reads this every time they respond.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Long-Term Memory
          </label>
          <button
            type="button"
            onClick={insertTemplate}
            className="text-[10px] tracking-[2px] text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ INSERT TEMPLATE
          </button>
        </div>

        <textarea
          value={draft.long_term_memory}
          onChange={(e) => setDraft({ ...draft, long_term_memory: e.target.value })}
          rows={16}
          maxLength={8000}
          placeholder={MEMORY_PLACEHOLDER}
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-3 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65 }}
        />

        <div className="flex items-center justify-between mt-2">
          <p
            className="text-[10px] text-[#7a6a9a]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Be specific. The more detailed, the more alive.
          </p>
          <p
            className={`text-[10px] tracking-[1px] ${
              charCount > 7800 ? "text-amber-400" : "text-[#7a6a9a]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {charCount}/8000
          </p>
        </div>
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
          NEXT · SETTINGS →
        </button>
      </div>
    </div>
  );
}
