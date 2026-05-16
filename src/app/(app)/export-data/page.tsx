"use client";

import { useState } from "react";
import Link from "next/link";

export default function ExportDataPage() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleExport = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/settings/export-data");
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexcor-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "transparent" }}>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-7"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.35), rgba(124,58,237,0.25), transparent)" }}
        />

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.2)",
            boxShadow: "0 0 32px rgba(0,229,255,0.07)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[24px] font-black tracking-[0.5px]"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
          >
            Export My Data
          </h1>
          <p
            className="text-[13px] leading-relaxed max-w-xs mx-auto"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.7)" }}
          >
            Download everything Nexcor holds about you as a single JSON file — your profile, characters, conversations, personas, marks history, and more.
          </p>
        </div>

        {/* What's included */}
        <div
          className="w-full rounded-2xl px-5 py-4 text-left"
          style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)" }}
        >
          <p
            className="text-[9px] tracking-[2.5px] uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.45)" }}
          >
            Included in your export
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Profile & account info",
              "All characters you created",
              "Personas",
              "Conversation history & messages",
              "Marks transaction log",
              "Favorites & ratings",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span style={{ color: "#00e5ff", fontSize: 10 }}>◈</span>
                <span
                  className="text-[12px]"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={state === "loading" || state === "done"}
          className="w-full py-3.5 rounded-2xl text-[12px] tracking-[2px] uppercase font-bold transition-all duration-300 active:scale-95 disabled:opacity-60"
          style={{
            fontFamily: "var(--font-mono)",
            background: state === "done"
              ? "rgba(34,197,94,0.12)"
              : "rgba(0,229,255,0.1)",
            border: state === "done"
              ? "1px solid rgba(34,197,94,0.35)"
              : "1px solid rgba(0,229,255,0.3)",
            color: state === "done" ? "#22c55e" : "#00e5ff",
            boxShadow: state === "done"
              ? "0 0 20px rgba(34,197,94,0.08)"
              : "0 0 20px rgba(0,229,255,0.07)",
          }}
        >
          {state === "idle"    && "⬇  Export →"}
          {state === "loading" && "Preparing…"}
          {state === "done"    && "✓  Downloaded"}
          {state === "error"   && "⬇  Export →"}
        </button>

        {state === "error" && (
          <p
            className="text-[11px] -mt-4"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.7)" }}
          >
            Something went wrong. Try again or export from Settings.
          </p>
        )}

        {state === "done" && (
          <p
            className="text-[11px] -mt-4"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(34,197,94,0.65)" }}
          >
            Your file has been saved to your downloads folder.
          </p>
        )}

        {/* Footer links */}
        <div className="flex items-center gap-4 pt-1">
          <Link
            href="/settings#data"
            className="text-[10px] tracking-[1.5px] uppercase transition-all hover:text-[#c084fc]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            Settings
          </Link>
          <span style={{ color: "rgba(122,106,154,0.2)", fontSize: 10 }}>·</span>
          <Link
            href="/privacy"
            className="text-[10px] tracking-[1.5px] uppercase transition-all hover:text-[#00e5ff]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            Privacy Policy
          </Link>
          <span style={{ color: "rgba(122,106,154,0.2)", fontSize: 10 }}>·</span>
          <Link
            href="/contact"
            className="text-[10px] tracking-[1.5px] uppercase transition-all hover:text-[#00e5ff]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            Contact
          </Link>
        </div>

        <p
          className="text-[8px] tracking-[2.5px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.18)" }}
        >
          GDPR Art. 20 · Right to Data Portability
        </p>
      </div>
    </div>
  );
}
