"use client";

import Link from "next/link";
import type { StepProps } from "@/lib/create/types";

export function StepSettings({ draft, setDraft, goNext, goBack }: StepProps) {
  const isPublic = draft.visibility === "public";

  return (
    <div className="space-y-7">
      <div>
        <h2
          className="text-xl tracking-[3px] uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
        >
          ◈ Settings
        </h2>
        <p className="text-sm text-[#a78bfa] italic" style={{ fontFamily: "var(--font-body)" }}>
          Who gets to meet them?
        </p>
      </div>

      {/* Visibility */}
      <div className="rounded-lg border border-purple-700/20 bg-[#0c0520]/50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3
              className="text-[12px] tracking-[2px] text-white uppercase mb-1"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Visibility
            </h3>
            <p className="text-[12px] text-[#7a6a9a]" style={{ fontFamily: "var(--font-body)" }}>
              {isPublic
                ? "Visible in Explore. Anyone on Nexcor can chat with them."
                : "Private. Only you can see and chat with them."}
            </p>
          </div>
          <Toggle
            checked={isPublic}
            onChange={(v) => setDraft({ ...draft, visibility: v ? "public" : "private" })}
            labelOn="PUBLIC"
            labelOff="PRIVATE"
          />
        </div>
      </div>

      {/* NSFW */}
      <div className="rounded-lg border border-purple-700/20 bg-[#0c0520]/50 p-5">
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
                  style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
                />
              )}
            </h3>
            <p className="text-[12px] text-[#7a6a9a]" style={{ fontFamily: "var(--font-body)" }}>
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

      {/* ── Live Preview ── */}
      <div>
        <p
          className="text-[9px] tracking-[3px] text-[#5a4a7a] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ◈ CARD PREVIEW
        </p>

        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "rgba(8,4,26,0.8)",
            border: "1px solid rgba(124,58,237,0.2)",
            maxWidth: 220,
          }}
        >
          {/* Avatar area */}
          <div
            className="relative w-full flex items-center justify-center"
            style={{ aspectRatio: "1/1", background: "rgba(20,8,48,0.9)" }}
          >
            {draft.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.avatar_url}
                alt="preview"
                className="w-full h-full object-cover"
                style={draft.is_nsfw ? { filter: "blur(12px)", transform: "scale(1.05)" } : undefined}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="text-[10px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-mono)" }}>
                  NO AVATAR
                </span>
              </div>
            )}

            {/* NSFW blur overlay label */}
            {draft.is_nsfw && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                style={{ background: "rgba(5,2,13,0.3)" }}
              >
                <span
                  className="text-[9px] tracking-[2px] px-2 py-0.5 rounded"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.5)",
                    color: "#f59e0b",
                  }}
                >
                  MATURE
                </span>
              </div>
            )}

            {/* Private lock overlay */}
            {!isPublic && (
              <div
                className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(5,2,13,0.75)",
                  border: "1px solid rgba(124,58,237,0.4)",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-[8px] tracking-[1px] text-[#a78bfa]" style={{ fontFamily: "var(--font-mono)" }}>
                  PRIVATE
                </span>
              </div>
            )}
          </div>

          {/* Card info */}
          <div className="px-3 py-2.5">
            <p
              className="text-[13px] font-semibold text-white truncate mb-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {draft.name || <span className="text-[#3a2a5a]">Character Name</span>}
            </p>
            {draft.subtitle && (
              <p
                className="text-[10px] text-[#7a6a9a] truncate"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {draft.subtitle}
              </p>
            )}

            {/* Badges row */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span
                className="text-[8px] tracking-[1.5px] px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: isPublic ? "rgba(0,229,255,0.1)" : "rgba(124,58,237,0.1)",
                  border: `1px solid ${isPublic ? "rgba(0,229,255,0.3)" : "rgba(124,58,237,0.3)"}`,
                  color: isPublic ? "#00e5ff" : "#a78bfa",
                }}
              >
                {isPublic ? "PUBLIC" : "PRIVATE"}
              </span>
              {draft.is_nsfw && (
                <span
                  className="text-[8px] tracking-[1.5px] px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    color: "#f59e0b",
                  }}
                >
                  NSFW
                </span>
              )}
            </div>
          </div>
        </div>

        <p
          className="text-[10px] text-[#3a2a5a] mt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          This is how your character will appear on cards.
        </p>
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
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 flex-shrink-0"
    >
      {/* Track */}
      <span
        style={{
          display: "inline-block",
          position: "relative",
          width: 56,
          height: 28,
          borderRadius: 14,
          backgroundColor: checked ? "rgba(0,229,255,0.25)" : "rgba(60,30,90,0.5)",
          border: `1.5px solid ${checked ? "rgba(0,229,255,0.6)" : "rgba(124,58,237,0.3)"}`,
          boxShadow: checked ? "0 0 12px rgba(0,229,255,0.25)" : "none",
          transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
          flexShrink: 0,
        }}
      >
        {/* Knob */}
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 31 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: checked ? "#00e5ff" : "#7a6a9a",
            boxShadow: checked ? "0 0 8px rgba(0,229,255,0.7)" : "none",
            transition: "left 0.25s ease-in-out, background-color 0.25s ease, box-shadow 0.25s ease",
          }}
        />
      </span>

      {/* Label */}
      <span
        className="text-[10px] tracking-[2px] min-w-[52px] text-left"
        style={{
          fontFamily: "var(--font-mono)",
          color: checked ? "#00e5ff" : "#7a6a9a",
          transition: "color 0.25s ease",
        }}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
