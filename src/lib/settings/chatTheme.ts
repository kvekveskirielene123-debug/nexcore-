// Chat theme CSS variable definitions.
// These are injected as inline style vars on the chat page wrapper.
// MessageBubble + ChatInput read them via var(--chat-*) in their styles.
//
// Design tokens used in chat:
//   --chat-bg            page / outermost background
//   --chat-surface       message list surface
//   --chat-user-bubble   user message bubble fill
//   --chat-user-border   user message bubble border
//   --chat-ai-bubble     AI message bubble fill
//   --chat-ai-border     AI message bubble border
//   --chat-text          primary message text color
//   --chat-text-muted    secondary / action text (italic narration)
//   --chat-accent        primary accent (glow, highlights, send button)
//   --chat-accent-glow   box-shadow color for accented elements
//   --chat-input-bg      message input background
//   --chat-input-border  message input border
//   --chat-scrollbar     scrollbar thumb color

import type { ChatThemeKey } from "./preferences";

export interface ChatThemeVars {
  "--chat-bg": string;
  "--chat-surface": string;
  "--chat-user-bubble": string;
  "--chat-user-border": string;
  "--chat-ai-bubble": string;
  "--chat-ai-border": string;
  "--chat-text": string;
  "--chat-text-muted": string;
  "--chat-accent": string;
  "--chat-accent-glow": string;
  "--chat-input-bg": string;
  "--chat-input-border": string;
  "--chat-scrollbar": string;
}

export const CHAT_THEME_VARS: Record<ChatThemeKey, ChatThemeVars> = {
  midnight: {
    "--chat-bg": "#05020d",
    "--chat-surface": "#08041a",
    "--chat-user-bubble": "rgba(0,229,255,0.08)",
    "--chat-user-border": "rgba(0,229,255,0.22)",
    "--chat-ai-bubble": "rgba(124,58,237,0.12)",
    "--chat-ai-border": "rgba(124,58,237,0.25)",
    "--chat-text": "#d0c4f0",
    "--chat-text-muted": "rgba(167,139,250,0.55)",
    "--chat-accent": "#00e5ff",
    "--chat-accent-glow": "rgba(0,229,255,0.35)",
    "--chat-input-bg": "#0c0520",
    "--chat-input-border": "rgba(124,58,237,0.25)",
    "--chat-scrollbar": "rgba(124,58,237,0.3)",
  },
  bloodline: {
    "--chat-bg": "#0c0205",
    "--chat-surface": "#130208",
    "--chat-user-bubble": "rgba(239,68,68,0.08)",
    "--chat-user-border": "rgba(239,68,68,0.28)",
    "--chat-ai-bubble": "rgba(127,29,29,0.18)",
    "--chat-ai-border": "rgba(185,28,28,0.30)",
    "--chat-text": "#f0d8d8",
    "--chat-text-muted": "rgba(252,165,165,0.50)",
    "--chat-accent": "#ef4444",
    "--chat-accent-glow": "rgba(239,68,68,0.40)",
    "--chat-input-bg": "#160309",
    "--chat-input-border": "rgba(185,28,28,0.30)",
    "--chat-scrollbar": "rgba(185,28,28,0.35)",
  },
  dawn: {
    "--chat-bg": "#1a1015",
    "--chat-surface": "#211318",
    "--chat-user-bubble": "rgba(251,146,60,0.10)",
    "--chat-user-border": "rgba(251,146,60,0.32)",
    "--chat-ai-bubble": "rgba(244,114,182,0.08)",
    "--chat-ai-border": "rgba(244,114,182,0.28)",
    "--chat-text": "#f5e8dc",
    "--chat-text-muted": "rgba(253,186,116,0.55)",
    "--chat-accent": "#fb923c",
    "--chat-accent-glow": "rgba(251,146,60,0.38)",
    "--chat-input-bg": "#1e1115",
    "--chat-input-border": "rgba(251,146,60,0.25)",
    "--chat-scrollbar": "rgba(251,146,60,0.30)",
  },
  helix: {
    "--chat-bg": "#020e1a",
    "--chat-surface": "#041525",
    "--chat-user-bubble": "rgba(0,229,255,0.14)",
    "--chat-user-border": "rgba(0,229,255,0.42)",
    "--chat-ai-bubble": "rgba(34,211,238,0.08)",
    "--chat-ai-border": "rgba(34,211,238,0.28)",
    "--chat-text": "#cce8f5",
    "--chat-text-muted": "rgba(103,232,249,0.55)",
    "--chat-accent": "#22d3ee",
    "--chat-accent-glow": "rgba(34,211,238,0.45)",
    "--chat-input-bg": "#031220",
    "--chat-input-border": "rgba(34,211,238,0.28)",
    "--chat-scrollbar": "rgba(34,211,238,0.32)",
  },
  void: {
    "--chat-bg": "#000000",
    "--chat-surface": "#0a0a0a",
    "--chat-user-bubble": "rgba(220,38,38,0.08)",
    "--chat-user-border": "rgba(220,38,38,0.38)",
    "--chat-ai-bubble": "rgba(30,30,30,0.80)",
    "--chat-ai-border": "rgba(64,64,64,0.50)",
    "--chat-text": "#e8e8e8",
    "--chat-text-muted": "rgba(220,38,38,0.55)",
    "--chat-accent": "#dc2626",
    "--chat-accent-glow": "rgba(220,38,38,0.45)",
    "--chat-input-bg": "#0f0f0f",
    "--chat-input-border": "rgba(64,64,64,0.45)",
    "--chat-scrollbar": "rgba(220,38,38,0.30)",
  },
};

export function getChatThemeVars(key: ChatThemeKey): ChatThemeVars {
  return CHAT_THEME_VARS[key] ?? CHAT_THEME_VARS.midnight;
}
