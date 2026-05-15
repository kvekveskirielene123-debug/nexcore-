"use client";

import { useState } from "react";

interface UserAvatar {
  url: string | null;
  name: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  characterAvatarUrl?: string | null;
  characterName?: string;
  userAvatar?: UserAvatar | null;
}

function ThumbIcon({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function MessageBubble({
  role,
  content,
  streaming = false,
  characterAvatarUrl,
  characterName,
  userAvatar,
}: MessageBubbleProps) {
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-5">
        <div
          className="max-w-[78%] sm:max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words"
          style={{ background: "#1d1535", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          {content}
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex flex-col mb-6">
      {/* Name row with avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.4)" }}
        >
          {characterAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={characterAvatarUrl} alt={characterName ?? "AI"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-purple-300">
                {(characterName?.[0] ?? "A").toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-white leading-none">{characterName ?? "AI"}</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
          style={{ background: "rgba(124,58,237,0.25)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          AI
        </span>
      </div>

      {/* Message bubble */}
      <div
        className="relative ml-10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] overflow-hidden"
        style={{ background: "#1a1d28", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Subtle streaming scanline */}
        {streaming && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.06) 50%, transparent 100%)",
              backgroundSize: "100% 60px",
              animation: "chatScanline 2.8s linear infinite",
            }}
          />
        )}
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words relative z-10">
          {content}
          {streaming && (
            <span
              className="inline-block w-[2px] h-[14px] ml-0.5 bg-purple-400 align-middle"
              style={{ animation: "chatCursorBlink 0.8s step-end infinite" }}
              aria-hidden
            />
          )}
        </p>
      </div>

      {/* Like / dislike buttons — shown after message completes */}
      {!streaming && (
        <div className="flex gap-1 ml-10 mt-1.5">
          <button
            onClick={() => setReaction(reaction === "up" ? null : "up")}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              reaction === "up"
                ? "bg-green-500/15 text-green-400"
                : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
            }`}
            aria-label="Like"
          >
            <ThumbIcon direction="up" />
          </button>
          <button
            onClick={() => setReaction(reaction === "down" ? null : "down")}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              reaction === "down"
                ? "bg-red-500/15 text-red-400"
                : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
            }`}
            aria-label="Dislike"
          >
            <ThumbIcon direction="down" />
          </button>
        </div>
      )}
    </div>
  );
}
