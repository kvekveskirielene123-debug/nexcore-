"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 text-center max-w-sm">
        {/* Error code */}
        <div
          className="text-[11px] tracking-[4px] uppercase mb-4"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
        >
          ◈ SYSTEM ERROR · 324B21
        </div>

        {/* Glitchy number */}
        <div
          className="text-[80px] font-black leading-none mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "rgba(0,229,255,0.15)",
            textShadow: "2px 0 rgba(124,58,237,0.4), -2px 0 rgba(0,229,255,0.4)",
          }}
        >
          ERR
        </div>

        <h1
          className="text-[18px] font-bold tracking-[3px] uppercase mb-3"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}
        >
          TRANSMISSION FAILED
        </h1>

        <p
          className="text-[13px] leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.8)" }}
        >
          Something went wrong on our end. You can try again or head back to Explore.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.35)",
              color: "#00e5ff",
            }}
          >
            RETRY
          </button>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-lg text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            EXPLORE
          </Link>
        </div>

        {error.digest && (
          <p
            className="mt-6 text-[9px] tracking-[1.5px]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}
          >
            DIGEST · {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
