"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRating } from "@/lib/ratings/useRating";
import { HexRating } from "./HexRating";
import { AverageRatingBadge } from "./AverageRatingBadge";

type RatingMode =
  | { kind: "loggedOut" }
  | { kind: "creator" } // viewer is the creator
  | { kind: "needsChat"; characterId: string }
  | { kind: "ratable"; characterId: string; initialRating: number | null };

interface RatingSectionProps {
  characterId: string;
  characterName: string;
  ratingCount: number;
  average: number | null;       // public-revealed average (null below threshold)
  averageRaw: number | null;    // exact average for creator's eyes
  mode: RatingMode;
}

export function RatingSection(props: RatingSectionProps) {
  return (
    <section
      id="rate"
      className="rounded-xl border border-purple-700/15 bg-[#0c0520]/50 p-6 relative overflow-hidden scroll-mt-24"
    >
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent absolute top-0 left-0 right-0" />
      <div
        className="text-[10px] tracking-[3px] text-[#00e5ff]/50 uppercase mb-4"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ◈ RATINGS · CLONE DESIGNATIONS
      </div>

      {/* Public average display */}
      <div className="mb-5">
        <div
          className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Average designation
        </div>
        <AverageRatingBadge
          ratingCount={props.ratingCount}
          average={props.average}
          size="md"
          showCount
        />
        {/* Creator-only: show real average even below threshold */}
        {props.mode.kind === "creator" &&
          props.average === null &&
          props.averageRaw !== null && (
            <p
              className="mt-2 text-[10px] text-[#7a6a9a] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              (creator view) actual average: {props.averageRaw.toFixed(2)} from{" "}
              {props.ratingCount} rating{props.ratingCount === 1 ? "" : "s"}.
              Public reveal at 5+.
            </p>
          )}
      </div>

      {/* Personal rating UI — depends on mode */}
      {props.mode.kind === "loggedOut" && (
        <LoggedOutPrompt characterId={props.characterId} />
      )}

      {props.mode.kind === "creator" && <CreatorMessage />}

      {props.mode.kind === "needsChat" && (
        <NeedsChatMessage characterId={props.mode.characterId} characterName={props.characterName} />
      )}

      {props.mode.kind === "ratable" && (
        <RatableHexes
          characterId={props.mode.characterId}
          characterName={props.characterName}
          initialRating={props.mode.initialRating}
        />
      )}
    </section>
  );
}

// ── LOGGED-OUT ─────────────────────────────────────────

function LoggedOutPrompt({ characterId }: { characterId: string }) {
  return (
    <div className="rounded-lg bg-[#08041a]/60 border border-purple-700/15 p-4">
      <p
        className="text-[13px] text-[#a78bfa] italic mb-3 leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Sign up and chat to designate this entity.
      </p>
      <div className="flex items-center gap-3">
        <HexRating value={null} disabled size="md" />
        <Link
          href={`/signup?next=/character/${characterId}`}
          className="text-[10px] tracking-[2px] text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          CREATE ACCOUNT →
        </Link>
      </div>
    </div>
  );
}

// ── CREATOR ───────────────────────────────────────────

function CreatorMessage() {
  return (
    <div className="rounded-lg bg-[#08041a]/60 border border-purple-700/15 p-4 flex items-center gap-3">
      <HexRating value={null} disabled size="md" />
      <p
        className="text-[12px] text-[#7a6a9a] italic"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Creators can&apos;t rate their own subjects.
      </p>
    </div>
  );
}

// ── NEEDS CHAT ────────────────────────────────────────

function NeedsChatMessage({
  characterId,
  characterName,
}: {
  characterId: string;
  characterName: string;
}) {
  return (
    <div className="rounded-lg bg-[#08041a]/60 border border-purple-700/15 p-4">
      <p
        className="text-[13px] text-[#a78bfa] italic mb-3 leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Chat with {characterName} first to designate.
        <br />
        <span className="text-[11px] text-[#7a6a9a]">
          Real ratings come from real experience.
        </span>
      </p>
      <div className="flex items-center gap-3">
        <HexRating value={null} disabled size="md" />
        <Link
          href={`/chat/${characterId}`}
          className="text-[10px] tracking-[2px] text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ▶ INITIATE CONTACT →
        </Link>
      </div>
    </div>
  );
}

// ── RATABLE ───────────────────────────────────────────

function RatableHexes({
  characterId,
  characterName,
  initialRating,
}: {
  characterId: string;
  characterName: string;
  initialRating: number | null;
}) {
  const { rating, submitState, error, setRating, clearRating } = useRating({
    characterId,
    initialRating,
  });
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  // On mount, if URL hash is #rate, briefly pulse the cells to draw attention
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#rate") {
      setPulseKey((k) => k + 1);
    }
  }, []);

  const handleClick = (n: number) => {
    if (rating === n) {
      // Clicking same cell = clear
      clearRating();
    } else {
      setRating(n);
      setPulseKey((k) => k + 1);
    }
  };

  return (
    <div className="rounded-lg bg-[#08041a]/60 border border-purple-700/15 p-4">
      <div
        className="text-[10px] tracking-[2px] text-[#7a6a9a] uppercase mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your designation
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <HexRating
          key={pulseKey}
          value={rating}
          hoverValue={hoverValue}
          onClick={handleClick}
          onHover={setHoverValue}
          pulsing={submitState === "saved"}
          size="lg"
        />

        {rating !== null && (
          <button
            onClick={clearRating}
            className="text-[10px] tracking-[2px] text-[#7a6a9a] hover:text-red-400 underline-offset-2 hover:underline transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            CLEAR
          </button>
        )}

        {/* Status toast inline */}
        {submitState === "saving" && (
          <span
            className="text-[10px] tracking-[2px] text-[#a78bfa] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ TRANSMITTING...
          </span>
        )}
        {submitState === "saved" && (
          <span
            className="text-[10px] tracking-[2px] text-cyan-400 uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              textShadow: "0 0 10px rgba(0,229,255,0.4)",
            }}
          >
            ✓ DESIGNATION RECORDED · 324B21
          </span>
        )}
        {submitState === "error" && error && (
          <span
            className="text-[10px] tracking-[1.5px] text-red-400 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ✕ {error}
          </span>
        )}
      </div>

      <p
        className="text-[10px] text-[#7a6a9a] italic mt-3"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {rating === null
          ? "Click a cell to designate. You can change it anytime."
          : `You designated ${characterName} ${rating} of 5. Click the same cell again to clear.`}
      </p>
    </div>
  );
}
