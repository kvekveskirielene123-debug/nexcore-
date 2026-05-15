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
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 8 * 24) + "px";
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div
      className="relative px-4 pb-4 pt-3"
      style={{ background: "rgba(5,2,13,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: focused
            ? "linear-gradient(to right, transparent, rgba(0,229,255,0.45), rgba(124,58,237,0.3), transparent)"
            : "linear-gradient(to right, transparent, rgba(124,58,237,0.2), transparent)",
          transition: "background 0.3s ease",
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Input row */}
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-300"
          style={{
            background: "#08041a",
            border: focused
              ? "1px solid rgba(0,229,255,0.3)"
              : "1px solid rgba(124,58,237,0.2)",
            boxShadow: focused
              ? "0 0 0 1px rgba(0,229,255,0.08), 0 0 24px rgba(0,229,255,0.06)"
              : "none",
          }}
        >
          <VoiceInputButton onTranscript={(text) => setValue(text)} />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Transmit to ${characterName}…`}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[#e2d9f3] placeholder-[#2d1f4a] focus:outline-none leading-relaxed py-1.5"
            style={{ fontFamily: "var(--font-body)", minHeight: 38 }}
          />

          <button
            onClick={handleSend}
            disabled={!hasContent || disabled || sending}
            aria-label="Send message"
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={
              hasContent && !disabled && !sending
                ? {
                    background: "#00e5ff",
                    color: "#000",
                    boxShadow: "0 0 20px rgba(0,229,255,0.4)",
                  }
                : {
                    background: "rgba(124,58,237,0.1)",
                    color: "rgba(124,58,237,0.4)",
                    cursor: "not-allowed",
                  }
            }
          >
            {sending ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30 60" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <p
            className="text-[8px] tracking-[2px] text-[#2d1f4a] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ⌘ Enter to transmit · 324B21
          </p>
        </div>
      </div>
    </div>
  );
}
