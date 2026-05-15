"use client";

interface ChatEmptyStateProps {
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string | null;
}

export function ChatEmptyState({ characterName, characterAvatarUrl, greeting }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        {/* Avatar with pulsing rings — animations in globals.css */}
        <div className="relative inline-block mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{ animation: "nx-empty-ring-1 3.2s ease-out infinite", border: "1.5px solid rgba(0,229,255,0.6)", opacity: 0.4 }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ animation: "nx-empty-ring-2 3.2s ease-out infinite", animationDelay: "1.6s", border: "1.5px solid rgba(0,229,255,0.6)", opacity: 0.3 }}
          />
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: "2px solid rgba(124,58,237,0.5)",
              boxShadow: "0 0 36px -8px rgba(0,229,255,0.4)",
              background: "#0d0824",
            }}
          >
            {characterAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={characterAvatarUrl} alt={characterName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-black text-[#00e5ff]" style={{ fontFamily: "var(--font-display)" }}>
                  {(characterName[0] ?? "?").toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="text-[9px] tracking-[3px] uppercase mb-2 text-cyan-400/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ◈ TRANSMISSION READY · 324B21
        </div>

        <h2
          className="text-[22px] font-black tracking-[3px] uppercase mb-3 text-white"
          style={{ fontFamily: "var(--font-display)", textShadow: "0 0 20px rgba(0,229,255,0.3)" }}
        >
          BEGIN WITH {characterName.toUpperCase()}
        </h2>

        {greeting && (
          <p
            className="text-[14px] italic leading-relaxed mb-4 text-[#b0a0d0]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            &ldquo;{greeting}&rdquo;
          </p>
        )}

        <p
          className="text-[12px] leading-relaxed text-[#7a6a9a] italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Send your first message to start the conversation.
        </p>
      </div>
    </div>
  );
}
