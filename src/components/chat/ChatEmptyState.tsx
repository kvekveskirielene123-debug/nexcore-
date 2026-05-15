"use client";

interface ChatEmptyStateProps {
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string | null;
}

export function ChatEmptyState({ characterName, characterAvatarUrl, greeting }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8 sm:py-16">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Avatar with pulse rings — keyframes in globals.css */}
        <div className="relative mb-5">
          <div
            className="absolute inset-0 rounded-full"
            style={{ animation: "nx-empty-ring-1 3.5s ease-out infinite", border: "1.5px solid rgba(124,58,237,0.5)" }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ animation: "nx-empty-ring-2 3.5s ease-out infinite", animationDelay: "1.75s", border: "1.5px solid rgba(124,58,237,0.35)" }}
          />
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden"
            style={{ boxShadow: "0 0 0 2px rgba(124,58,237,0.4), 0 8px 32px rgba(124,58,237,0.2)", background: "#1a1d28" }}
          >
            {characterAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={characterAvatarUrl} alt={characterName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-400">{(characterName[0] ?? "A").toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-white text-lg font-semibold mb-1">{characterName}</h2>

        {greeting ? (
          <p className="text-slate-400 text-sm leading-relaxed italic mb-5 px-2">
            &ldquo;{greeting}&rdquo;
          </p>
        ) : (
          <p className="text-slate-500 text-sm mb-5">Start a conversation</p>
        )}

        <p className="text-slate-600 text-xs">Type a message below to begin</p>
      </div>
    </div>
  );
}
