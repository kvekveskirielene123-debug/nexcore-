"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  characterName?: string;
  characterAvatar?: string;
}

export function MessageBubble({
  role,
  content,
  streaming = false,
  characterName,
  characterAvatar,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-purple-700/30 bg-[#150035] flex items-center justify-center">
          {characterAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={characterAvatar} alt={characterName} className="w-full h-full object-cover" />
          ) : (
            <span
              className="text-sm text-[#00e5ff] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {characterName?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative rounded-2xl px-4 py-3 overflow-hidden ${
            isUser
              ? "bg-cyan-400/10 border border-cyan-400/25 rounded-br-md"
              : "bg-purple-900/15 border border-purple-700/25 rounded-bl-md"
          }`}
        >
          {/* Streaming scan line on assistant bubbles */}
          {streaming && !isUser && (
            <div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-card-scan pointer-events-none"
            />
          )}

          <p
            className={`whitespace-pre-wrap leading-relaxed text-sm ${
              isUser ? "text-[#e2d9f3]" : "text-[#d0c4f0]"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {content}
            {streaming && (
              <span
                className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 align-middle animate-pulse"
                style={{ verticalAlign: "text-bottom" }}
              />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
