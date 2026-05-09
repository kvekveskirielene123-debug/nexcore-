"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProfileAvatarUpload } from "@/components/settings/ProfileAvatarUpload";

const MAX_BIO = 300;
const USERNAME_COOLDOWN_DAYS = 30;

const RESONANCE_MODES = [
  {
    value: "gentle",
    name: "EMBER",
    tagline: "Warm. Close. Like you're the only one in the room.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.45)",
    wave: "M 0,12 C 8,16 12,4 20,12 C 28,20 32,4 40,12 C 44,14 47,11 50,12",
  },
  {
    value: "casual",
    name: "DRIFT",
    tagline: "Natural. No pressure. Like talking to someone who just gets it.",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.35)",
    bg: "rgba(0,229,255,0.06)",
    border: "rgba(0,229,255,0.45)",
    wave: "M 0,12 Q 12.5,3 25,12 Q 37.5,21 50,12",
  },
  {
    value: "playful",
    name: "SPARK",
    tagline: "Electric. Unpredictable. Keeps you on the edge of your seat.",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.45)",
    wave: "M 0,12 L 7,4 L 12,18 L 18,2 L 23,16 L 29,6 L 35,14 L 41,4 L 46,14 L 50,12",
  },
  {
    value: "serious",
    name: "ABYSS",
    tagline: "Deep. Real. Goes places most conversations never touch.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.45)",
    wave: "M 0,18 Q 12,1 25,18 Q 38,35 50,18",
  },
  {
    value: "formal",
    name: "EDGE",
    tagline: "Sharp. Precise. Every word chosen like a blade.",
    color: "#f87171",
    glow: "rgba(248,113,113,0.35)",
    bg: "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.45)",
    wave: "M 0,12 L 10,3 L 10,21 L 20,3 L 20,21 L 30,3 L 30,21 L 40,3 L 40,21 L 50,12",
  },
  {
    value: "flirty",
    name: "PULSE",
    tagline: "Charged. Teasing. Something electric always between the lines.",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.35)",
    bg: "rgba(244,114,182,0.07)",
    border: "rgba(244,114,182,0.45)",
    wave: "M 0,12 Q 4,12 6,6 Q 8,0 10,6 Q 12,12 16,12 Q 20,12 22,6 Q 24,0 26,6 Q 28,12 32,12 Q 36,12 38,6 Q 40,0 42,6 Q 44,12 50,12",
  },
] as const;

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
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes editPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes editRing {
          0%   { transform: scale(1);    opacity: 0.55; }
          100% { transform: scale(1.4);  opacity: 0; }
        }
        @keyframes editGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,229,255,0.12); }
          50%       { box-shadow: 0 0 44px rgba(0,229,255,0.26); }
        }
        @keyframes dotPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .edit-scan  { animation: editScan  9s linear infinite; }
        .edit-pulse { animation: editPulse 2.5s ease-in-out infinite; }
        .edit-ring  { animation: editRing  2.2s ease-out infinite; }
        .edit-glow  { animation: editGlow  3.5s ease-in-out infinite; }
        .dot-ping   { animation: dotPing   1.8s ease-out infinite; }

        .nex-input {
          width: 100%;
          background: rgba(6,3,18,0.85);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 15px;
          color: #e2d9f3;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-body);
        }
        .nex-input::placeholder { color: rgba(90,74,122,0.5); }
        .nex-input:focus {
          border-color: rgba(0,229,255,0.45);
          box-shadow: 0 0 0 1px rgba(0,229,255,0.18), 0 0 20px rgba(0,229,255,0.08);
        }
        .nex-input.input-ok    { border-color: rgba(52,211,153,0.55); }
        .nex-input.input-err   { border-color: rgba(248,113,113,0.55); }

        .nex-card {
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(8,4,22,0.92);
        }
        .nex-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.25) 40%, rgba(167,139,250,0.2) 60%, transparent);
          pointer-events: none;
        }

        .res-btn {
          position: relative;
          border-radius: 12px;
          text-align: left;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          overflow: hidden;
          cursor: pointer;
          padding: 14px 14px 12px;
        }
        .res-btn:focus-visible { outline: 2px solid rgba(0,229,255,0.5); outline-offset: 2px; }
      `}</style>

      {/* Ambient scanline */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="edit-scan absolute left-0 right-0 h-[2px] opacity-[0.15]"
          style={{ background: "linear-gradient(90deg, transparent, #00e5ff 40%, #a78bfa 60%, transparent)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,229,255,0.5) 39px, rgba(0,229,255,0.5) 40px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto space-y-4">

        {/* ── AVATAR HERO ─────────────────────────────────────────── */}
        <div className="nex-card edit-glow">
          <div className="p-7 flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar with rings — no overflow-hidden so crop modal is never blocked */}
            <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 148, height: 148 }}>
              <div
                className="edit-ring absolute rounded-full pointer-events-none"
                style={{ width: 148, height: 148, border: "1px solid rgba(0,229,255,0.22)" }}
              />
              <div
                className="edit-ring absolute rounded-full pointer-events-none"
                style={{ width: 148, height: 148, border: "1px solid rgba(167,139,250,0.14)", animationDelay: "1.1s" }}
              />
              {/* Inner glow ring */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 126, height: 126,
                  boxShadow: "inset 0 0 28px rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.1)",
                  borderRadius: "50%",
                }}
              />
              <div className="relative z-10">
                <ProfileAvatarUpload
                  currentUrl={avatarUrl}
                  username={username || initialUsername}
                  onUploaded={(url) => setAvatarUrl(url)}
                />
              </div>
            </div>

            {/* Avatar info */}
            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <div className="relative w-2 h-2 flex-shrink-0">
                  <div
                    className="dot-ping absolute inset-0 rounded-full"
                    style={{ background: "rgba(0,229,255,0.5)" }}
                  />
                  <div className="absolute inset-0 rounded-full" style={{ background: "#00e5ff" }} />
                </div>
                <span
                  className="text-[9px] tracking-[5px] text-cyan-400/70 uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  BIOMETRIC AVATAR
                </span>
              </div>

              <p
                className="text-[22px] font-black tracking-wider text-white/90 leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                @{username || initialUsername}
              </p>

              <p
                className="text-[10px] text-purple-400/50 tracking-[2px] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Tap avatar to change
              </p>

              <div
                className="mt-1 px-3 py-1 rounded-full text-[9px] tracking-[3px] uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(0,229,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.18)",
                  color: "rgba(0,229,255,0.6)",
                }}
              >
                IDENTITY ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* ── DESIGNATION (USERNAME) ──────────────────────────────── */}
        <div className="nex-card">
          <div className="p-5 space-y-3.5">
            {/* Section label */}
            <div className="flex items-center gap-2.5">
              <div className="w-px h-4" style={{ background: "linear-gradient(to bottom, #7c3aed, transparent)" }} />
              <span
                className="text-[9px] tracking-[5px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}
              >
                DESIGNATION
              </span>
            </div>

            {usernameRateLimited ? (
              <div className="space-y-2.5">
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3.5"
                  style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.18)" }}
                >
                  <span
                    className="text-[15px] text-[#e2d9f3] tracking-wide"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {username}
                  </span>
                  <span
                    className="text-[8px] tracking-[3px] px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#f59e0b",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.22)",
                    }}
                  >
                    LOCKED
                  </span>
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(245,158,11,0.75)" }}
                >
                  Designation change available in{" "}
                  <strong>{daysUntilUsernameChange}</strong>{" "}
                  day{daysUntilUsernameChange === 1 ? "" : "s"}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    maxLength={30}
                    placeholder="your_username"
                    className={`nex-input pr-10 ${
                      usernameState.status === "available"
                        ? "input-ok"
                        : usernameState.status === "taken" || usernameState.status === "invalid"
                        ? "input-err"
                        : ""
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {usernameState.status === "checking" && (
                      <span className="text-purple-400/60 text-sm edit-pulse">···</span>
                    )}
                    {usernameState.status === "available" && (
                      <span style={{ color: "#34d399", fontSize: 16 }}>✓</span>
                    )}
                    {(usernameState.status === "taken" || usernameState.status === "invalid") && (
                      <span style={{ color: "#f87171", fontSize: 16 }}>✕</span>
                    )}
                  </div>
                </div>

                {usernameState.status === "available" && (
                  <p className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "#34d399" }}>
                    ◈ Designation available
                  </p>
                )}
                {(usernameState.status === "taken" || usernameState.status === "invalid") && (
                  <p className="text-[11px]" style={{ fontFamily: "var(--font-body)", color: "#f87171" }}>
                    {(usernameState as { reason: string }).reason}
                  </p>
                )}
                {!usernameChanged && (
                  <p className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.7)" }}>
                    3–30 chars · letters, numbers, underscore · 1 change per 30 days
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── NEURAL SIGNATURE (BIO) ──────────────────────────────── */}
        <div className="nex-card">
          <div className="p-5 space-y-3.5">
            {/* Label row with counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-px h-4" style={{ background: "linear-gradient(to bottom, #7c3aed, transparent)" }} />
                <span
                  className="text-[9px] tracking-[5px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}
                >
                  NEURAL SIGNATURE
                </span>
              </div>
              <span
                className="text-[10px] tabular-nums"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: bio.length >= MAX_BIO
                    ? "#f59e0b"
                    : bio.length >= MAX_BIO * 0.85
                    ? "rgba(167,139,250,0.6)"
                    : "rgba(90,74,122,0.6)",
                }}
              >
                {bio.length} / {MAX_BIO}
              </span>
            </div>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={MAX_BIO}
              placeholder="A few words about you — shown on your public profile."
              className="nex-input resize-none leading-relaxed"
              style={{ display: "block" }}
            />
          </div>
        </div>

        {/* ── RESONANCE CORE ──────────────────────────────────────── */}
        <div className="nex-card">
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-px h-4" style={{ background: "linear-gradient(to bottom, #7c3aed, transparent)" }} />
                <span
                  className="text-[9px] tracking-[5px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}
                >
                  RESONANCE CORE
                </span>
              </div>
              <p
                className="text-[11px] pl-3.5"
                style={{ fontFamily: "var(--font-body)", color: "rgba(90,74,122,0.85)" }}
              >
                How entities attune to you. Choose your frequency.
              </p>
            </div>

            {/* 3-column on md, 2-column on sm, 1-column on xs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {RESONANCE_MODES.map((m) => {
                const active = tone === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setTone(m.value)}
                    className="res-btn"
                    style={{
                      background: active ? m.bg : "rgba(6,3,18,0.6)",
                      border: `1px solid ${active ? m.border : "rgba(255,255,255,0.06)"}`,
                      boxShadow: active ? `0 0 24px ${m.glow} inset, 0 0 12px ${m.glow}` : undefined,
                    }}
                  >
                    {/* Top accent on active */}
                    {active && (
                      <div
                        style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(90deg, transparent, ${m.color} 40%, ${m.color} 60%, transparent)`,
                        }}
                      />
                    )}

                    {/* Wave decoration */}
                    <div
                      style={{
                        position: "absolute", right: 10, bottom: 10,
                        opacity: active ? 0.3 : 0.12,
                        pointerEvents: "none",
                        transition: "opacity 0.2s",
                      }}
                    >
                      <svg viewBox="0 0 50 24" width="52" height="22" fill="none">
                        <path
                          d={m.wave}
                          stroke={m.color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Mode name */}
                    <div
                      className="text-[12px] font-black tracking-[3px] mb-1.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: active ? m.color : "rgba(167,139,250,0.4)",
                        textShadow: active ? `0 0 14px ${m.glow}` : undefined,
                      }}
                    >
                      {m.name}
                    </div>

                    {/* Tagline */}
                    <div
                      className="text-[10px] leading-relaxed pr-8"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: active ? "rgba(255,255,255,0.6)" : "rgba(90,74,122,0.85)",
                      }}
                    >
                      {m.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ERROR ───────────────────────────────────────────────── */}
        {saveError && (
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-[12px]"
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.22)",
              fontFamily: "var(--font-body)",
              color: "#fca5a5",
            }}
          >
            <span className="mt-px flex-shrink-0" style={{ color: "#f87171" }}>✕</span>
            <span>{saveError}</span>
          </div>
        )}

        {/* ── ACTIONS ─────────────────────────────────────────────── */}
        <div className="space-y-3 pt-1 pb-6">
          {/* SYNC button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 rounded-xl font-black tracking-[4px] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              background: saved
                ? "linear-gradient(90deg, #10b981, #059669)"
                : "linear-gradient(90deg, #00e5ff 0%, #0099ff 100%)",
              color: "#000",
              boxShadow: saving || !canSave
                ? "none"
                : saved
                ? "0 0 28px rgba(16,185,129,0.45)"
                : "0 0 36px rgba(0,229,255,0.35), 0 4px 16px rgba(0,150,255,0.25)",
              letterSpacing: "0.3em",
            }}
          >
            {saving ? "SYNCING···" : saved ? "✓ SYNCHRONIZED" : "◈ SYNC CHANGES →"}
          </button>

          {/* Back link */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="w-full py-3 rounded-xl transition-all text-center"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "rgba(167,139,250,0.45)",
              background: "transparent",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.35)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.75)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.45)";
            }}
          >
            ← BACK TO SETTINGS
          </button>
        </div>

        {/* Footer watermark */}
        <p
          className="text-center pb-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.35em",
            color: "rgba(124,58,237,0.12)",
            textTransform: "uppercase",
          }}
        >
          NEOLUTION SCIENCE DIVISION · IDENTITY PROTOCOL · 324B21
        </p>
      </div>
    </>
  );
}
