"use client";

import { useEffect, useRef, useState } from "react";
import { VoiceInputButton } from "./VoiceInputButton";

interface ChatInputProps {
  characterName: string;
  onSend: (message: string) => void;
  disabled?: boolean;
  sending?: boolean;
}

export function ChatInput({ characterName, onSend, disabled, sending }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 8 * 24; // ~8 lines
    ta.style.height = Math.min(ta.scrollHeight, max) + "px";
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  // Cmd/Ctrl+Enter shortcut to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
    // plain Enter = newline (default textarea behavior)
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className="p-4 border-t border-purple-700/15 bg-[#05020d]/95 backdrop-blur-md">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <VoiceInputButton onTranscript={(text) => setValue(text)} />

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Speak with ${characterName}...`}
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-[#08041a] border border-purple-700/25 rounded-2xl px-4 py-3 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 focus:shadow-[0_0_0_1px_rgba(0,229,255,0.15)] transition-all leading-relaxed"
            style={{ fontFamily: "var(--font-body)", minHeight: 44 }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!hasContent || disabled || sending}
          aria-label="Send message"
          className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-all ${
            hasContent && !disabled
              ? "bg-[#00e5ff] text-black shadow-[0_0_24px_rgba(0,229,255,0.4)] hover:shadow-[0_0_36px_rgba(0,229,255,0.6)]"
              : "bg-purple-900/30 text-[#7a6a9a] cursor-not-allowed"
          }`}
        >
          {sending ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="30 60" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <p
        className="text-[8px] tracking-[2px] text-[#3a2a5a] text-center mt-2 uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ⌘ + Enter sends · 324B21
      </p>
    </div>
  );
}
