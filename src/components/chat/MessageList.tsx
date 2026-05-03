"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

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
}

export function MessageList({ messages, characterName, characterAvatarUrl }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-50">
            <p
              className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ AWAITING FIRST TRANSMISSION ◈
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              streaming={m.streaming}
              characterName={characterName}
              characterAvatarUrl={characterAvatarUrl}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
