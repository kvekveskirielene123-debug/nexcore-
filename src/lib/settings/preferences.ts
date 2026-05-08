// Central definition of all user preferences.
// Single source of truth — used by API, Settings UI, and (later) chat rendering.

export type DefaultModel = "haiku" | "sonnet" | "opus";
export type ChatFontSize = "small" | "medium" | "large";
export type ChatThemeKey = "midnight" | "bloodline" | "dawn" | "helix" | "void";

export interface UserPreferences {
  show_nsfw: boolean;
  show_creator_badge: boolean;
  default_model: DefaultModel;
  chat_language: string;       // ISO 639-1 (e.g. "en", "ka", "ru")
  pref_italics_on: boolean;
  pref_gray_text_on: boolean;
  chat_font_size: ChatFontSize;
  chat_theme: ChatThemeKey;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  show_nsfw: false,
  show_creator_badge: false,
  default_model: "haiku",
  chat_language: "en",
  pref_italics_on: true,
  pref_gray_text_on: true,
  chat_font_size: "medium",
  chat_theme: "midnight",
};

// ── Languages users can pick ──────────────────────────────
// Note: these don't translate the UI. They tell the AI to respond
// to the user in the chosen language. UI translation = much later.
export const CHAT_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ka", label: "ქართული · Georgian" },
  { code: "ru", label: "Русский · Russian" },
  { code: "es", label: "Español · Spanish" },
  { code: "fr", label: "Français · French" },
  { code: "de", label: "Deutsch · German" },
  { code: "pt", label: "Português · Portuguese" },
  { code: "it", label: "Italiano · Italian" },
  { code: "ja", label: "日本語 · Japanese" },
  { code: "zh", label: "中文 · Chinese" },
  { code: "ko", label: "한국어 · Korean" },
  { code: "ar", label: "العربية · Arabic" },
  { code: "hi", label: "हिन्दी · Hindi" },
  { code: "tr", label: "Türkçe · Turkish" },
];

// ── Chat themes ───────────────────────────────────────────
// Each theme defines a small palette. The chat page reads these
// CSS variables when rendering bubbles, input, headers, etc.
// (Hookup happens in package E4 — the UI is functional now,
// the visual difference applies once chat reads these vars.)
export interface ChatTheme {
  key: ChatThemeKey;
  label: string;
  description: string;
  preview: {
    bg: string;
    userBubble: string;
    userBorder: string;
    aiBubble: string;
    aiBorder: string;
    text: string;
    accent: string;
  };
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    key: "midnight",
    label: "MIDNIGHT",
    description: "Deep purple · cyan accents · the Nexcor original.",
    preview: {
      bg: "#05020d",
      userBubble: "rgba(0,229,255,0.10)",
      userBorder: "rgba(0,229,255,0.25)",
      aiBubble: "rgba(124,58,237,0.15)",
      aiBorder: "rgba(124,58,237,0.25)",
      text: "#d0c4f0",
      accent: "#00e5ff",
    },
  },
  {
    key: "bloodline",
    label: "BLOODLINE",
    description: "Crimson protocol · for those who hunt their truth.",
    preview: {
      bg: "#0c0205",
      userBubble: "rgba(239,68,68,0.10)",
      userBorder: "rgba(239,68,68,0.30)",
      aiBubble: "rgba(127,29,29,0.25)",
      aiBorder: "rgba(127,29,29,0.40)",
      text: "#f0d4d4",
      accent: "#ef4444",
    },
  },
  {
    key: "dawn",
    label: "DAWN",
    description: "Soft warm tones · easier on tired eyes at sunrise.",
    preview: {
      bg: "#1a1015",
      userBubble: "rgba(251,146,60,0.12)",
      userBorder: "rgba(251,146,60,0.35)",
      aiBubble: "rgba(244,114,182,0.10)",
      aiBorder: "rgba(244,114,182,0.30)",
      text: "#f5e6d8",
      accent: "#fb923c",
    },
  },
  {
    key: "helix",
    label: "HELIX",
    description: "Cyan-saturated · maximum Neolution signal.",
    preview: {
      bg: "#020e1a",
      userBubble: "rgba(0,229,255,0.18)",
      userBorder: "rgba(0,229,255,0.45)",
      aiBubble: "rgba(34,211,238,0.10)",
      aiBorder: "rgba(34,211,238,0.30)",
      text: "#cce8f5",
      accent: "#22d3ee",
    },
  },
  {
    key: "void",
    label: "VOID",
    description: "Pure black · blood-red accents · for the brave.",
    preview: {
      bg: "#000000",
      userBubble: "rgba(220,38,38,0.10)",
      userBorder: "rgba(220,38,38,0.40)",
      aiBubble: "rgba(64,64,64,0.40)",
      aiBorder: "rgba(127,29,29,0.40)",
      text: "#e5e5e5",
      accent: "#dc2626",
    },
  },
];

// ── Helpers ───────────────────────────────────────────────
export function getThemeByKey(key: ChatThemeKey): ChatTheme {
  return CHAT_THEMES.find((t) => t.key === key) ?? CHAT_THEMES[0];
}

export function getLanguageLabel(code: string): string {
  return CHAT_LANGUAGES.find((l) => l.code === code)?.label ?? "English";
}
