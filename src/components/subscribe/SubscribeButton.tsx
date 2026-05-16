"use client";

import { useState } from "react";

interface SubscribeButtonProps {
  tier: string;
  highlight: boolean;
  label?: string;
}

export function SubscribeButton({ tier, highlight, label = "◈ GET BRILLIANT →" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`w-full py-3.5 rounded-xl text-[10px] tracking-[3px] font-bold transition-all duration-200 disabled:opacity-60 ${
        highlight
          ? "bg-cyan-400 text-black hover:shadow-[0_0_32px_rgba(0,229,255,0.55)] hover:scale-[1.02] active:scale-95"
          : "border border-purple-500/40 text-[#a78bfa] hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-400/5 active:scale-95"
      }`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {loading ? "CONNECTING..." : label}
    </button>
  );
}
