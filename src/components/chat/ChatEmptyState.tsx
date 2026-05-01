"use client";

// PREMIUM (Phase 1) · Beautiful empty state for chats with zero messages.
// Replaces the awkward whitespace that used to appear before the first message.

interface ChatEmptyStateProps {
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string | null;
}

export function ChatEmptyState({
  characterName,
  characterAvatarUrl,
  greeting,
}: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 nx-page-in">
      <div className="max-w-md text-center">
        {/* Avatar with pulsing rings */}
        <div className="relative inline-block mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              animation: "nx-empty-ring-1 3.2s ease-out infinite",
              border: "1.5px solid var(--chat-accent)",
              opacity: 0.4,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              animation: "nx-empty-ring-2 3.2s ease-out infinite",
              animationDelay: "1.6s",
              border: "1.5px solid var(--chat-accent)",
              opacity: 0.3,
            }}
          />
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: "2px solid var(--chat-ai-border)",
              boxShadow: "0 0 36px -8px var(--chat-accent-glow, rgba(0,229,255,0.4))",
              background: "var(--chat-surface)",
            }}
          >
            {characterAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={characterAvatarUrl}
                alt={characterName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-3xl font-black"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--chat-accent)",
                  }}
                >
                  {(characterName[0] ?? "?").toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Designation tag */}
        <div
          className="text-[9px] tracking-[3px] uppercase mb-2"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--chat-accent)",
            opacity: 0.7,
          }}
        >
          ◈ TRANSMISSION READY · 324B21
        </div>

        {/* Heading */}
        <h2
          className="text-[24px] font-black tracking-[3px] uppercase mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--chat-text)",
            textShadow: "0 0 20px var(--chat-accent-glow, rgba(0,229,255,0.3))",
          }}
        >
          BEGIN WITH {characterName.toUpperCase()}
        </h2>

        {/* Greeting preview if available */}
        {greeting && (
          <p
            className="text-[14px] italic leading-relaxed mb-4"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--chat-text-muted)",
            }}
          >
            &ldquo;{greeting}&rdquo;
          </p>
        )}

        <p
          className="text-[12px] italic leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--chat-text-muted)",
            opacity: 0.7,
          }}
        >
          Send your first message to start the conversation.
        </p>
      </div>

      <style jsx>{`
        @keyframes nx-empty-ring-1 {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes nx-empty-ring-2 {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="nx-empty-ring"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
