"use client";

interface UserAvatar {
  url: string | null;
  name: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  characterAvatarUrl?: string | null;
  characterName?: string;
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
    <div
      className={`flex gap-3 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animation: "chatMsgIn 0.22s ease-out both" }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          userAvatar ? (
            <UserAvatarTile avatar={userAvatar} />
          ) : (
            <DefaultUserTile />
          )
        ) : (
          <CharacterAvatarTile url={characterAvatarUrl ?? null} name={characterName ?? "?"} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] sm:max-w-[72%] relative ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender label */}
        <div
          className={`text-[9px] tracking-[1.5px] uppercase mb-1.5 ${isUser ? "text-right text-cyan-400/40 pr-1" : "text-left text-purple-400/40 pl-1"}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {isUser ? "YOU" : (characterName ?? "SUBJECT")}
        </div>

        <div
          className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
            isUser
              ? "rounded-tr-sm border border-cyan-500/20 bg-[#071520]"
              : "rounded-tl-sm border border-purple-600/25 bg-[#0d0824]"
          }`}
          style={
            isUser
              ? { boxShadow: "inset 0 0 20px rgba(0,229,255,0.03), 0 2px 16px rgba(0,0,0,0.4)" }
              : { boxShadow: "inset 0 0 20px rgba(124,58,237,0.04), 0 2px 16px rgba(0,0,0,0.4)" }
          }
        >
          {/* Top accent line */}
          <div
            className={`absolute top-0 ${isUser ? "right-0 w-1/2" : "left-0 w-1/2"} h-px`}
            style={{
              background: isUser
                ? "linear-gradient(to left, rgba(0,229,255,0.35), transparent)"
                : "linear-gradient(to right, rgba(124,58,237,0.4), transparent)",
            }}
          />

          {/* Streaming scanline — uses chatScanline keyframe from globals.css */}
          {streaming && !isUser && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.07) 50%, transparent 100%)",
                backgroundSize: "100% 60px",
                animation: "chatScanline 2.6s linear infinite",
              }}
            />
          )}

          <p
            className={`text-[14px] leading-[1.65] whitespace-pre-wrap break-words relative z-10 ${
              isUser ? "text-cyan-50/90" : "text-[#e2d9f3]"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {content}
            {streaming && !isUser && (
              <span
                className="inline-block w-[2px] h-[15px] ml-1 bg-cyan-400 align-middle"
                style={{ animation: "chatCursorBlink 0.8s step-end infinite" }}
                aria-hidden
              />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Avatar tiles ──────────────────────────────────────

function UserAvatarTile({ avatar }: { avatar: UserAvatar }) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden border border-cyan-400/35 flex-shrink-0"
      style={{ background: "rgba(7,21,32,0.9)" }}
      title={avatar.name}
    >
      {avatar.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
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
      className="w-9 h-9 rounded-full border border-cyan-400/25 flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(0,229,255,0.04)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function CharacterAvatarTile({ url, name }: { url: string | null; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
      style={{
        border: "1.5px solid rgba(124,58,237,0.45)",
        boxShadow: "0 0 10px rgba(124,58,237,0.2)",
        background: "#0d0824",
      }}
      title={name}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[#a78bfa] font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
            {(name[0] ?? "?").toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
