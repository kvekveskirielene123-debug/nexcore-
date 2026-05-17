"use client";

interface TypingIndicatorProps {
  characterName: string;
  avatarUrl?: string | null;
}

export function TypingIndicator({ characterName, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 px-4 sm:px-6 mb-4" style={{ animation: "nx-message-in 0.25s ease both" }}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
        style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.4), 0 0 10px rgba(124,58,237,0.15)" }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={characterName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b1d8a,#1d1535)" }}>
            <span className="text-[9px] font-black text-purple-300">{characterName[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Dots bubble */}
      <div
        className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-tl-sm"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 7, height: 7,
              background: "rgba(192,132,252,0.7)",
              animation: `nx-thinking-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>
        {characterName} is typing…
      </span>
    </div>
  );
}
