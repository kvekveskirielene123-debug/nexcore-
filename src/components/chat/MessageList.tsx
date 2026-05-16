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
}

export function MessageList({ messages, characterName, characterAvatarUrl, characterGreeting }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain" style={{ background: "#0d0f14", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
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
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                streaming={m.streaming}
                characterName={characterName}
                characterAvatarUrl={characterAvatarUrl}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
