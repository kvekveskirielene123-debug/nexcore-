"use client";

// UPDATED · Now supports rendering a user avatar on user messages
// when an active persona is provided.
//
// Drop-in replacement for src/components/chat/MessageBubble.tsx.

interface UserAvatar {
  url: string | null;
  name: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  /** Streaming indicator on AI bubble. */
  streaming?: boolean;
  /** Character info for AI message bubbles. */
  characterAvatarUrl?: string | null;
  characterName?: string;
  /** Persona info for user message bubbles (optional). */
  userAvatar?: UserAvatar | null;
}

export function MessageBubble({
  role,
  content,
  streaming = false,
  characterAvatarUrl,
  characterName,
  userAvatar,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          userAvatar ? (
            <UserAvatarTile avatar={userAvatar} />
          ) : (
            <DefaultUserTile />
          )
        ) : (
          <CharacterAvatarTile
            url={characterAvatarUrl ?? null}
            name={characterName ?? "?"}
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] sm:max-w-[70%] px-4 py-3 rounded-2xl border relative ${
          isUser
            ? "bg-cyan-400/8 border-cyan-400/25 rounded-tr-sm"
            : "bg-purple-900/20 border-purple-700/30 rounded-tl-sm"
        }`}
      >
        {/* Scan-line during streaming */}
        {streaming && !isUser && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.1) 50%, transparent 100%)",
              backgroundSize: "100% 30px",
              animation: "scanline 2.4s linear infinite",
            }}
          >
            <style jsx>{`
              @keyframes scanline {
                0% { background-position: 0 0; }
                100% { background-position: 0 100%; }
              }
            `}</style>
          </div>
        )}
        <p
          className={`text-[14px] leading-[1.6] whitespace-pre-wrap break-words relative z-10 ${
            isUser ? "text-cyan-100" : "text-[#e2d9f3]"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {content}
          {streaming && !isUser && (
            <span
              className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle"
              aria-hidden
            />
          )}
        </p>
      </div>
    </div>
  );
}

// ── Avatar tiles ──────────────────────────────────────

function UserAvatarTile({ avatar }: { avatar: UserAvatar }) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0"
      style={{ background: "rgba(10,4,24,0.6)" }}
      title={avatar.name}
    >
      {avatar.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar.url}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-cyan-400 font-bold text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {(avatar.name[0] ?? "?").toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function DefaultUserTile() {
  return (
    <div
      className="w-9 h-9 rounded-full border border-cyan-400/30 flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(0,229,255,0.05)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function CharacterAvatarTile({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden border border-purple-700/40 flex-shrink-0"
      style={{ background: "rgba(10,4,24,0.6)" }}
      title={name}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-[#a78bfa] font-bold text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {(name[0] ?? "?").toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
