"use client";

interface GreetingPreviewProps {
  greeting: string;
  characterName: string;
  characterAvatarUrl: string;
  showSignupGate?: boolean;
  characterId?: string;
}

import Link from "next/link";

export function GreetingPreview({
  greeting,
  characterName,
  characterAvatarUrl,
  showSignupGate = false,
  characterId,
}: GreetingPreviewProps) {
  if (!greeting?.trim()) return null;

  return (
    <section className="relative">
      <div
        className="text-[10px] tracking-[3px] text-[#00e5ff]/50 uppercase mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ◈ First Transmission
      </div>

      {/* Chat-bubble styled greeting */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-cyan-400/30 bg-[#150035]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={characterAvatarUrl}
            alt={characterName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 max-w-[85%]">
          <div
            className="relative rounded-2xl rounded-bl-md px-4 py-3 overflow-hidden bg-purple-900/15 border border-purple-700/25"
          >
            {/* Subtle scanline animation */}
            <div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none"
              style={{ animation: "greetScan 6s ease-in-out infinite" }}
            />
            <p
              className="whitespace-pre-wrap leading-relaxed text-[15px] text-[#d0c4f0] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {greeting}
            </p>
          </div>
        </div>
      </div>

      {/* Signup gate for logged-out users */}
      {showSignupGate && (
        <div className="mt-6 relative">
          {/* Fake input preview */}
          <div
            className="rounded-2xl border border-purple-700/20 bg-[#08041a] px-4 py-3 flex items-center gap-3 filter blur-[1px] opacity-70 pointer-events-none"
          >
            <span
              className="text-sm text-[#3a2a5a]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Type your message to {characterName}...
            </span>
            <div className="ml-auto w-8 h-8 rounded-full bg-purple-900/30" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-[#05020d]/60 to-[#05020d]/95 flex flex-col items-center justify-center gap-3">
            <p
              className="text-[11px] tracking-[3px] text-[#a78bfa] uppercase text-center px-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ CONTINUE THE TRANSMISSION
            </p>
            <Link
              href={`/signup?next=/character/${characterId ?? ""}`}
              className="px-7 py-2.5 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_28px_rgba(0,229,255,0.5)] transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              CREATE FREE ACCOUNT
            </Link>
            <Link
              href={`/login?next=/character/${characterId ?? ""}`}
              className="text-[10px] tracking-[2px] text-[#7a6a9a] hover:text-cyan-400 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ALREADY A SUBJECT? → SIGN IN
            </Link>
          </div>
        </div>
      )}

    </section>
  );
}
