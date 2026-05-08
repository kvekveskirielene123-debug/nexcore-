"use client";

import { useState } from "react";
import Link from "next/link";
import type { StepProps } from "@/lib/create/types";

export function StepSettings({ draft, setDraft, goNext, goBack }: StepProps) {
  const [previewTab, setPreviewTab] = useState<"chat" | "card">("chat");
  const isPublic = draft.visibility === "public";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg tracking-[3px] uppercase font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            Settings
          </h2>
          <p className="text-[12px] text-[#7a6a9a] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            Who gets to meet them?
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <ToggleRow
          title="Visibility"
          desc={isPublic ? "Visible in Explore. Anyone on Nexcor can chat with them." : "Private. Only you can see and chat with them."}
          checked={isPublic}
          onChange={(v) => setDraft({ ...draft, visibility: v ? "public" : "private" })}
          labelOn="PUBLIC"
          labelOff="PRIVATE"
        />
        <ToggleRow
          title="NSFW Content"
          desc={draft.is_nsfw ? "Hidden from users who haven't opted in to mature content." : "This character is safe for work."}
          checked={draft.is_nsfw}
          onChange={(v) => setDraft({ ...draft, is_nsfw: v })}
          labelOn="NSFW"
          labelOff="SFW"
          nsfwDot={draft.is_nsfw}
        />
      </div>

      {/* Preview */}
      <div>
        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[9px] tracking-[3px] text-[#3a2a5a] uppercase mr-2" style={{ fontFamily: "var(--font-mono)" }}>◈ PREVIEW</span>
          {(["chat", "card"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPreviewTab(tab)}
              className="px-3 py-1.5 rounded-md text-[10px] tracking-[1.5px] uppercase transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: previewTab === tab ? "rgba(0,229,255,0.12)" : "transparent",
                border: previewTab === tab ? "1px solid rgba(0,229,255,0.35)" : "1px solid rgba(124,58,237,0.2)",
                color: previewTab === tab ? "#00e5ff" : "#5a4a7a",
              }}
            >
              {tab === "chat" ? "💬 CHAT VIEW" : "🃏 CARD VIEW"}
            </button>
          ))}
        </div>

        {previewTab === "chat" ? (
          <ChatPreview draft={draft} />
        ) : (
          <CardPreview draft={draft} isPublic={isPublic} />
        )}
      </div>

      {/* Guidelines */}
      <p className="text-[11px] text-[#5a4a7a] italic text-center" style={{ fontFamily: "var(--font-body)" }}>
        Public characters must follow our{" "}
        <Link href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline">
          community guidelines
        </Link>.
      </p>

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
          NEXT · REVIEW →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chat Preview
───────────────────────────────────────────── */

