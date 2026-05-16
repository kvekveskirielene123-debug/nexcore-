"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { MarksWidget } from "@/components/settings/MarksWidget";
import { SignOutDialog } from "@/components/settings/SignOutDialog";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { SupportContactDialog } from "@/components/support/SupportContactDialog";
import {
  CHAT_LANGUAGES,
  CHAT_THEMES,
  type UserPreferences,
  type DefaultModel,
  type ChatFontSize,
  type ChatThemeKey,
  getThemeByKey,
  getLanguageLabel,
} from "@/lib/settings/preferences";
import { MODELS } from "@/lib/ai/modelConfig";

interface SettingsClientProps {
  username: string;
  bioPreview: string | null;
  avatarUrl: string | null;
  marksBalance: number;
  preferences: UserPreferences;
  isCreator: boolean;
  stats: {
    characterCount: number;
    conversationCount: number;
    messageCount: number;
    marksBalance: number;
  };
}

export function SettingsClient(props: SettingsClientProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(props.preferences);
  const { isCreator } = props;
  const [, startTransition] = useTransition();

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [nsfwConfirmOpen, setNsfwConfirmOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const updatePref = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    // Optimistic update
    const previous = prefs[key];
    setPrefs((p) => ({ ...p, [key]: value }));

    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        // Revert
        setPrefs((p) => ({ ...p, [key]: previous }));
        return;
      }
      // Tiny "saved" flash
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      startTransition(() => {});
    } catch {
      setPrefs((p) => ({ ...p, [key]: previous }));
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/settings/export-data");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexcor-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch {
      // silent fail — user can retry
    } finally {
      setExportLoading(false);
    }
  };

  const currentTheme = getThemeByKey(prefs.chat_theme);

  return (
    <div className="min-h-screen bg-[#05020d] pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center settings-card-enter" style={{ animationDelay: "0s" }}>
          {/* Animated logo */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Radial glow backdrop */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 130,
                height: 130,
                background: "radial-gradient(circle, rgba(0,200,255,0.13) 0%, transparent 70%)",
                animation: "mark-ring-breathe 3.5s ease-in-out infinite",
              }}
            />
            <svg width="96" height="96" viewBox="0 0 80 80" fill="none" aria-hidden>
              {/* Outer breathing ring */}
              <circle cx="40" cy="40" r="37" stroke="rgba(0,229,255,0.13)" strokeWidth="0.8" className="settings-logo-ring" />
              {/* Orbiting dashed ring */}
              <g className="settings-logo-orbit">
                <circle cx="40" cy="40" r="30" stroke="rgba(0,229,255,0.12)" strokeWidth="0.7" strokeDasharray="3 9" />
              </g>
              {/* Spoke lines */}
              <line x1="40" y1="40" x2="68" y2="40"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              <line x1="40" y1="40" x2="54" y2="64"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              <line x1="40" y1="40" x2="26" y2="64"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              <line x1="40" y1="40" x2="12" y2="40"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              <line x1="40" y1="40" x2="26" y2="16"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              <line x1="40" y1="40" x2="54" y2="16"  stroke="rgba(0,229,255,0.09)" strokeWidth="0.7" />
              {/* Orbital nodes */}
              {([
                [68, 40, "0s"], [54, 64, "0.43s"], [26, 64, "0.86s"],
                [12, 40, "1.29s"], [26, 16, "1.72s"], [54, 16, "2.15s"],
              ] as [number, number, string][]).map(([x, y, d], i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(0,229,255,0.75)"
                  className="settings-logo-node" style={{ animationDelay: d }} />
              ))}
              {/* Outer diamond (slow rotate) */}
              <polygon points="40,27 53,40 40,53 27,40" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="1" className="settings-logo-diamond-outer" />
              {/* Inner diamond (counter-rotate) */}
              <polygon points="40,33 47,40 40,47 33,40" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2" className="settings-logo-diamond-inner" />
              {/* Center pulse ripple 1 */}
              <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.38)" strokeWidth="1.5" r="5">
                <animate attributeName="r" values="5;17" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.38;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
              {/* Center pulse ripple 2 (offset) */}
              <circle cx="40" cy="40" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="1" r="5">
                <animate attributeName="r" values="5;22" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>
              {/* Center dot */}
              <circle cx="40" cy="40" r="4.5" fill="rgba(0,200,255,0.92)" />
              <circle cx="40" cy="40" r="2"   fill="white" opacity="0.95" />
            </svg>
          </div>

          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ CONTROL PANEL · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {"SETTINGS".split("").map((letter, i) => (
              <span
                key={i}
                className="settings-letter"
                style={{ animationDelay: `${i * 0.14}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>
          {savedFlash && (
            <p
              className="text-[10px] tracking-[2px] text-cyan-400 uppercase mt-2"
              style={{ fontFamily: "var(--font-mono)", textShadow: "0 0 8px rgba(0,229,255,0.4)" }}
            >
              ✓ SAVED
            </p>
          )}
        </header>

        <div className="space-y-7">
          {/* ◈ ACCOUNT */}
          <SettingsSection title="ACCOUNT" className="settings-card-enter" style={{ animationDelay: "0.07s" }}>
            {/* Profile summary card → links to /settings/profile (E3) */}
            <Link
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-4 hover:bg-cyan-400/5 transition-colors border-b border-purple-700/10"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border border-cyan-400/40 bg-[#150035]">
                {props.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={props.avatarUrl}
                    alt={props.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="text-cyan-400 font-bold text-lg"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {(props.username[0] ?? "?").toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div
                  className="text-[14px] text-white truncate"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                >
                  {props.username}
                </div>
                <div
                  className="text-[11px] text-[#7a6a9a] truncate mt-0.5"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {props.bioPreview ?? "No bio yet · tap to edit"}
                </div>
              </div>
              <div
                className="text-[9px] tracking-[2px] text-cyan-400 uppercase flex-shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                EDIT →
              </div>
            </Link>

            <MarksWidget initialBalance={props.marksBalance} />

            {/* My Profile */}
            <SettingsRow
              iconSymbol="◈"
              iconColor="rgba(124,58,237,0.15)"
              label="My Profile"
              description="View your public profile and manage your characters."
              href={`/profile/${props.username}`}
              showChevron
            />

            {/* Personas */}
            <SettingsRow
              iconSymbol="◉"
              iconColor="rgba(0,229,255,0.1)"
              label="Personas"
              description="Manage the identities you bring to each chat."
              href="/personas"
              showChevron
            />
          </SettingsSection>

          {/* ◈ STORE + BRILLIANT — mobile only (desktop sees these in sidebar) */}
          <div className="md:hidden settings-card-enter" style={{ animationDelay: "0.10s" }}>
            <div
              className="text-[9px] tracking-[4px] uppercase mb-3 px-1"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.35)" }}
            >
              ◈ QUICK ACCESS
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Store tile */}
              <Link
                href="/store"
                className="relative flex flex-col justify-between p-4 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-150"
                style={{
                  background: "rgba(0,229,255,0.05)",
                  border: "1px solid rgba(0,229,255,0.18)",
                }}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }} />
                {/* Corner bracket TL */}
                <div className="absolute top-2 left-2 w-3 h-3" style={{ borderTop: "1.5px solid rgba(0,212,255,0.4)", borderLeft: "1.5px solid rgba(0,212,255,0.4)" }} />
                {/* Corner bracket BR */}
                <div className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: "1.5px solid rgba(0,212,255,0.4)", borderRight: "1.5px solid rgba(0,212,255,0.4)" }} />

                <div className="mb-3">
                  <span style={{ fontSize: 22 }}>⟡</span>
                </div>
                <div>
                  <div
                    className="text-[13px] font-black tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "#00e5ff", textShadow: "0 0 12px rgba(0,212,255,0.5)" }}
                  >
                    STORE
                  </div>
                  <div
                    className="text-[10px] mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.6)" }}
                  >
                    Buy &amp; earn Marks
                  </div>
                </div>
              </Link>

              {/* Brilliant tile */}
              <Link
                href="/subscribe"
                className="relative flex flex-col justify-between p-4 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-150"
                style={{
                  background: "rgba(167,139,250,0.06)",
                  border: "1px solid rgba(167,139,250,0.25)",
                }}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)" }} />
                {/* Corner bracket TL */}
                <div className="absolute top-2 left-2 w-3 h-3" style={{ borderTop: "1.5px solid rgba(167,139,250,0.5)", borderLeft: "1.5px solid rgba(167,139,250,0.5)" }} />
                {/* Corner bracket BR */}
                <div className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: "1.5px solid rgba(167,139,250,0.5)", borderRight: "1.5px solid rgba(167,139,250,0.5)" }} />

                <div className="mb-3">
                  <span style={{ fontSize: 22 }}>✦</span>
                </div>
                <div>
                  <div
                    className="text-[13px] font-black tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "#a78bfa", textShadow: "0 0 12px rgba(167,139,250,0.5)" }}
                  >
                    BRILLIANT
                  </div>
                  <div
                    className="text-[10px] mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.6)" }}
                  >
                    Unlimited chats &amp; premium
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* ◈ PREFERENCES */}
          <SettingsSection
            title="PREFERENCES"
            description="How Nexcor behaves for you."
            className="settings-card-enter" style={{ animationDelay: "0.14s" }}
          >
            {/* NSFW */}
            <SettingsRow
              iconSymbol="✦"
              iconColor="rgba(245,158,11,0.18)"
              label="Show NSFW characters"
              description={
                prefs.show_nsfw
                  ? "Mature content visible in Explore."
                  : "NSFW characters hidden."
              }
              trailing={
                <Toggle
                  checked={prefs.show_nsfw}
                  onChange={(v) => {
                    if (v && !prefs.show_nsfw) {
                      setNsfwConfirmOpen(true);
                    } else {
                      updatePref("show_nsfw", v);
                    }
                  }}
                />
              }
            />

            {/* Creator badge — only shown to users who have created at least one character */}
            {isCreator && <SettingsRow
              iconSymbol="◈"
              iconColor="rgba(167,139,250,0.15)"
              label="Creator badge on characters"
              description={
                prefs.show_creator_badge
                  ? "A ◈ CREATOR badge appears on your characters' profiles."
                  : "No badge shown on your characters."
              }
              trailing={
                <Toggle
                  checked={prefs.show_creator_badge}
                  onChange={(v) => updatePref("show_creator_badge", v)}
                />
              }
            />}

            {/* Default model */}
            <SettingsRow
              iconSymbol="◉"
              label="Default chat model"
              description="Which model loads when you start a new chat."
              trailing={
                <Select
                  value={prefs.default_model}
                  onChange={(v) => updatePref("default_model", v as DefaultModel)}
                  options={(Object.keys(MODELS) as DefaultModel[]).map((k) => ({
                    value: k,
                    label: MODELS[k].label,
                  }))}
                />
              }
            />

            {/* Chat language */}
            <SettingsRow
              iconSymbol="✺"
              iconColor="rgba(124,58,237,0.18)"
              label="Chat language"
              description="The AI will respond in this language."
              trailing={
                <Select
                  value={prefs.chat_language}
                  onChange={(v) => updatePref("chat_language", v)}
                  options={CHAT_LANGUAGES.map((l) => ({
                    value: l.code,
                    label: l.code.toUpperCase(),
                  }))}
                  fullLabel={getLanguageLabel(prefs.chat_language)}
                />
              }
            />

            {/* Italics toggle */}
            <SettingsRow
              iconSymbol="𝐼"
              iconColor="rgba(0,229,255,0.10)"
              label="Italic stage directions"
              description="*she smiles softly* style narration."
              trailing={
                <Toggle
                  checked={prefs.pref_italics_on}
                  onChange={(v) => updatePref("pref_italics_on", v)}
                />
              }
            />

            {/* Gray text */}
            <SettingsRow
              iconSymbol="❝"
              iconColor="rgba(124,58,237,0.10)"
              label="Gray narration text"
              description="Dim italic actions to reduce visual noise."
              trailing={
                <Toggle
                  checked={prefs.pref_gray_text_on}
                  onChange={(v) => updatePref("pref_gray_text_on", v)}
                />
              }
            />

            {/* Font size */}
            <SettingsRow
              iconSymbol="A"
              iconColor="rgba(0,229,255,0.12)"
              label="Chat font size"
              description="Message text size in chat."
              trailing={
                <Select
                  value={prefs.chat_font_size}
                  onChange={(v) =>
                    updatePref("chat_font_size", v as ChatFontSize)
                  }
                  options={[
                    { value: "small", label: "SMALL" },
                    { value: "medium", label: "MEDIUM" },
                    { value: "large", label: "LARGE" },
                  ]}
                />
              }
            />
          </SettingsSection>

          {/* ◈ APPEARANCE */}
          <SettingsSection
            title="APPEARANCE"
            description="The face Nexcor wears for you."
            className="settings-card-enter" style={{ animationDelay: "0.21s" }}
          >
            <SettingsRow
              iconSymbol="◈"
              iconColor={`${currentTheme.preview.accent}25`}
              label="Chat theme"
              description={currentTheme.description}
              onClick={() => setThemePickerOpen(true)}
              trailing={
                <span
                  className="text-[10px] tracking-[2px] uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: currentTheme.preview.accent,
                  }}
                >
                  {currentTheme.label}
                </span>
              }
              showChevron
            />
          </SettingsSection>

          {/* ◈ SUPPORT */}
          <SettingsSection title="SUPPORT" className="settings-card-enter" style={{ animationDelay: "0.28s" }}>
            <SettingsRow
              iconSymbol="◈"
              label="Contact support"
              description="Bug, payment, feedback — we read every message."
              onClick={() => setSupportOpen(true)}
              showChevron
            />
            <SettingsRow
              iconSymbol="◇"
              iconColor="rgba(124,58,237,0.15)"
              label="About Nexcor"
              description="Kurai &amp; Big G's story."
              href="/about"
              showChevron
            />
            <SettingsRow
              iconSymbol="§"
              label="Privacy Policy"
              href="/privacy"
              showChevron
            />
            <SettingsRow
              iconSymbol="§"
              label="Terms of Service"
              href="/terms"
              showChevron
            />
            <SettingsRow
              iconSymbol="↩"
              label="Refund Policy"
              href="/refund"
              showChevron
            />
          </SettingsSection>

          {/* ◈ PRIVACY & DATA */}
          <SettingsSection title="PRIVACY & DATA" description="Your data rights under GDPR and other privacy laws." className="settings-card-enter" style={{ animationDelay: "0.35s" }}>
            <SettingsRow
              iconSymbol="⬇"
              iconColor="rgba(0,229,255,0.12)"
              label="Export my data"
              description="Download everything Nexcor holds about you as a JSON file."
              trailing={
                <button
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="px-3 py-1.5 rounded-lg text-[9px] tracking-[2px] uppercase font-bold transition-all disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: exportDone ? "rgba(0,229,255,0.15)" : "rgba(0,229,255,0.08)",
                    border: "1px solid rgba(0,229,255,0.25)",
                    color: exportDone ? "#00e5ff" : "rgba(0,229,255,0.7)",
                  }}
                >
                  {exportLoading ? "PREPARING…" : exportDone ? "✓ DOWNLOADED" : "EXPORT →"}
                </button>
              }
            />
            <SettingsRow
              iconSymbol="⚖"
              iconColor="rgba(167,139,250,0.12)"
              label="Privacy policy"
              description="How we collect, use, and protect your data."
              href="/privacy"
              showChevron
            />
            <SettingsRow
              iconSymbol="↩"
              iconColor="rgba(0,229,255,0.08)"
              label="Refund policy"
              description="When we give money back and how to request it."
              href="/refund"
              showChevron
            />
          </SettingsSection>

          {/* ◈ DANGER ZONE */}
          <SettingsSection title="DANGER ZONE" className="settings-card-enter" style={{ animationDelay: "0.42s" }}>
            <SettingsRow
              iconSymbol="⏻"
              iconColor="rgba(239,68,68,0.10)"
              label="Sign out"
              danger
              onClick={() => setSignOutOpen(true)}
              showChevron
            />
            <SettingsRow
              iconSymbol="✕"
              iconColor="rgba(239,68,68,0.15)"
              label="Delete account"
              description="Permanent and irreversible."
              danger
              onClick={() => setDeleteOpen(true)}
              showChevron
            />
          </SettingsSection>

          <p
            className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase pt-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
          </p>
        </div>
      </div>

      {/* Theme picker modal */}
      {themePickerOpen && (
        <ThemePicker
          current={prefs.chat_theme}
          onSelect={(k) => {
            updatePref("chat_theme", k);
            setThemePickerOpen(false);
          }}
          onClose={() => setThemePickerOpen(false)}
        />
      )}

      <SignOutDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        username={props.username}
        stats={props.stats}
        onClose={() => setDeleteOpen(false)}
      />
      <SupportContactDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      {/* NSFW age confirmation */}
      {nsfwConfirmOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={() => setNsfwConfirmOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: "rgba(8,4,26,0.98)",
                border: "1px solid rgba(245,158,11,0.4)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.8)",
              }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
              <div className="p-6">
                <div className="text-[8px] tracking-[3px] uppercase mb-1" style={{ fontFamily: "var(--font-mono)", color: "rgba(245,158,11,0.6)" }}>
                  ◈ AGE VERIFICATION
                </div>
                <h2 className="text-[18px] font-black tracking-[2px] uppercase text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  18+ CONTENT
                </h2>
                <p className="text-[13px] text-[#a78bfa] italic mb-5 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  NSFW characters contain mature and explicit content. By enabling this you confirm you are <strong className="text-white">18 years of age or older</strong>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNsfwConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-[10px] tracking-[2px] transition-all"
                    style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(122,106,154,0.2)", color: "rgba(167,139,250,0.7)" }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => { updatePref("show_nsfw", true); setNsfwConfirmOpen(false); }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-[10px] tracking-[2px] transition-all"
                    style={{ fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.9)", color: "#000" }}
                  >
                    I AM 18+ · ENABLE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [rippleKey, setRippleKey] = useState<number | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRippleKey(Date.now());
    setTimeout(() => setRippleKey(null), 600);
    onChange(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      data-state={checked ? "on" : "off"}
      className="nx-toggle"
    >
      {rippleKey !== null && (
        <span key={rippleKey} className="nx-toggle-ripple" />
      )}
      <div className="nx-toggle-knob" />
    </button>
  );
}

// ── Select ────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
  fullLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  fullLabel?: string;
}) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {fullLabel && (
        <span
          className="text-[10px] tracking-[1.5px] text-[#a78bfa] uppercase hidden sm:inline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {fullLabel}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#08041a] border border-purple-700/25 rounded-md px-2 py-1 text-[11px] tracking-[1.5px] text-cyan-400 focus:outline-none focus:border-cyan-400/50 transition-all uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#08041a]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Theme Picker Modal ──────────────────────────────

function ThemePicker({
  current,
  onSelect,
  onClose,
}: {
  current: ChatThemeKey;
  onSelect: (k: ChatThemeKey) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 pointer-events-none overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-md bg-[#0c0520] sm:rounded-2xl border-y sm:border border-purple-700/30 overflow-hidden relative my-0 sm:my-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700/15">
            <h3
              className="text-[11px] tracking-[3px] text-cyan-400 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ CHAT THEME · 324B21
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-[#7a6a9a] hover:text-cyan-400 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-3">
            {CHAT_THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                className={`w-full flex items-stretch gap-3 p-3 rounded-xl border transition-all text-left ${
                  current === t.key
                    ? "border-cyan-400/40 bg-cyan-400/5"
                    : "border-purple-700/20 hover:border-purple-500/40"
                }`}
              >
                {/* Mini bubble preview */}
                <div
                  className="flex-shrink-0 w-20 rounded-md flex flex-col gap-1 p-2 border"
                  style={{
                    background: t.preview.bg,
                    borderColor: t.preview.accent + "30",
                  }}
                >
                  <div
                    className="w-3/4 h-2 rounded-full ml-auto"
                    style={{
                      background: t.preview.userBubble,
                      border: `1px solid ${t.preview.userBorder}`,
                    }}
                  />
                  <div
                    className="w-3/4 h-2 rounded-full"
                    style={{
                      background: t.preview.aiBubble,
                      border: `1px solid ${t.preview.aiBorder}`,
                    }}
                  />
                  <div
                    className="w-1/2 h-2 rounded-full ml-auto"
                    style={{
                      background: t.preview.userBubble,
                      border: `1px solid ${t.preview.userBorder}`,
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[12px] tracking-[2px] uppercase font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: t.preview.accent,
                        textShadow: `0 0 6px ${t.preview.accent}40`,
                      }}
                    >
                      {t.label}
                    </span>
                    {current === t.key && (
                      <span
                        className="text-[8px] tracking-[2px] uppercase px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-400"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[12px] text-[#a78bfa] italic mt-1 leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {t.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
