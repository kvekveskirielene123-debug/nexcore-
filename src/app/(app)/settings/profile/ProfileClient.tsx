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

// Corner bracket decoration on cards
function CardBrackets({ color = "rgba(0,212,255,0.3)", size = 13 }: { color?: string; size?: number }) {
  const b = `1.5px solid ${color}`;
  const base: React.CSSProperties = { position: "absolute", width: size, height: size, pointerEvents: "none" };
  return (
    <>
      <div style={{ ...base, top: 8, left: 8, borderTop: b, borderLeft: b }} />
      <div style={{ ...base, top: 8, right: 8, borderTop: b, borderRight: b }} />
      <div style={{ ...base, bottom: 8, left: 8, borderBottom: b, borderLeft: b }} />
      <div style={{ ...base, bottom: 8, right: 8, borderBottom: b, borderRight: b }} />
    </>
  );
}

// Section header used inside cards
function SectionHeader({ label, code }: { label: string; code?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 2, height: 14, background: "linear-gradient(to bottom, #00d4ff, transparent)", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 5, color: "rgba(0,212,255,0.6)", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      {code && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(0,212,255,0.2)", letterSpacing: 2 }}>
          {code}
        </span>
      )}
    </div>
  );
}

export function ProfileClient({
  username: initialUsername,
  bio: initialBio,
  avatarUrl: initialAvatarUrl,
  tonePreference: initialTone,
  usernameChangedAt,
}: ProfileClientProps) {
  const router = useRouter();

  const [username, setUsername]   = useState(initialUsername);
  const [bio, setBio]             = useState(initialBio ?? "");
  const [tone, setTone]           = useState(initialTone);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [usernameState, setUsernameState] = useState<UsernameState>({ status: "idle" });
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

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
    if (!usernameChanged) { setUsernameState({ status: "idle" }); return; }
    if (usernameRateLimited) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setUsernameState({ status: "checking" });

    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/settings/username-check?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameState(data.available
          ? { status: "available" }
          : { status: "taken", reason: data.reason ?? "Not available." }
        );
      } catch {
        setUsernameState({ status: "idle" });
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, usernameChanged, usernameRateLimited]);

  const canSave =
    !saving &&
    (usernameState.status === "idle" || usernameState.status === "available") &&
    !(usernameChanged && usernameRateLimited);

  // Auto-save avatar immediately when cropped — no need to click SYNC
  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    setAvatarSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url }),
      });
      if (res.ok) router.refresh();
    } catch { /* silent — avatar is updated locally */ }
    finally { setAvatarSaving(false); }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true); setSaveError(null); setSaved(false);
    try {
      const body: Record<string, unknown> = { bio, tone_preference: tone, avatar_url: avatarUrl };
      if (usernameChanged && !usernameRateLimited) body.username = username.trim();

      const res  = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setSaveError(data.error ?? "Could not save changes."); return; }

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
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes editGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.08); }
          50%       { box-shadow: 0 0 40px rgba(0,212,255,0.2); }
        }
        @keyframes dotPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bioScan {
          0%   { top: -4px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
        @keyframes dataFlicker {
          0%, 95%, 100% { opacity: 1; }
          96%            { opacity: 0.4; }
          98%            { opacity: 0.9; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 78%; }
        }

        .edit-scan    { animation: editScan    9s linear infinite; }
        .edit-pulse   { animation: editPulse   2.5s ease-in-out infinite; }
        .edit-ring    { animation: editRing    2.2s ease-out infinite; }
        .edit-glow    { animation: editGlow    3.5s ease-in-out infinite; }
        .dot-ping     { animation: dotPing     1.8s ease-out infinite; }
        .bio-scan     { animation: bioScan     4s ease-in-out infinite; animation-delay: 1.5s; }
        .corner-pulse { animation: cornerPulse 3s ease-in-out infinite; }
        .data-flicker { animation: dataFlicker 8s ease-in-out infinite; }
        .prog-fill    { animation: progressFill 1.2s cubic-bezier(.22,1,.36,1) forwards; animation-delay: 0.3s; }

        .nex-input {
          width: 100%;
          background: rgba(4,2,14,0.9);
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 14px;
          color: #e2d9f3;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-body);
        }
        .nex-input::placeholder { color: rgba(90,74,122,0.4); }
        .nex-input:focus {
          border-color: rgba(0,212,255,0.4);
          box-shadow: 0 0 0 1px rgba(0,212,255,0.1), 0 0 16px rgba(0,212,255,0.06);
        }
        .nex-input.input-ok  { border-color: rgba(52,211,153,0.5); }
        .nex-input.input-err { border-color: rgba(248,113,113,0.5); }

        .nex-card {
          position: relative;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(6,3,18,0.94);
          overflow: visible;
        }
        .nex-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          border-radius: 14px 14px 0 0;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.2) 30%, rgba(167,139,250,0.15) 70%, transparent);
          pointer-events: none;
        }

        .res-btn {
          position: relative;
          border-radius: 11px;
          text-align: left;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.12s;
          overflow: hidden;
          cursor: pointer;
          padding: 13px 13px 11px;
        }
        .res-btn:hover { transform: translateY(-1px); }
        .res-btn:focus-visible { outline: 2px solid rgba(0,212,255,0.5); outline-offset: 2px; }

        .dna-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(0,212,255,0.35);
          flex-shrink: 0;
        }
      `}</style>

      {/* Ambient scanline */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="edit-scan absolute left-0 right-0 h-[1px] opacity-[0.12]"
          style={{ background: "linear-gradient(90deg, transparent, #00d4ff 40%, #a78bfa 60%, transparent)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,212,255,0.5) 39px, rgba(0,212,255,0.5) 40px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── IDENTITY FILE CARD ──────────────────────────────────── */}
        <div className="nex-card edit-glow" style={{ overflow: "hidden" }}>
          {/* Card top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 18px",
            borderBottom: "1px solid rgba(0,212,255,0.07)",
            background: "rgba(0,212,255,0.02)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "rgba(0,212,255,0.55)", textTransform: "uppercase" }} className="data-flicker">
                ◆ IDENTITY.FILE
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(0,212,255,0.2)", letterSpacing: 2 }}>
              SYS:0X324B21
            </span>
          </div>

          <div style={{ padding: "20px 22px 22px", display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap" }}>

            {/* Avatar with biometric scan */}
            <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 128, height: 128 }}>
              {/* Animated rings */}
              <div className="edit-ring" style={{ position: "absolute", width: 128, height: 128, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.18)" }} />
              <div className="edit-ring" style={{ position: "absolute", width: 128, height: 128, borderRadius: "50%", border: "1px solid rgba(167,139,250,0.1)", animationDelay: "1.1s" }} />

              {/* Biometric scan over avatar */}
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", zIndex: 20, pointerEvents: "none" }}>
                <div
                  className="bio-scan"
                  style={{
                    position: "absolute", left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.6) 40%, rgba(0,212,255,0.6) 60%, transparent)",
                    boxShadow: "0 0 8px rgba(0,212,255,0.4)",
                  }}
                />
              </div>

              {/* Avatar upload button */}
              <div style={{ position: "relative", zIndex: 10 }}>
                <ProfileAvatarUpload
                  currentUrl={avatarUrl}
                  username={username || initialUsername}
                  onUploaded={handleAvatarUploaded}
                />
              </div>
            </div>

            {/* Identity data panel */}
            <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Live status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ position: "relative", width: 6, height: 6, flexShrink: 0 }}>
                  <div className="dot-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,212,255,0.4)" }} />
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#00d4ff" }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 4, color: "rgba(0,212,255,0.5)", textTransform: "uppercase" }}>
                  BIOMETRIC AVATAR
                </span>
                {avatarSaving && (
                  <span className="edit-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(0,212,255,0.4)", letterSpacing: 2, marginLeft: 4 }}>
                    SYNCING
                  </span>
                )}
              </div>

              {/* Username display */}
              <div>
                <div
                  style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 3, lineHeight: 1, textShadow: "0 0 20px rgba(0,212,255,0.15)" }}
                >
                  @{username || initialUsername}
                </div>
              </div>

              {/* Divider line */}
              <div style={{ height: 1, background: "linear-gradient(to right, rgba(0,212,255,0.18), rgba(167,139,250,0.1), transparent)" }} />

              {/* Data grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0" }}>
                {[
                  ["STATUS", "IDENTITY ACTIVE"],
                  ["LOCK", "BIOMETRIC SYNC"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(167,139,250,0.35)", letterSpacing: 2, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(0,212,255,0.6)", letterSpacing: 1 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Profile completion bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(167,139,250,0.4)", letterSpacing: 2 }}>PROFILE INTEGRITY</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(0,212,255,0.45)", letterSpacing: 1 }}>78%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    className="prog-fill"
                    style={{ height: "100%", width: 0, borderRadius: 2, background: "linear-gradient(90deg, #00d4ff, #0099ff)", boxShadow: "0 0 6px rgba(0,212,255,0.5)" }}
                  />
                </div>
              </div>

              {/* Tap hint */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", alignSelf: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(0,212,255,0.45)", letterSpacing: 2, textTransform: "uppercase" }}>
                  ↑ tap avatar to update
                </span>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.08) 30%, rgba(167,139,250,0.06) 70%, transparent)", margin: "0 22px" }} />

          {/* DNA dots row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 22px" }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="dna-dot"
                style={{ opacity: i % 3 === 0 ? 0.55 : i % 3 === 1 ? 0.25 : 0.12 }}
              />
            ))}
          </div>
        </div>

        {/* ── DESIGNATION (USERNAME) ─────────────────────────────── */}
        <div className="nex-card" style={{ padding: "18px 20px 20px" }}>
          <CardBrackets />
          <SectionHeader label="DESIGNATION" code="FIELD.01" />

          {usernameRateLimited ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 10, padding: "12px 14px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#e2d9f3", letterSpacing: 1 }}>
                  {username}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 3, padding: "3px 8px", borderRadius: 20, color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  LOCKED
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(245,158,11,0.7)", lineHeight: 1.5 }}>
                Designation change available in <strong>{daysUntilUsernameChange}</strong> day{daysUntilUsernameChange === 1 ? "" : "s"}.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  maxLength={30}
                  placeholder="your_username"
                  className={`nex-input pr-10 ${
                    usernameState.status === "available" ? "input-ok"
                    : (usernameState.status === "taken" || usernameState.status === "invalid") ? "input-err"
                    : ""
                  }`}
                />
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  {usernameState.status === "checking" && <span className="edit-pulse" style={{ color: "rgba(167,139,250,0.6)", fontSize: 13 }}>···</span>}
                  {usernameState.status === "available" && <span style={{ color: "#34d399", fontSize: 15 }}>✓</span>}
                  {(usernameState.status === "taken" || usernameState.status === "invalid") && <span style={{ color: "#f87171", fontSize: 15 }}>✕</span>}
                </div>
              </div>

              {usernameState.status === "available" && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#34d399" }}>◈ Designation available</p>
              )}
              {(usernameState.status === "taken" || usernameState.status === "invalid") && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#f87171" }}>
                  {(usernameState as { reason: string }).reason}
                </p>
              )}
              {!usernameChanged && (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(90,74,122,0.6)", letterSpacing: 1 }}>
                  3–30 chars · letters, numbers, underscore · 1 change per 30 days
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── NEURAL SIGNATURE (BIO) ────────────────────────────── */}
        <div className="nex-card" style={{ padding: "18px 20px 20px" }}>
          <CardBrackets />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 2, height: 14, background: "linear-gradient(to bottom, #00d4ff, transparent)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 5, color: "rgba(0,212,255,0.6)", textTransform: "uppercase" }}>
                NEURAL SIGNATURE
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                color: bio.length >= MAX_BIO ? "#f59e0b" : bio.length >= MAX_BIO * 0.85 ? "rgba(167,139,250,0.6)" : "rgba(90,74,122,0.5)",
              }}>
                {bio.length} / {MAX_BIO}
              </span>
              {/* Mini progress bar */}
              <div style={{ width: 48, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                <div style={{
                  height: "100%", borderRadius: 1,
                  width: `${(bio.length / MAX_BIO) * 100}%`,
                  background: bio.length >= MAX_BIO ? "#f59e0b" : "linear-gradient(90deg, #00d4ff, #a78bfa)",
                  transition: "width 0.2s",
                }} />
              </div>
            </div>
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

          <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(90,74,122,0.45)", marginTop: 8, letterSpacing: 1 }}>
            FIELD.02 · PUBLIC · UTF-8
          </p>
        </div>

        {/* ── RESONANCE CORE ────────────────────────────────────── */}
        <div className="nex-card" style={{ padding: "18px 20px 20px" }}>
          <CardBrackets />
          <SectionHeader label="RESONANCE CORE" code="FIELD.03" />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(90,74,122,0.8)", marginBottom: 14, paddingLeft: 10 }}>
            How entities attune to you. Choose your frequency.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
            {RESONANCE_MODES.map((m) => {
              const active = tone === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setTone(m.value)}
                  className="res-btn"
                  style={{
                    background: active ? m.bg : "rgba(4,2,14,0.7)",
                    border: `1px solid ${active ? m.border : "rgba(255,255,255,0.05)"}`,
                    boxShadow: active ? `0 0 20px ${m.glow} inset, 0 0 8px ${m.glow}` : undefined,
                  }}
                >
                  {/* Top accent */}
                  {active && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${m.color} 40%, ${m.color} 60%, transparent)` }} />
                  )}

                  {/* Wave decoration */}
                  <div style={{ position: "absolute", right: 8, bottom: 8, opacity: active ? 0.35 : 0.1, pointerEvents: "none", transition: "opacity 0.2s" }}>
                    <svg viewBox="0 0 50 24" width="48" height="20" fill="none">
                      <path d={m.wave} stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Corner dot on active */}
                  {active && (
                    <div style={{ position: "absolute", top: 7, right: 7, width: 4, height: 4, borderRadius: "50%", background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                  )}

                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 900, letterSpacing: 3, marginBottom: 5, color: active ? m.color : "rgba(167,139,250,0.35)", textShadow: active ? `0 0 12px ${m.glow}` : undefined, transition: "color 0.18s" }}>
                    {m.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 10, lineHeight: 1.45, paddingRight: 30, color: active ? "rgba(255,255,255,0.55)" : "rgba(90,74,122,0.8)" }}>
                    {m.tagline}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ERROR ───────────────────────────────────────────────── */}
        {saveError && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 12,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            fontFamily: "var(--font-body)", fontSize: 12, color: "#fca5a5",
          }}>
            <span style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }}>✕</span>
            <span>{saveError}</span>
          </div>
        )}

        {/* ── ACTIONS ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4, paddingBottom: 28 }}>

          {/* SYNC button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              width: "100%", padding: "15px 0",
              borderRadius: 12, border: "none",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase",
              background: saved
                ? "linear-gradient(90deg, #10b981, #059669)"
                : "linear-gradient(90deg, #00d4ff 0%, #0099ff 100%)",
              color: "#000",
              boxShadow: (saving || !canSave) ? "none"
                : saved ? "0 0 28px rgba(16,185,129,0.45)"
                : "0 0 36px rgba(0,212,255,0.35), 0 4px 20px rgba(0,150,255,0.2)",
              opacity: !canSave ? 0.3 : 1,
              cursor: !canSave ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer on hover via scan */}
            {saving && (
              <div className="edit-scan" style={{ position: "absolute", left: 0, right: 0, height: 2, background: "rgba(0,0,0,0.15)", top: 0 }} />
            )}
            {saving ? "SYNCING···" : saved ? "✓ SYNCHRONIZED" : "◈ SYNC CHANGES →"}
          </button>

          {/* Back link */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            style={{
              width: "100%", padding: "11px 0",
              borderRadius: 12, border: "1px solid rgba(124,58,237,0.13)", background: "transparent",
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.25em", color: "rgba(167,139,250,0.4)",
              cursor: "pointer", transition: "all 0.18s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.7)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.13)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.4)";
            }}
          >
            ← BACK TO SETTINGS
          </button>
        </div>

        {/* Footer watermark */}
        <p style={{
          textAlign: "center", paddingBottom: 16,
          fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.35em",
          color: "rgba(124,58,237,0.1)", textTransform: "uppercase",
        }}>
          NEOLUTION SCIENCE DIVISION · IDENTITY PROTOCOL · 324B21
        </p>
      </div>
    </>
  );
}
