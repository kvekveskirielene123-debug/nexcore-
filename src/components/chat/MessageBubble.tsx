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
        nodes.push(<em key={k++} style={{ color: "rgba(196,181,253,0.75)" }}>{m[3]}</em>);
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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
}: MessageBubbleProps) {
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 px-4 sm:px-6">
        <div
          className="max-w-[82%] sm:max-w-[72%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed break-words"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.28) 0%, rgba(20,14,40,0.95) 100%)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "rgba(226,217,243,0.92)",
            fontFamily: "var(--font-body)",
          }}
        >
          {renderContent(content)}
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex flex-col mb-5 px-4 sm:px-6">
      {/* Name + avatar row */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.45), 0 0 8px rgba(124,58,237,0.15)" }}
        >
          {characterAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={characterAvatarUrl} alt={characterName ?? "AI"} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b1d8a, #1d1535)" }}
            >
              <span className="text-[9px] font-black text-purple-300" style={{ fontFamily: "var(--font-display)" }}>
                {(characterName?.[0] ?? "A").toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span
          className="text-[13px] font-bold leading-none"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.88)" }}
        >
          {characterName ?? "AI"}
        </span>
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest"
          style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.28)" }}
        >
          AI
        </span>
      </div>

      {/* Message bubble */}
      <div
        className="relative ml-9 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] sm:max-w-[78%] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderLeft: "2px solid rgba(124,58,237,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderLeftWidth: "2px",
          borderLeftColor: "rgba(124,58,237,0.35)",
        }}
      >
        {streaming && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.05) 50%, transparent 100%)",
              backgroundSize: "100% 60px",
              animation: "chatScanline 2.8s linear infinite",
            }}
          />
        )}
        <p
          className="text-sm leading-relaxed break-words relative z-10"
          style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.78)" }}
        >
          {renderContent(content)}
          {streaming && (
            <span
              className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
              style={{
                background: "#c084fc",
                animation: "chatCursorBlink 0.8s step-end infinite",
                boxShadow: "0 0 6px rgba(192,132,252,0.6)",
              }}
              aria-hidden
            />
          )}
        </p>
      </div>

      {/* Reaction buttons */}
      {!streaming && (
        <div className="flex gap-1 ml-9 mt-1.5">
          <button
            onClick={() => setReaction(reaction === "up" ? null : "up")}
            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
              reaction === "up"
                ? "text-green-400"
                : "text-slate-700 hover:text-slate-400 hover:bg-white/5"
            }`}
            style={reaction === "up" ? { background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" } : {}}
            aria-label="Like"
          >
            <ThumbIcon direction="up" />
          </button>
          <button
            onClick={() => setReaction(reaction === "down" ? null : "down")}
            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
              reaction === "down"
                ? "text-red-400"
                : "text-slate-700 hover:text-slate-400 hover:bg-white/5"
            }`}
            style={reaction === "down" ? { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" } : {}}
            aria-label="Dislike"
          >
            <ThumbIcon direction="down" />
          </button>
        </div>
      )}
    </div>
  );
}
