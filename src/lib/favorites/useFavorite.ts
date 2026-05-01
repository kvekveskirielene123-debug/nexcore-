"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook: returns [favorited, toggle, loading].
 *
 * - On mount, fetches the current favorite state from /api/favorites?characterId=...
 * - Calling toggle() flips the state optimistically, then POSTs /api/favorites.
 * - On server error, the state reverts.
 *
 * Pass `initialFavorited` from a server-rendered prop to avoid the initial fetch
 * (zero network flash). Used by the profile page + favorites rail.
 */
export function useFavorite(
  characterId: string,
  initialFavorited?: boolean
): [boolean, () => Promise<void>, boolean] {
  const [favorited, setFavorited] = useState(initialFavorited ?? false);
  const [loading, setLoading] = useState(initialFavorited === undefined);

  // Fetch initial state only if caller didn't pre-seed it
  useEffect(() => {
    if (initialFavorited !== undefined) return;
    let cancelled = false;
    fetch(`/api/favorites?characterId=${characterId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setFavorited(!!d.favorited);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [characterId, initialFavorited]);

  const toggle = useCallback(async () => {
    const next = !favorited;
    setFavorited(next); // optimistic

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          action: next ? "add" : "remove",
        }),
      });
      if (!res.ok) {
        // Revert on failure
        setFavorited(!next);
      }
    } catch {
      setFavorited(!next);
    }
  }, [characterId, favorited]);

  return [favorited, toggle, loading];
}
