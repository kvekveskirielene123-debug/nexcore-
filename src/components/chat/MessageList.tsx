"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatEmptyState } from "./ChatEmptyState";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface MessageListProps {
  messages: Message[];
  characterName: string;
  characterAvatarUrl?: string;
  characterGreeting?: string | null;
  showTyping?: boolean;
  onContinue?: () => void;
  backgroundUrl?: string;
}

export function MessageList({ messages, characterName, characterAvatarUrl, characterGreeting, showTyping, onContinue, backgroundUrl }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, showTyping]);

  const lastAiIdx = messages.reduce<number>((acc, m, i) => (m.role === "assistant" ? i : acc), -1);

  return (
    <div
      className="flex-1 overflow-y-auto overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        background: backgroundUrl
          ? `linear-gradient(rgba(13,15,20,0.72),rgba(13,15,20,0.72)) center/cover, url(${backgroundUrl}) center/cover no-repeat`
          : "#0d0f14",
      } as React.CSSProperties}
    >
      {/* Always-visible AI disclaimer strip */}
      <div
        className="flex items-center justify-center gap-1.5 px-4 py-1.5 flex-shrink-0"
        style={{
          background: "rgba(124,58,237,0.05)",
          borderBottom: "1px solid rgba(124,58,237,0.09)",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.5)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span
          className="text-[10px]"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(148,163,184,0.4)", letterSpacing: "0.3px" }}
        >
          AI character · fictional · not a real person · for entertainment only
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="h-full flex flex-col">
          <ChatEmptyState
            characterName={characterName}
            characterAvatarUrl={characterAvatarUrl ?? null}
            greeting={characterGreeting ?? null}
          />
        </div>
      ) : (
        <div className="py-5">
          <div className="max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                streaming={m.streaming}
                characterName={characterName}
                characterAvatarUrl={characterAvatarUrl}
                isLast={i === lastAiIdx}
                onContinue={i === lastAiIdx ? onContinue : undefined}
              />
            ))}
            {showTyping && (
              <div className="flex items-center gap-2.5 px-4 sm:px-6 mb-4" style={{ animation: "nx-message-in 0.25s ease both" }}>
                <div
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                  style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.4), 0 0 10px rgba(124,58,237,0.15)" }}
                >
                  {characterAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={characterAvatarUrl} alt={characterName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b1d8a,#1d1535)" }}>
                      <span className="text-[9px] font-black text-purple-300">{characterName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-tl-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{ width: 7, height: 7, background: "rgba(192,132,252,0.7)", animation: `nx-thinking-dot 1.4s ease-in-out ${i * 0.18}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
