"use client";

import { useState, useCallback } from "react";

export type SubmitState = "idle" | "saving" | "saved" | "error";

interface UseRatingOptions {
  characterId: string;
  initialRating: number | null;
}

/**
 * Hook for user's personal rating on a character.
 *
 * - rating: current user's rating (1-5) or null
 * - submitState: 'idle' | 'saving' | 'saved' | 'error' (used for toast UI)
 * - error: error message string when submitState === 'error'
 * - setRating(n): submit a rating (1-5). Optimistic. Reverts on failure.
 * - clearRating(): remove user's rating.
 */
export function useRating({ characterId, initialRating }: UseRatingOptions) {
  const [rating, setRatingState] = useState<number | null>(initialRating);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const setRating = useCallback(
    async (next: number) => {
      if (next < 1 || next > 5) return;
      const previous = rating;
      setRatingState(next);
      setSubmitState("saving");
      setError(null);

      try {
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId, rating: next }),
        });
        const data = await res.json();
        if (!res.ok) {
          setRatingState(previous);
          setError(data.error ?? "Could not save rating.");
          setSubmitState("error");
          // Auto-clear error state after a moment
          setTimeout(() => setSubmitState("idle"), 3000);
          return;
        }
        setSubmitState("saved");
        setTimeout(() => setSubmitState("idle"), 2000);
      } catch (err: any) {
        setRatingState(previous);
        setError(err.message ?? "Network error.");
        setSubmitState("error");
        setTimeout(() => setSubmitState("idle"), 3000);
      }
    },
    [characterId, rating]
  );

  const clearRating = useCallback(async () => {
    const previous = rating;
    setRatingState(null);
    setSubmitState("saving");
    setError(null);

    try {
      const res = await fetch(`/api/ratings?characterId=${characterId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setRatingState(previous);
        setError(data.error ?? "Could not clear rating.");
        setSubmitState("error");
        setTimeout(() => setSubmitState("idle"), 3000);
        return;
      }
      setSubmitState("saved");
      setTimeout(() => setSubmitState("idle"), 2000);
    } catch (err: any) {
      setRatingState(previous);
      setError(err.message ?? "Network error.");
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 3000);
    }
  }, [characterId, rating]);

  return { rating, submitState, error, setRating, clearRating };
}
