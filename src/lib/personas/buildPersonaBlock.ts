// Server-only helper: turns a Persona row into a "Who you're talking to" block
// that gets injected into the AI's system prompt.
//
// Used by /api/chat/stream/route.ts. Replaces the simpler logic that was
// previously in buildSystemPrompt.

import type { Persona } from "./types";

export function buildPersonaBlock(persona: Persona | null): string {
  if (!persona) return "";

  const lines: string[] = [];
  lines.push(`## Who you're talking to`);
  lines.push(`Their name is ${persona.name}.`);
  lines.push(`Age: ${persona.age}.`);
  lines.push(`Gender & pronouns: ${persona.gender}.`);

  if (persona.bio?.trim()) {
    lines.push(`\nAbout them:\n${persona.bio.trim()}`);
  }

  if (persona.hobbies_text?.trim()) {
    lines.push(`\nInterests & hobbies:\n${persona.hobbies_text.trim()}`);
  }

  if (persona.tags && persona.tags.length > 0) {
    lines.push(`\nThings they identify with: ${persona.tags.join(", ")}.`);
  }

  // Tone preference becomes a soft directive
  const toneDirectives: Record<string, string> = {
    casual: "Match a relaxed, conversational tone.",
    formal: "Match a polite, professional, structured tone.",
    playful: "Be lighthearted and playful with them.",
    gentle: "Be soft, careful, and emotionally attentive.",
    serious: "Speak directly and thoughtfully without small talk.",
    flirty: "Allow charm and gentle flirtation when appropriate.",
  };
  if (toneDirectives[persona.tone]) {
    lines.push(`\nPreferred conversational tone: ${toneDirectives[persona.tone]}`);
  }

  lines.push(
    `\nWhen relevant, reference what you know about them naturally — but don't recite their profile back at them.`
  );

  return lines.join("\n");
}
