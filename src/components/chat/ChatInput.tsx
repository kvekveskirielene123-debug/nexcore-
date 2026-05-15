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
      className="px-4 pt-3"
      style={{
        background: "#0d0f14",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
      />

      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{ background: "#1a1d28", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition disabled:opacity-40"
            aria-label="Upload image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            placeholder={`Type a message`}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-white placeholder-slate-600 focus:outline-none leading-relaxed py-2"
            style={{ minHeight: 36, fontFamily: "var(--font-body)", fontSize: "16px" }}
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
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all"
            style={
              canSend
                ? { background: "#7c3aed", color: "#fff", boxShadow: "0 2px 12px rgba(124,58,237,0.4)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }
            }
          >
            {sending ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32 62" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-2">
          ⌘ Enter to send · {characterName} may produce inaccurate responses
        </p>
      </div>
    </div>
  );
}