function ChatPreview({ draft }: { draft: import("@/lib/create/types").CharacterDraft }) {
  const name     = draft.name     || "Character Name";
  const pronouns = draft.gender_pronouns || "she/her";
  const greeting = draft.greeting.trim();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(5,2,13,0.95)",
        border: "1px solid rgba(124,58,237,0.25)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        maxWidth: 420,
      }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(8,4,26,0.9)",
          borderBottom: "1px solid rgba(124,58,237,0.15)",
        }}
      >
        {/* Back arrow */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.5)" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>

        {/* Avatar */}
        <div
          className="relative flex-shrink-0 rounded-full overflow-hidden"
          style={{ width: 36, height: 36, border: "1.5px solid rgba(0,229,255,0.3)" }}
        >
          {draft.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.avatar_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
              <span className="text-[14px] font-black text-purple-400" style={{ fontFamily: "var(--font-display)" }}>
                {name[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          {/* Online dot */}
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#4ade80", borderColor: "#08041a" }}
          />
        </div>

        {/* Name + pronouns */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white truncate leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {name}
          </p>
          <p className="text-[10px] text-[#5a4a7a] leading-tight" style={{ fontFamily: "var(--font-mono)" }}>
            {pronouns}
          </p>
        </div>

        {/* Menu dots */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.4)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </div>

      {/* Messages area */}
      <div className="px-4 py-5 space-y-4" style={{ minHeight: 180 }}>
        {/* Date divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.12)" }} />
          <span className="text-[9px] tracking-[2px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-mono)" }}>TODAY</span>
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.12)" }} />
        </div>

        {/* Character greeting bubble */}
        {greeting ? (
          <div className="flex items-end gap-2.5 max-w-[92%]">
            <div
              className="flex-shrink-0 rounded-full overflow-hidden"
              style={{ width: 28, height: 28, border: "1px solid rgba(124,58,237,0.3)" }}
            >
              {draft.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
                  <span className="text-[10px] font-black text-purple-400" style={{ fontFamily: "var(--font-display)" }}>
                    {name[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div
                className="rounded-2xl rounded-bl-sm px-4 py-3 text-[13px] leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "rgba(124,58,237,0.18)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#e2d9f3",
                  maxWidth: 280,
                }}
              >
                {greeting}
              </div>
              <p className="text-[9px] text-[#3a2a5a] mt-1 ml-1" style={{ fontFamily: "var(--font-mono)" }}>
                just now
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl px-4 py-3 text-[11px] text-center"
            style={{
              fontFamily: "var(--font-body)",
              background: "rgba(124,58,237,0.06)",
              border: "1px dashed rgba(124,58,237,0.2)",
              color: "#3a2a5a",
            }}
          >
            No greeting yet — go back to <span style={{ color: "#a78bfa" }}>Personality</span> to write one
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{
          background: "rgba(8,4,26,0.8)",
          borderTop: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <div
          className="flex-1 rounded-xl px-3 py-2 text-[12px] text-[#2e1e4a]"
          style={{
            fontFamily: "var(--font-body)",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.15)",
          }}
        >
          Say something…
        </div>
        <div
          className="flex-shrink-0 rounded-xl flex items-center justify-center"
          style={{ width: 36, height: 36, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card Preview
───────────────────────────────────────────── */

function CardPreview({ draft, isPublic }: { draft: import("@/lib/create/types").CharacterDraft; isPublic: boolean }) {
  return (
    <div style={{ maxWidth: 200 }}>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(8,4,26,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        <div className="relative" style={{ aspectRatio: "1/1" }}>
          {draft.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.avatar_url}
              alt="preview"
              className="w-full h-full object-cover"
              style={draft.is_nsfw ? { filter: "blur(10px)", transform: "scale(1.05)" } : undefined}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(20,8,48,0.9)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
          {draft.is_nsfw && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] tracking-[2px] px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.5)", color: "#f59e0b" }}>
                MATURE
              </span>
            </div>
          )}
          {!isPublic && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(5,2,13,0.75)", border: "1px solid rgba(124,58,237,0.4)" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="text-[8px] tracking-[1px] text-[#a78bfa]" style={{ fontFamily: "var(--font-mono)" }}>PRIVATE</span>
            </div>
          )}
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>
            {draft.name || <span className="text-[#3a2a5a]">Name</span>}
          </p>
          {draft.subtitle && <p className="text-[10px] text-[#7a6a9a] truncate mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{draft.subtitle}</p>}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[8px] tracking-[1.5px] px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", background: isPublic ? "rgba(0,229,255,0.08)" : "rgba(124,58,237,0.08)", border: `1px solid ${isPublic ? "rgba(0,229,255,0.25)" : "rgba(124,58,237,0.25)"}`, color: isPublic ? "#00e5ff" : "#a78bfa" }}>
              {isPublic ? "PUBLIC" : "PRIVATE"}
            </span>
            {draft.is_nsfw && (
              <span className="text-[8px] tracking-[1.5px] px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>NSFW</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Toggle row
───────────────────────────────────────────── */

function ToggleRow({ title, desc, checked, onChange, labelOn, labelOff, nsfwDot }: {
  title: string; desc: string;
  checked: boolean; onChange: (v: boolean) => void;
  labelOn: string; labelOff: string;
  nsfwDot?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl p-4 transition-all"
      style={{ background: "rgba(8,4,26,0.6)", border: "1px solid rgba(124,58,237,0.18)" }}
    >
      <div className="flex-1">
        <h3 className="text-[12px] tracking-[2px] text-white uppercase mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          {title}
          {nsfwDot && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }} />}
        </h3>
        <p className="text-[12px] text-[#5a4a7a]" style={{ fontFamily: "var(--font-body)" }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} labelOn={labelOn} labelOff={labelOff} />
    </div>
  );
}

function Toggle({ checked, onChange, labelOn, labelOff }: {
  checked: boolean; onChange: (v: boolean) => void;
  labelOn: string; labelOff: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 flex-shrink-0">
      <span style={{ display: "inline-block", position: "relative", width: 56, height: 28, borderRadius: 14, backgroundColor: checked ? "rgba(0,229,255,0.25)" : "rgba(60,30,90,0.5)", border: `1.5px solid ${checked ? "rgba(0,229,255,0.6)" : "rgba(124,58,237,0.3)"}`, boxShadow: checked ? "0 0 12px rgba(0,229,255,0.25)" : "none", transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 3, left: checked ? 31 : 3, width: 22, height: 22, borderRadius: "50%", backgroundColor: checked ? "#00e5ff" : "#7a6a9a", boxShadow: checked ? "0 0 8px rgba(0,229,255,0.7)" : "none", transition: "left 0.25s ease-in-out, background-color 0.25s ease, box-shadow 0.25s ease" }} />
      </span>
      <span className="text-[10px] tracking-[2px] min-w-[52px] text-left" style={{ fontFamily: "var(--font-mono)", color: checked ? "#00e5ff" : "#7a6a9a", transition: "color 0.25s ease" }}>
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
