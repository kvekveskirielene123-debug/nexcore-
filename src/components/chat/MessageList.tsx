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
    <div className="flex-1 overflow-y-auto relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 30%,rgba(124,58,237,.05) 0%,transparent 65%)",
      }} />

      {messages.length === 0 ? (
        <ChatEmptyState
          characterName={characterName}
          characterAvatarUrl={characterAvatarUrl ?? null}
          greeting={characterGreeting ?? null}
        />
      ) : (
        <div className="px-4 py-6 md:px-6 relative">
          <div className="max-w-4xl mx-auto">
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
