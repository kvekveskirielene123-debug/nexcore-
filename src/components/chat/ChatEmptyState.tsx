"use client";

interface ChatEmptyStateProps {
  characterName: string;
  characterAvatarUrl: string | null;
  greeting: string | null;
}

export function ChatEmptyState({ characterName, characterAvatarUrl, greeting }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-10">
      <div className="flex flex-col items-center text-center w-full max-w-md">

        {/* Avatar with layered glow rings */}
        <div className="relative mb-6">
          <div
            className="absolute inset-[-8px] rounded-full"
            style={{ border: "1.5px solid rgba(124,58,237,0.3)", animation: "nx-empty-ring-1 3.5s ease-out infinite" }}
          />
          <div
            className="absolute inset-[-4px] rounded-full"
            style={{ border: "1px solid rgba(0,229,255,0.15)", animation: "nx-empty-ring-2 3.5s ease-out infinite", animationDelay: "1.75s" }}
          />
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden"
            style={{
              boxShadow: "0 0 0 2.5px rgba(124,58,237,0.55), 0 0 30px rgba(124,58,237,0.2), 0 12px 40px rgba(0,0,0,0.5)",
              background: "linear-gradient(135deg, #1d1535, #0f0d1a)",
            }}
          >
            {characterAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={characterAvatarUrl} alt={characterName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-4xl font-black"
                  style={{ fontFamily: "var(--font-display)", color: "#c084fc", textShadow: "0 0 20px rgba(192,132,252,0.5)" }}
                >
                  {(characterName[0] ?? "A").toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <h2
          className="text-[22px] font-black mb-0.5"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
        >
          {characterName}
        </h2>
        <div
          className="text-[9px] tracking-[3px] uppercase mb-5"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
        >
          ◈ AI Character
        </div>

        {greeting ? (
          <div
            className="relative w-full rounded-2xl px-5 pt-3 pb-4 mb-6 text-left"
            style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
          >
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.45), transparent)" }} />
            <div className="text-[36px] leading-none -ml-1 mb-1" style={{ fontFamily: "Georgia, serif", color: "rgba(124,58,237,0.28)" }}>&ldquo;</div>
            <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.65)", fontStyle: "italic" }}>
              {greeting}
            </p>
            <div className="text-[36px] leading-none text-right -mb-4 -mr-1" style={{ fontFamily: "Georgia, serif", color: "rgba(124,58,237,0.28)" }}>&rdquo;</div>
          </div>
        ) : (
          <div
            className="w-full rounded-2xl px-5 py-4 mb-6"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm text-slate-500" style={{ fontFamily: "var(--font-body)" }}>Start a conversation below</p>
          </div>
        )}

        <p className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}>
          ⟡ Type a message to begin
        </p>
      </div>
    </div>
  );
}
