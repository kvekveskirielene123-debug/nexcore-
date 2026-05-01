"use client";

import Link from "next/link";
import type { StepProps } from "@/lib/create/types";

export function StepSettings({ draft, setDraft, goNext, goBack }: StepProps) {
  return (
    <div className="space-y-7">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Settings
        </h2>
        <p
          className="text-sm text-[#a78bfa] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Who gets to meet them?
        </p>
      </div>

      {/* Visibility */}
      <div className="rounded-lg border border-purple-700/20 bg-[#0c0520]/50 p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3
              className="text-[12px] tracking-[2px] text-white uppercase mb-1"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Visibility
            </h3>
            <p
              className="text-[12px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {draft.visibility === "public"
                ? "Visible in Explore. Anyone on Nexcor can chat with them."
                : "Private. Only you can see and chat with them."}
            </p>
          </div>
          <Toggle
            checked={draft.visibility === "public"}
            onChange={(v) =>
              setDraft({ ...draft, visibility: v ? "public" : "private" })
            }
            labelOn="PUBLIC"
            labelOff="PRIVATE"
          />
        </div>
      </div>

      {/* NSFW */}
      <div className="rounded-lg border border-purple-700/20 bg-[#0c0520]/50 p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3
              className="text-[12px] tracking-[2px] text-white uppercase mb-1 flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              NSFW Content
              {draft.is_nsfw && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#f59e0b",
                    boxShadow: "0 0 6px rgba(245,158,11,0.8)",
                  }}
                />
              )}
            </h3>
            <p
              className="text-[12px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {draft.is_nsfw
                ? "Hidden from users who haven't opted in to mature content."
                : "This character is safe for work."}
            </p>
          </div>
          <Toggle
            checked={draft.is_nsfw}
            onChange={(v) => setDraft({ ...draft, is_nsfw: v })}
            labelOn="NSFW"
            labelOff="SFW"
          />
        </div>
      </div>

      {/* Guidelines reminder */}
      <p
        className="text-[11px] text-[#7a6a9a] italic text-center pt-2"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Public characters must follow our{" "}
        <Link
          href="/terms"
          target="_blank"
          className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
        >
          community guidelines
        </Link>
        .
      </p>

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
          NEXT · REVIEW →
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  labelOn,
  labelOff,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-cyan-400/80" : "bg-purple-900/40"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span
        className="text-[10px] tracking-[2px] min-w-[55px] text-left"
        style={{
          fontFamily: "var(--font-mono)",
          color: checked ? "#00e5ff" : "#7a6a9a",
        }}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
