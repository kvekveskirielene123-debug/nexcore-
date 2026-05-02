// Assembles the Anthropic system prompt from character data + user context

interface BuildPromptArgs {
  character: {
    name: string;
    subtitle?: string | null;
    description?: string | null;
    long_term_memory?: string | null;
    gender_pronouns: string;
    greeting?: string | null;
  };
  userProfile: {
    username?: string | null;
    facts_json?: Record<string, unknown> | null;
    tone_preference?: string | null;
  } | null;
}

export function buildSystemPrompt({ character, userProfile }: BuildPromptArgs): string {
  const sections: string[] = [];

  // Core identity
  sections.push(`You are ${character.name}.`);
  if (character.subtitle) sections.push(`${character.subtitle}`);
  sections.push(`Gender & pronouns: ${character.gender_pronouns}`);

  // Long-term memory — the heart of the character
  if (character.long_term_memory?.trim()) {
    sections.push(`\n## Character Memory\n${character.long_term_memory.trim()}`);
  }

  if (character.description?.trim()) {
    sections.push(`\n## About\n${character.description.trim()}`);
  }

  // User context (for personalization — from profile facts_json)
  if (userProfile) {
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

  // Hard rules
  sections.push(`
## Rules
- Stay fully in character at all times.
- Reference past moments in the conversation naturally when relevant.
- Never break the fourth wall.
- Never mention you are an AI, a language model, or Anthropic.
- Match the tone, voice, and emotional depth described above.
- If the user asks something you don't know, improvise in character rather than refusing.
`.trim());

  return sections.join("\n");
}
