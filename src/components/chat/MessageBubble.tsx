"use client";

import { useState, Fragment } from "react";

function renderContent(content: string): React.ReactNode {
  return content.split("\n").map((line, lineIdx, lines) => {
    const nodes: React.ReactNode[] = [];
    const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = pattern.exec(line)) !== null) {
      if (m.index > last) nodes.push(line.slice(last, m.index));
      if (m[2] !== undefined) {
        nodes.push(<strong key={k++} className="font-semibold text-white">{m[2]}</strong>);
      } else if (m[3] !== undefined) {
        nodes.push(<em key={k++} style={{ color: "rgba(196,181,253,0.8)" }}>{m[3]}</em>);
      }
      last = pattern.lastIndex;
    }
    if (last < line.length) nodes.push(line.slice(last));
    return (
      <Fragment key={lineIdx}>
        {nodes}
        {lineIdx < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  isLast?: boolean;
  characterAvatarUrl?: string | null;
  characterName?: string;
  onContinue?: () => void;
}

export function MessageBubble({
  role,
  content,
  streaming = false,
  isLast = false,
  characterAvatarUrl,
  characterName,
  onContinue,
}: MessageBubbleProps) {
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [heartAnim, setHeartAnim] = useState(false);
  const isUser = role === "user";

  const handleLike = () => {
    if (reaction !== "up") {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 700);
    }
    setReaction(reaction === "up" ? null : "up");
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 px-4 sm:px-6" style={{ animation: "nx-message-in 0.28s ease both" }}>
        <div
          className="max-w-[78%] sm:max-w-[65%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed break-words"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            border:     "1px solid rgba(167,139,250,0.25)",
            color:      "rgba(255,255,255,0.95)",
            fontFamily: "var(--font-body)",
            boxShadow:  "0 2px 20px rgba(124,58,237,0.35)",
          }}
        >
          {renderContent(content)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-5 px-4 sm:px-6" style={{ animation: "nx-message-in 0.3s ease both" }}>
      {/* Name row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow: "0 0 0 2px rgba(124,58,237,0.5), 0 0 12px rgba(124,58,237,0.18)" }}
        >
          {characterAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={characterAvatarUrl} alt={characterName ?? "AI"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b1d8a,#1d1535)" }}>
              <span className="text-[10px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                {(characterName?.[0] ?? "A").toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + badge */}
        <span className="text-sm font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "rgba(237,233,254,0.92)" }}>
          {characterName ?? "AI"}
        </span>
        <span
          className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest"
          style={{ background: "rgba(124,58,237,0.25)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.35)" }}
        >
          AI
        </span>
      </div>

      {/* Bubble */}
      <div className="relative ml-11 group">
        <div
          className="relative px-4 py-3.5 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] overflow-hidden text-sm leading-relaxed break-words"
          style={{
            background: "rgba(20,14,42,0.8)",
            border: "1px solid rgba(124,58,237,0.18)",
            color: "rgba(226,217,243,0.88)",
            fontFamily: "var(--font-body)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Streaming scanline glow */}
          {streaming && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg,transparent 0%,rgba(124,58,237,0.06) 50%,transparent 100%)",
                backgroundSize: "100% 60px",
                animation: "chatScanline 2.8s linear infinite",
              }}
            />
          )}

          <p className="relative z-10">
            {renderContent(content)}
            {streaming && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
                style={{ background: "#c084fc", animation: "chatCursorBlink 0.8s step-end infinite", boxShadow: "0 0 6px rgba(192,132,252,0.6)" }}
                aria-hidden
              />
            )}
          </p>
        </div>

        {/* Actions — visible after streaming done */}
        {!streaming && (
          <div className="flex items-center justify-between mt-2 max-w-[90%] sm:max-w-[80%]">
            {/* Reaction buttons */}
            <div className="flex items-center gap-1 relative">
              {/* Heart float animation */}
              {heartAnim && (
                <span
                  className="absolute -top-6 left-2 text-base pointer-events-none select-none"
                  style={{ animation: "heartFloat 0.7s ease forwards" }}
                >
                  ❤️
                </span>
              )}
              <button
                onClick={handleLike}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-xs active:scale-90"
                style={
                  reaction === "up"
                    ? { background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.22)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(100,116,139,0.6)", border: "1px solid rgba(255,255,255,0.06)" }
                }
                aria-label="Like"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={reaction === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="none" strokeWidth="2" />
                </svg>
                {reaction === "up" && <span className="font-medium">1</span>}
              </button>
              <button
                onClick={() => setReaction(reaction === "down" ? null : "down")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-xs active:scale-90"
                style={
                  reaction === "down"
                    ? { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.22)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(100,116,139,0.6)", border: "1px solid rgba(255,255,255,0.06)" }
                }
                aria-label="Dislike"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={reaction === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
                  <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" fill="none" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Variation nav — 1/1 */}
            <div className="flex items-center gap-1">
              <button
                className="w-5 h-5 flex items-center justify-center rounded transition-all"
                style={{ color: "rgba(122,106,154,0.35)" }}
                aria-label="Previous variation"
                disabled
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-[9px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}>1/1</span>
              <button
                className="w-5 h-5 flex items-center justify-center rounded transition-all"
                style={{ color: "rgba(122,106,154,0.35)" }}
                aria-label="Next variation"
                disabled
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue to Generate button — only on last AI message when not streaming */}
      {isLast && !streaming && onContinue && (
        <div className="ml-11 mt-2">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.22)",
              color: "rgba(192,132,252,0.8)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; e.currentTarget.style.color = "#c084fc"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.color = "rgba(192,132,252,0.8)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Continue to Generate Message ⚡
          </button>
        </div>
      )}
    </div>
  );
}
