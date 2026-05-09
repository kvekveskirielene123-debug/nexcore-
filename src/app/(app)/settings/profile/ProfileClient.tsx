"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProfileAvatarUpload } from "@/components/settings/ProfileAvatarUpload";
import { PERSONA_TONES } from "@/lib/personas/types";

const MAX_BIO = 300;
const USERNAME_COOLDOWN_DAYS = 30;

interface ProfileClientProps {
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  tonePreference: string;
  usernameChangedAt: string | null;
}

type UsernameState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string }
  | { status: "invalid"; reason: string };

const TONE_ICONS: Record<string, string> = {
  casual: "◎",
  formal: "◆",
  playful: "◉",
  gentle: "◌",
  serious: "◈",
  flirty: "◇",
};

export function ProfileClient({
  username: initialUsername,
  bio: initialBio,
  avatarUrl: initialAvatarUrl,
  tonePreference: initialTone,
  usernameChangedAt,
}: ProfileClientProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio ?? "");
  const [tone, setTone] = useState(initialTone);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [usernameState, setUsernameState] = useState<UsernameState>({ status: "idle" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daysUntilUsernameChange = (() => {
    if (!usernameChangedAt) return 0;
    const days =
      USERNAME_COOLDOWN_DAYS -
      (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(days));
  })();
  const usernameRateLimited = daysUntilUsernameChange > 0;
  const usernameChanged = username.trim().toLowerCase() !== initialUsername.toLowerCase();

  useEffect(() => {
    if (!usernameChanged) {
      setUsernameState({ status: "idle" });
      return;
    }
    if (usernameRateLimited) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setUsernameState({ status: "checking" });

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/settings/username-check?username=${encodeURIComponent(username.trim())}`
        );
        const data = await res.json();
        if (data.available) {
          setUsernameState({ status: "available" });
        } else {
          setUsernameState({ status: "taken", reason: data.reason ?? "Not available." });
        }
      } catch {
        setUsernameState({ status: "idle" });
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, usernameChanged, usernameRateLimited]);

  const canSave =
    !saving &&
    (usernameState.status === "idle" || usernameState.status === "available") &&
    !(usernameChanged && usernameRateLimited);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const body: Record<string, unknown> = {
        bio,
        tone_preference: tone,
        avatar_url: avatarUrl,
      };
      if (usernameChanged && !usernameRateLimited) {
        body.username = username.trim();
      }

      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error ?? "Could not save changes.");
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes editScan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes editPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes editRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes editGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,229,255,0.15); }
          50% { box-shadow: 0 0 40px rgba(0,229,255,0.3); }
        }
        .edit-scan { animation: editScan 8s linear infinite; }
        .edit-pulse { animation: editPulse 2.5s ease-in-out infinite; }
        .edit-ring { animation: editRing 2s ease-out infinite; }
        .edit-glow { animation: editGlow 3s ease-in-out infinite; }
        .field-glow:focus { box-shadow: 0 0 0 1px rgba(0,229,255,0.4), 0 0 24px rgba(0,229,255,0.1); }
      `}</style>

      {/* Ambient scanline */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="edit-scan absolute left-0 right-0 h-[2px] opacity-20"
          style={{ background: "linear-gradient(90deg, transparent, #00e5ff 40%, #a78bfa 60%, transparent)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,229,255,0.4) 39px, rgba(0,229,255,0.4) 40px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto space-y-6">

        {/* ── AVATAR SECTION ─────────────────────────────────── */}
        <div
          className="relative rounded-2xl border border-cyan-400/20 overflow-hidden edit-glow"
          style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(10,4,24,0.9) 60%)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="p-6 flex flex-col items-center gap-4">
            <p
              className="text-[9px] tracking-[4px] text-cyan-400/50 uppercase self-start"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ BIOMETRIC AVATAR
            </p>

            {/* Avatar with rings */}
            <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
              <div
                className="edit-ring absolute rounded-full border border-cyan-400/30"
                style={{ width: 136, height: 136 }}
              />
              <div
                className="edit-ring absolute rounded-full border border-purple-400/20"
                style={{ width: 136, height: 136, animationDelay: "1s" }}
              />
              <div className="relative z-10">
                <ProfileAvatarUpload
                  currentUrl={avatarUrl}
                  username={username || initialUsername}
                  onUploaded={(url) => setAvatarUrl(url)}
                />
              </div>
            </div>

            <p
              className="text-[9px] tracking-[3px] text-purple-400/60 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              TAP AVATAR TO CHANGE
            </p>
          </div>
        </div>

        {/* ── DESIGNATION (USERNAME) ──────────────────────────── */}
        <div
          className="relative rounded-2xl border border-purple-500/20 overflow-hidden"
          style={{ background: "rgba(10,4,24,0.85)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="p-5 space-y-3">
            <p
              className="text-[9px] tracking-[4px] text-purple-400/70 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ DESIGNATION
            </p>

            {usernameRateLimited ? (
              <>
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <span
                    className="text-[15px] text-[#e2d9f3]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {username}
                  </span>
                  <span
                    className="text-[8px] tracking-[3px] text-amber-400 px-2 py-1 rounded"
                    style={{ fontFamily: "var(--font-mono)", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
                  >
                    LOCKED
                  </span>
                </div>
                <p
                  className="text-[11px] text-amber-400/80 italic"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  ◈ Designation change available in{" "}
                  <strong>{daysUntilUsernameChange}</strong> day
                  {daysUntilUsernameChange === 1 ? "" : "s"}.
                </p>
              </>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    maxLength={30}
                    placeholder="your_username"
                    className={`field-glow w-full rounded-xl px-4 py-3 pr-10 text-[15px] text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none transition-all ${
                      usernameState.status === "available"
                        ? "border border-emerald-500/50"
                        : usernameState.status === "taken" || usernameState.status === "invalid"
                        ? "border border-red-500/50"
                        : "border border-purple-700/25"
                    }`}
                    style={{
                      fontFamily: "var(--font-body)",
                      background: "rgba(8,4,26,0.9)",
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameState.status === "checking" && (
                      <span className="text-[#7a6a9a] text-xs edit-pulse">···</span>
                    )}
                    {usernameState.status === "available" && (
                      <span className="text-emerald-400 text-sm">✓</span>
                    )}
                    {(usernameState.status === "taken" || usernameState.status === "invalid") && (
                      <span className="text-red-400 text-sm">✕</span>
                    )}
                  </div>
                </div>

                {usernameState.status === "available" && (
                  <p className="text-[11px] text-emerald-400" style={{ fontFamily: "var(--font-body)" }}>
                    ◈ Designation available
                  </p>
                )}
                {(usernameState.status === "taken" || usernameState.status === "invalid") && (
                  <p className="text-[11px] text-red-400" style={{ fontFamily: "var(--font-body)" }}>
                    {(usernameState as { reason: string }).reason}
                  </p>
                )}
                {!usernameChanged && (
                  <p className="text-[10px] text-[#4a3a6a]" style={{ fontFamily: "var(--font-body)" }}>
                    3–30 chars · letters, numbers, underscore · 1 change per 30 days
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── BIO ─────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl border border-purple-500/20 overflow-hidden"
          style={{ background: "rgba(10,4,24,0.85)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="p-5 space-y-3">
            <p
              className="text-[9px] tracking-[4px] text-purple-400/70 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ NEURAL SIGNATURE
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={MAX_BIO}
              placeholder="A few words about you — shown on your public profile."
              className="field-glow w-full rounded-xl px-4 py-3 text-[14px] text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none border border-purple-700/25 transition-all resize-none leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                background: "rgba(8,4,26,0.9)",
              }}
            />
            <div className="flex justify-end">
              <span
                className={`text-[10px] tabular-nums ${bio.length >= MAX_BIO ? "text-amber-400" : "text-[#4a3a6a]"}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {bio.length} / {MAX_BIO}
              </span>
            </div>
          </div>
        </div>

        {/* ── TONE ────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl border border-purple-500/20 overflow-hidden"
          style={{ background: "rgba(10,4,24,0.85)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="p-5 space-y-4">
            <div>
              <p
                className="text-[9px] tracking-[4px] text-cyan-400/60 uppercase mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ COMMUNICATION PROTOCOL
              </p>
              <p
                className="text-[11px] text-[#5a4a7a] italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                How the AI speaks with you when no persona is active.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERSONA_TONES.map((t) => {
                const active = tone === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className="relative px-3 py-3 rounded-xl text-left transition-all overflow-hidden group"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(124,58,237,0.06) 100%)"
                        : "rgba(8,4,26,0.7)",
                      border: active
                        ? "1px solid rgba(0,229,255,0.45)"
                        : "1px solid rgba(124,58,237,0.2)",
                      boxShadow: active ? "0 0 20px rgba(0,229,255,0.12) inset" : undefined,
                    }}
                  >
                    {active && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                    )}
                    <div
                      className={`text-[18px] mb-1 transition-colors ${active ? "text-cyan-400" : "text-purple-500/50 group-hover:text-purple-400/70"}`}
                    >
                      {TONE_ICONS[t.value] ?? "◈"}
                    </div>
                    <div
                      className={`text-[10px] tracking-[1.5px] font-bold uppercase mb-0.5 transition-colors ${active ? "text-cyan-400" : "text-[#a78bfa]"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {t.label}
                    </div>
                    <div
                      className="text-[10px] text-[#5a4a7a] leading-tight"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ERROR ───────────────────────────────────────────── */}
        {saveError && (
          <div
            className="px-4 py-3 rounded-xl text-[13px] text-red-300"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              fontFamily: "var(--font-body)",
            }}
          >
            {saveError}
          </div>
        )}

        {/* ── ACTIONS ─────────────────────────────────────────── */}
        <div className="flex gap-3 pt-1 pb-2">
          <button
            onClick={() => router.push("/settings")}
            className="px-5 py-3 rounded-xl border border-purple-700/30 text-[10px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 hover:text-purple-300 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← BACK
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 rounded-xl font-black text-[11px] tracking-[3px] uppercase transition-all disabled:opacity-30"
            style={{
              fontFamily: "var(--font-mono)",
              background: saved
                ? "linear-gradient(90deg, #10b981, #059669)"
                : "linear-gradient(90deg, #00e5ff, #00b8ff)",
              color: saved ? "#fff" : "#000",
              boxShadow: !saving && canSave && !saved
                ? "0 0 32px rgba(0,229,255,0.35)"
                : saved
                ? "0 0 24px rgba(16,185,129,0.4)"
                : undefined,
            }}
          >
            {saving ? "SYNCING..." : saved ? "✓ SYNCHRONIZED" : "◈ SYNC CHANGES →"}
          </button>
        </div>

        <p
          className="text-[9px] tracking-[3px] text-purple-500/15 text-center uppercase pb-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEOLUTION SCIENCE DIVISION · IDENTITY PROTOCOL · 324B21
        </p>
      </div>
    </>
  );
}
