// UPDATED · Now accepts an active Persona and merges its block into the prompt.
//
// Drop-in replacement for the existing src/lib/ai/buildSystemPrompt.ts.
// The /api/chat/stream route should be updated to pass `activePersona`
// when calling this — see README for the patch.

import type { Persona } from "@/lib/personas/types";
import { buildPersonaBlock } from "@/lib/personas/buildPersonaBlock";

interface BuildPromptArgs {
  character: {
    name: string;
    subtitle?: string | null;
    description?: string | null;
    long_term_memory?: string | null;
    gender_pronouns: string;
    greeting?: string | null;
  };
  /** Legacy minimal user profile (still supported). When activePersona is
   *  provided, it takes precedence and userProfile is ignored. */
  userProfile?: {
    username?: string | null;
    facts_json?: Record<string, unknown> | null;
    tone_preference?: string | null;
  } | null;
  /** Active persona for the current conversation, if any. */
  activePersona?: Persona | null;
  /** Chat language preference (e.g. "en", "ka", "ru"). Default "en". */
  chatLanguage?: string;
  /** Italic stage directions preference. Default true. */
  italicsOn?: boolean;
}

export function buildSystemPrompt({
  character,
  userProfile,
  activePersona,
  chatLanguage = "en",
  italicsOn = true,
}: BuildPromptArgs): string {
  const sections: string[] = [];

  // Core identity
  sections.push(`You are ${character.name}.`);
  if (character.subtitle) sections.push(`${character.subtitle}`);
  sections.push(`Gender & pronouns: ${character.gender_pronouns}`);

  if (character.long_term_memory?.trim()) {
    sections.push(`\n## Character Memory\n${character.long_term_memory.trim()}`);
  }
  if (character.description?.trim()) {
    sections.push(`\n## About\n${character.description.trim()}`);
  }

  // Active persona takes precedence over the minimal userProfile fallback
  if (activePersona) {
    sections.push("\n" + buildPersonaBlock(activePersona));
  } else if (userProfile) {
    const bits: string[] = [];
    if (userProfile.username) bits.push(`They go by "${userProfile.username}".`);
    if (userProfile.tone_preference) {
      bits.push(`Preferred conversational tone: ${userProfile.tone_preference}.`);
    }
    if (userProfile.facts_json && Object.keys(userProfile.facts_json).length > 0) {
      const factsLines = Object.entries(userProfile.facts_json)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");
      bits.push(`Known facts about them:\n${factsLines}`);
    }
    if (bits.length > 0) {
      sections.push(`\n## Who you're talking to\n${bits.join("\n")}`);
    }
  }

  // Chat language directive (E1 preference, applied here)
  if (chatLanguage && chatLanguage !== "en") {
    const langNames: Record<string, string> = {
      ka: "Georgian (ქართული)",
      ru: "Russian",
      es: "Spanish",
      fr: "French",
      de: "German",
      pt: "Portuguese",
      it: "Italian",
      ja: "Japanese",
      zh: "Chinese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
      tr: "Turkish",
    };
    const lang = langNames[chatLanguage] ?? chatLanguage;
    sections.push(
      `\n## Language\nReply in ${lang}, not English, unless the user specifically writes to you in English.`
    );
  }

  // Italics preference (E1 preference, applied here)
  const italicsRule = italicsOn
    ? "Use *italic asterisks* for stage directions and physical actions when appropriate."
    : "Do NOT use *italic asterisks* for stage directions. Express actions through dialogue or plain prose only.";

  // Hard rules
  sections.push(
    `
## Rules
- Stay fully in character at all times.
- Reference past moments in the conversation naturally when relevant.
- Never break the fourth wall.
- Never mention you are an AI, a language model, or Anthropic.
- Match the tone, voice, and emotional depth described above.
- If the user asks something you don't know, improvise in character rather than refusing.
- ${italicsRule}
`.trim()
  );

  return sections.join("\n");
}
