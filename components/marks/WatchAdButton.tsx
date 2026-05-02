"use client";

import { useState, useEffect, useRef } from "react";

interface WatchAdButtonProps {
  /** Called after marks are credited. Pass the new balance. */
  onRewarded?: (newBalance: number, adsRemaining: number) => void;
  /** Compact version for embedding in small spaces (e.g. marks widget) */
  compact?: boolean;
}

type AdState =
  | "idle"           // hasn't tried yet
  | "checking"       // checking remaining ad count
  | "ready"          // can watch
  | "countdown"      // ad is "playing" (countdown timer)
  | "crediting"      // API call to credit marks
  | "rewarded"       // success — marks credited
  | "rate_limited"   // no ads left in this window
  | "error";         // something went wrong

const AD_DURATION_SECONDS = 5; // stub: pretend ad lasts 5 seconds

export function WatchAdButton({ onRewarded, compact = false }: WatchAdButtonProps) {
  const [state, setState] = useState<AdState>("idle");
  const [countdown, setCountdown] = useState(AD_DURATION_SECONDS);
  const [adsRemaining, setAdsRemaining] = useState<number | null>(null);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);
  const [credited, setCredited] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check remaining ads on mount
  useEffect(() => {
    setState("checking");
    fetch("/api/marks/watch-ad")
      .then((r) => r.json())
      .then((d) => {
        setAdsRemaining(d.ads_remaining ?? 0);
        setState(d.ads_remaining > 0 ? "ready" : "rate_limited");
      })
      .catch(() => setState("ready")); // fail open
  }, []);

  // Countdown timer when ad is "playing"
  useEffect(() => {
    if (state !== "countdown") return;
    setCountdown(AD_DURATION_SECONDS);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          creditMarks();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleWatch = () => {
    if (state !== "ready" && state !== "rewarded") return;
    setState("countdown");
  };

  const creditMarks = async () => {
    setState("crediting");
    try {
      const res = await fetch("/api/marks/watch-ad", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        setNextAvailableAt(data.next_available_at ?? null);
        setState("rate_limited");
        setAdsRemaining(0);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setState("error");
        return;
      }

      setCredited(data.credited);
      setAdsRemaining(data.ads_remaining);
      setState("rewarded");
      onRewarded?.(data.new_balance, data.ads_remaining);

      // After 3 seconds, reset to ready (if ads remain) or rate_limited
      setTimeout(() => {
        setState(data.ads_remaining > 0 ? "ready" : "rate_limited");
      }, 3000);
    } catch {
      setError("Network error.");
      setState("error");
    }
  };

  function formatCountdown(iso: string): string {
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "soon";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  }

  // ── Render ───────────────────────────────────────────────

  if (compact) {
    return (
      <CompactAdButton
        state={state}
        countdown={countdown}
        adsRemaining={adsRemaining}
        credited={credited}
        onWatch={handleWatch}
      />
    );
  }

  return (
    <div className="rounded-xl border border-purple-700/20 bg-[#0c0520]/60 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div
        className="text-[9px] tracking-[3px] text-amber-400/60 uppercase mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ◈ EARN MARKS · FREE
      </div>

      {state === "checking" && (
        <p className="text-sm text-[#7a6a9a] italic" style={{ fontFamily: "var(--font-body)" }}>
          Checking available ads...
        </p>
      )}

      {(state === "ready" || state === "rewarded") && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div
              className="text-[15px] font-bold text-white mb-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Watch a short ad · earn 50 ⟡
            </div>
            <div
              className="text-[11px] text-[#7a6a9a] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {adsRemaining !== null ? `${adsRemaining} of 5 remaining this half-hour` : "Up to 5 ads per 30 minutes"}
            </div>
          </div>
          <button
            onClick={handleWatch}
            className="px-5 py-2.5 rounded-lg border border-amber-400/40 text-[10px] tracking-[3px] font-bold text-amber-400 hover:bg-amber-400/8 hover:shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ▶ WATCH AD
          </button>
        </div>
      )}

      {state === "countdown" && (
        <div className="text-center py-4">
          <div
            className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ AD PLAYING · DO NOT CLOSE
          </div>

          {/* Stub ad placeholder — replace with real ad SDK iframe/div */}
          <div
            className="w-full h-32 rounded-lg border border-amber-400/20 bg-amber-400/5 flex items-center justify-center mb-3"
            aria-label="Advertisement"
          >
            <span
              className="text-[11px] tracking-[2px] text-amber-400/60 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ ADVERTISEMENT
            </span>
          </div>

          {/* Countdown ring */}
          <div className="inline-flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke="rgba(245,158,11,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - countdown / AD_DURATION_SECONDS)}`}
                transform="rotate(-90 28 28)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
              <text
                x="28" y="33"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="14"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {countdown}
              </text>
            </svg>
          </div>
          <div
            className="text-[10px] text-[#7a6a9a] mt-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            +50 ⟡ in {countdown}s
          </div>
        </div>
      )}

      {state === "crediting" && (
        <div className="text-center py-3">
          <p
            className="text-[12px] text-[#a78bfa] italic animate-pulse"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ◈ Crediting your marks...
          </p>
        </div>
      )}

      {state === "rewarded" && credited > 0 && (
        <div
          className="text-[11px] tracking-[2px] text-cyan-400 uppercase mt-2"
          style={{ fontFamily: "var(--font-mono)", textShadow: "0 0 8px rgba(0,229,255,0.4)" }}
        >
          ✓ +{credited} ⟡ CREDITED · 324B21
        </div>
      )}

      {state === "rate_limited" && (
        <div>
          <div
            className="text-[14px] font-bold text-[#e2d9f3] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No ads left right now
          </div>
          <p
            className="text-[12px] text-[#7a6a9a] italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            You've watched 5 ads this half-hour.
            {nextAvailableAt
              ? ` Come back in ${formatCountdown(nextAvailableAt)}.`
              : " Check back in 30 minutes."}
          </p>
        </div>
      )}

      {state === "error" && (
        <div>
          <p className="text-[12px] text-red-400 italic" style={{ fontFamily: "var(--font-body)" }}>
            {error ?? "Something went wrong. Try again."}
          </p>
          <button
            onClick={() => setState("ready")}
            className="text-[10px] tracking-[2px] text-[#a78bfa] hover:text-cyan-400 mt-2 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

// Compact variant for embedding in the marks widget / settings
function CompactAdButton({
  state,
  countdown,
  adsRemaining,
  credited,
  onWatch,
}: {
  state: AdState;
  countdown: number;
  adsRemaining: number | null;
  credited: number;
  onWatch: () => void;
}) {
  if (state === "rate_limited") {
    return (
      <div
        className="px-4 py-2 rounded-lg border border-purple-700/20 text-[10px] tracking-[2px] text-[#7a6a9a] text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ADS · 0 / 5 REMAINING
      </div>
    );
  }

  if (state === "countdown") {
    return (
      <div
        className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5 text-[10px] tracking-[2px] text-amber-400 text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ▶ AD PLAYING · {countdown}s · +50 ⟡
      </div>
    );
  }

  if (state === "rewarded" && credited > 0) {
    return (
      <div
        className="px-4 py-2 rounded-lg border border-cyan-400/30 bg-cyan-400/5 text-[10px] tracking-[2px] text-cyan-400 text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ✓ +{credited} ⟡ CREDITED
      </div>
    );
  }

  return (
    <button
      onClick={onWatch}
      className="px-4 py-2 rounded-lg border border-amber-400/30 text-[10px] tracking-[2px] text-amber-400 hover:bg-amber-400/8 transition-all text-center w-full"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      ▶ WATCH AD · +50 ⟡
      {adsRemaining !== null && (
        <span className="text-amber-400/60 ml-2">({adsRemaining} left)</span>
      )}
    </button>
  );
}
