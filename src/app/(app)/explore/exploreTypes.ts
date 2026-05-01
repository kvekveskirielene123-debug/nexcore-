// UPDATED · GENDER_OPTIONS now matches the 7-preset list from character creation
// and the persona gender presets exactly.
//
// Drop-in replacement for src/lib/queries/exploreTypes.ts (or wherever
// your Explore filter options are defined — adjust path as needed).
//
// Previously this may have had generic options like "Male", "Female", "Other".
// Now it matches the exact strings stored in characters.gender_pronouns so
// the filter actually finds results.

export const GENDER_OPTIONS = [
  { value: "", label: "All genders" },
  { value: "Female · she/her", label: "Female · she/her" },
  { value: "Male · he/him", label: "Male · he/him" },
  { value: "Non-binary · they/them", label: "Non-binary · they/them" },
  { value: "Trans woman · she/her", label: "Trans woman · she/her" },
  { value: "Trans man · he/him", label: "Trans man · he/him" },
  { value: "Agender · they/them", label: "Agender · they/them" },
  { value: "Genderfluid · they/she/he", label: "Genderfluid · they/she/he" },
  // "Custom" entries typed by creators won't match the filter options above —
  // that's expected behavior. The dropdown covers the 7 standard presets.
] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number]["value"];

// ── Other filter types that likely live in this file ──────────
// (unchanged from your original — keeping them here for convenience)

export const SORT_OPTIONS = [
  { value: "recent", label: "Recently added" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const NSFW_OPTIONS = [
  { value: "sfw", label: "SFW only" },
  { value: "nsfw", label: "NSFW only" },
  { value: "all", label: "All" },
] as const;

export type NsfwOption = (typeof NSFW_OPTIONS)[number]["value"];

// Character tier filter
export const TIER_OPTIONS = [
  { value: "", label: "All tiers" },
  { value: "standard", label: "Standard" },
  { value: "brilliant", label: "◈ Brilliant" },
] as const;

export type TierOption = (typeof TIER_OPTIONS)[number]["value"];
