"use client";

// Thin client wrapper that injects chat theme CSS variables
// into the chat page as inline styles.
//
// Why client? Because we need `style` to be dynamic per-user pref,
// and CSS variables must be on a real DOM node. This wrapper adds
// zero visual structure — it's purely a styled div that fills the
// space its parent gives it.
//
// Usage in the chat page server component:
//   <ChatThemeWrapper themeKey={profile.chat_theme}>
//     ... all existing chat UI ...
//   </ChatThemeWrapper>

import { getChatThemeVars } from "@/lib/settings/chatTheme";
import type { ChatThemeKey } from "@/lib/settings/preferences";

interface ChatThemeWrapperProps {
  themeKey: ChatThemeKey;
  children: React.ReactNode;
}

export function ChatThemeWrapper({ themeKey, children }: ChatThemeWrapperProps) {
  const vars = getChatThemeVars(themeKey);

  return (
    <div
      className="contents"
      style={vars as React.CSSProperties}
    >
      {children}
    </div>
  );
}
