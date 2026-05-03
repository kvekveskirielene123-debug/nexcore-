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
  /** ISO string of when username was last changed, or null */
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

  // Rate-limit display
  const daysUntilUsernameChange = (() => {
    if (!usernameChangedAt) return 0;
    const days =
      USERNAME_COOLDOWN_DAYS -
      (Date.now() - new Date(usernameChangedAt).getTime()) /
        (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(days));
  })();
  const usernameRateLimited = daysUntilUsernameChange > 0;
  const usernameChanged = username.trim().toLowerCase() !== initialUsername.toLowerCase();

  // Live username availability check
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
      const body: Record<string, any> = {
        bio,
        tone_preference: tone,
        avatar_url: avatarUrl,
      };
      // Only send username if it changed
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
    } catch (err: any) {
      setSaveError(err.message ?? "Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <ProfileAvatarUpload
          currentUrl={avatarUrl}
          username={username || initialUsername}
          onUploaded={(url) => setAvatarUrl(url)}
        />
        <p
          className="text-[10px] tracking-[2px] text-[#7a6a9a] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          TAP TO CHANGE AVATAR
        </p>
      </div>

      {/* Username */}
      <div>
        <label
          className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Username *
        </label>

        {usernameRateLimited ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#08041a] border border-purple-700/20">
              <span
                className="text-[14px] text-[#e2d9f3] flex-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {username}
              </span>
              <span
                className="text-[9px] tracking-[2px] text-amber-400 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                LOCKED
              </span>
            </div>
            <p
              className="text-[11px] text-amber-400/80 mt-1.5 italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ◈ You can change your username again in{" "}
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
                className={`w-full bg-[#08041a] border rounded-lg px-3 py-2.5 pr-10 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none transition-all ${
                  usernameState.status === "available"
                    ? "border-emerald-500/50 focus:border-emerald-400/60"
                    : usernameState.status === "taken" ||
                      usernameState.status === "invalid"
                    ? "border-red-500/50 focus:border-red-400/60"
                    : "border-purple-700/25 focus:border-cyan-400/40"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              />
              {/* Status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameState.status === "checking" && (
                  <span className="text-[#7a6a9a] text-xs animate-pulse">···</span>
                )}
                {usernameState.status === "available" && (
                  <span className="text-emerald-400 text-sm">✓</span>
                )}
                {(usernameState.status === "taken" ||
                  usernameState.status === "invalid") && (
                  <span className="text-red-400 text-sm">✕</span>
                )}
              </div>
            </div>

            {usernameState.status === "available" && (
              <p
                className="text-[11px] text-emerald-400 mt-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ◈ Available
              </p>
            )}
            {(usernameState.status === "taken" ||
              usernameState.status === "invalid") && (
              <p
                className="text-[11px] text-red-400 mt-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {(usernameState as any).reason}
              </p>
            )}
            {!usernameChanged && (
              <p
                className="text-[10px] text-[#7a6a9a] mt-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                3-30 chars, letters/numbers/underscore only. Max 1 change per 30
                days.
              </p>
            )}
          </>
        )}
      </div>

      {/* Bio */}
      <div>
        <label
          className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={MAX_BIO}
          placeholder="A few words about you — shown on your public profile."
          className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <p
          className={`text-[10px] mt-1.5 ${
            bio.length >= MAX_BIO ? "text-amber-400" : "text-[#7a6a9a]"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {bio.length}/{MAX_BIO}
        </p>
      </div>

      {/* Tone preference */}
      <div>
        <label
          className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Preferred tone
        </label>
        <p
          className="text-[11px] text-[#7a6a9a] italic mb-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          How you'd like the AI to speak with you when no persona is active.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PERSONA_TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                tone === t.value
                  ? "border-cyan-400/50 bg-cyan-400/8 text-cyan-400"
                  : "border-purple-700/25 text-[#a78bfa] hover:border-purple-500/50"
              }`}
            >
              <div
                className="text-[10px] tracking-[1.5px] font-bold uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t.label}
              </div>
              <div
                className="text-[10px] text-[#7a6a9a] mt-0.5 leading-tight"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error / save state */}
      {saveError && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => router.push("/settings")}
          className="px-6 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← BACK
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-8 py-3 rounded-lg font-bold text-[11px] tracking-[3px] transition-all disabled:opacity-40 ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-cyan-400 text-black hover:shadow-[0_0_36px_rgba(0,229,255,0.5)]"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {saving ? "SAVING..." : saved ? "✓ SAVED · 324B21" : "◈ SAVE CHANGES →"}
        </button>
      </div>

      <p
        className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
      </p>
    </div>
  );
}
