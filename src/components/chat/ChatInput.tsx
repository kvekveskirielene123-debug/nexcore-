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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 8 * 22) + "px";
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

  const canSend = value.trim().length > 0 && !disabled && !sending;

  return (
    <div
      className="px-4 pt-3 flex-shrink-0"
      style={{
        background: "rgba(10,8,20,0.98)",
        borderTop: "1px solid rgba(124,58,237,0.12)",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
      />

      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: focused
              ? "1px solid rgba(124,58,237,0.4)"
              : "1px solid rgba(255,255,255,0.07)",
            boxShadow: focused
              ? "0 0 0 3px rgba(124,58,237,0.08), 0 4px 20px rgba(0,0,0,0.3)"
              : "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          {/* Image upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{ color: "rgba(148,163,184,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(192,132,252,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.4)")}
            aria-label="Upload image"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Message ${characterName}…`}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent focus:outline-none leading-relaxed py-2"
            style={{
              minHeight: 36,
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "rgba(226,217,243,0.9)",
              caretColor: "#c084fc",
            }}
          />

          {/* Voice input */}
          <VoiceInputButton
            onTranscript={(text) =>
              setValue((prev) => (prev ? prev + " " + text : text))
            }
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={
              canSend
                ? {
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "#fff",
                    boxShadow: "0 2px 16px rgba(124,58,237,0.5), 0 0 0 1px rgba(124,58,237,0.4)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.18)",
                    cursor: "not-allowed",
                  }
            }
          >
            {sending ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32 62" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p
          className="text-center text-[10px] mt-2"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
        >
          ⌘ Enter to send · {characterName} may produce inaccurate responses
        </p>
      </div>
    </div>
  );
}
