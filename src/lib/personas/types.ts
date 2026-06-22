// Shared persona types + preset values.

export const PERSONA_TONES = [
  { value: "casual", label: "CASUAL", desc: "Relaxed, friendly, everyday warmth." },
  { value: "formal", label: "FORMAL", desc: "Polite, structured, professional." },
  { value: "playful", label: "PLAYFUL", desc: "Lighthearted, mischievous, fun." },
  { value: "gentle", label: "GENTLE", desc: "Soft, soothing, careful with feelings." },
  { value: "serious", label: "SERIOUS", desc: "Direct, thoughtful, no sugar-coating." },
  { value: "flirty", label: "FLIRTY", desc: "Charming, teasing, romantic energy." },
] as const;

export type PersonaTone = (typeof PERSONA_TONES)[number]["value"];

// Reuse the same gender presets from character creation.
export const PERSONA_GENDER_PRESETS = [
  "Female · she/her",
  "Male · he/him",
  "Non-binary · they/them",
  "Trans woman · she/her",
  "Trans man · he/him",
  "Agender · they/them",
  "Genderfluid · they/she/he",
] as const;

// Preset tags users can pick from. They can also type custom tags.
export const PRESET_TAGS = [
  "art", "music", "writing", "reading", "gaming", "movies", "anime",
  "cooking", "baking", "hiking", "gym", "yoga", "meditation",
  "philosophy", "science", "history", "languages", "travel",
  "photography", "fashion", "design", "coding", "tech",
  "cats", "dogs", "plants", "gardening",
  "dancing", "singing", "guitar", "piano",
  "horror", "sci-fi", "fantasy", "romance", "poetry",
  "introvert", "extrovert", "night owl", "morning person",
  "spiritual", "atheist", "queer", "LGBTQ+",
];

export const MAX_TAGS = 10;
export const MAX_BIO_LEN = 2000;
export const MAX_HOBBIES_LEN = 500;
export const MAX_NAME_LEN = 40;
export const MIN_AGE = 18;
export const MAX_AGE = 120;

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  tone: PersonaTone;
  tags: string[];
  hobbies_text: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonaDraft {
  name: string;
  age: number | null;
  gender: string;
  bio: string;
  tone: PersonaTone;
  tags: string[];
  hobbies_text: string;
  avatar_url: string | null;
}

export const EMPTY_PERSONA_DRAFT: PersonaDraft = {
  name: "",
  age: null,
  gender: "",
  bio: "",
  tone: "casual",
  tags: [],
  hobbies_text: "",
  avatar_url: null,
};

// Validate a draft. Returns { ok: true } or { ok: false, error: '...' }
export function validatePersonaDraft(d: PersonaDraft):
  | { ok: true }
  | { ok: false; error: string } {
  const name = (d.name ?? "").trim();
  if (name.length < 1) return { ok: false, error: "Name is required." };
  if (name.length > MAX_NAME_LEN) return { ok: false, error: "Name is too long." };

  if (d.age === null || d.age === undefined || !Number.isInteger(d.age))
    return { ok: false, error: "Age is required." };
  if (d.age < MIN_AGE) return { ok: false, error: "You must be 18 or older." };
  if (d.age > MAX_AGE) return { ok: false, error: "Age must be 120 or less." };

  if (!(d.gender ?? "").trim())
    return { ok: false, error: "Gender · pronouns required." };
  if ((d.gender ?? "").length > 60)
    return { ok: false, error: "Gender · pronouns too long." };

  if (d.bio.length > MAX_BIO_LEN)
    return { ok: false, error: `Bio is too long (max ${MAX_BIO_LEN}).` };
  if (d.hobbies_text.length > MAX_HOBBIES_LEN)
    return { ok: false, error: `Hobbies field too long (max ${MAX_HOBBIES_LEN}).` };
  if (d.tags.length > MAX_TAGS)
    return { ok: false, error: `Max ${MAX_TAGS} tags.` };

  for (const tag of d.tags) {
    if (typeof tag !== "string" || tag.trim().length === 0)
      return { ok: false, error: "Empty tag detected." };
    if (tag.length > 30) return { ok: false, error: "Tag is too long (max 30 chars)." };
  }

  const validTones = PERSONA_TONES.map((t) => t.value);
  if (!validTones.includes(d.tone))
    return { ok: false, error: "Invalid tone." };

  return { ok: true };
}
