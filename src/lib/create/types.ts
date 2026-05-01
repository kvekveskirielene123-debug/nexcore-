// Shared types across the Create wizard steps.

export const GENDER_PRESETS = [
  "Female · she/her",
  "Male · he/him",
  "Non-binary · they/them",
  "Trans woman · she/her",
  "Trans man · he/him",
  "Agender · they/them",
  "Genderfluid · they/she/he",
] as const;

export type Visibility = "public" | "private";

export interface CharacterDraft {
  name: string;
  subtitle: string;
  description: string;
  greeting: string;
  long_term_memory: string;
  gender_pronouns: string;       // either a preset or a custom string
  avatar_url: string | null;     // Supabase public URL, set after upload
  visibility: Visibility;
  is_nsfw: boolean;
}

export const EMPTY_DRAFT: CharacterDraft = {
  name: "",
  subtitle: "",
  description: "",
  greeting: "",
  long_term_memory: "",
  gender_pronouns: "",
  avatar_url: null,
  visibility: "public",
  is_nsfw: false,
};

export const STEPS = [
  { id: 1, label: "IDENTITY" },
  { id: 2, label: "PERSONALITY" },
  { id: 3, label: "MEMORY" },
  { id: 4, label: "SETTINGS" },
  { id: 5, label: "REVIEW" },
] as const;

export type StepId = typeof STEPS[number]["id"];

export interface StepProps {
  draft: CharacterDraft;
  setDraft: (d: CharacterDraft) => void;
  goNext: () => void;
  goBack: () => void;
}
