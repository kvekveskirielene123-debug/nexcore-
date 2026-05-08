"use client";

import { useState } from "react";

interface Props {
  targetId: string;
  initialFollowing: boolean;
  initialCount: number;
  isOwnProfile: boolean;
}

export function FollowButton({ targetId, initialFollowing, initialCount, isOwnProfile }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);

  if (isOwnProfile) return null;

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (!data.error) {
        setFollowing(data.following);
        setCount(data.followerCount);
        if (data.following) { setFlash(true); setTimeout(() => setFlash(false), 1400); }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 disabled:opacity-60"
      style={{
        fontFamily: "var(--font-mono)",
        background: following
          ? "rgba(0,229,255,0.1)"
          : "rgba(124,58,237,0.12)",
        border: `1px solid ${following ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.4)"}`,
        color: following ? "#00e5ff" : "rgba(167,139,250,0.9)",
        boxShadow: flash ? "0 0 18px rgba(0,229,255,0.4)" : undefined,
        transform: flash ? "scale(1.05)" : undefined,
      }}
    >
      <span>{following ? "✓ FOLLOWING" : "+ FOLLOW"}</span>
      <span
        className="px-1.5 py-0.5 rounded text-[9px]"
        style={{
          background: "rgba(0,0,0,0.25)",
          color: following ? "rgba(0,229,255,0.7)" : "rgba(167,139,250,0.6)",
        }}
      >
        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </button>
  );
}
