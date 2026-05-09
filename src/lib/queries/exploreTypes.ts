// Shared types for the Explore page

export type Character = {
  id: string;
  name: string;
  subtitle: string | null;
  avatar_url: string;
  gender_pronouns: string;
  visibility: "public" | "private";
  is_platform: boolean;
  is_featured: boolean;
  is_nsfw: boolean;
  tier: "standard" | "brilliant";
  chat_count: number;
  created_at: string;
  created_by: string;
  tags: string[] | null;
};

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  marks: number | null;
};

export type SortOption = "newest" | "popular" | "alphabetical";

export type ExploreFilters = {
  search: string;
  genders: string[];
  showNsfw: boolean;
  creator: "all" | "platform" | "community";
  minRating: number;
  sort: SortOption;
  tags: string[];
};

export const DEFAULT_FILTERS: ExploreFilters = {
  search: "",
  genders: [],
  showNsfw: false,
  creator: "all",
  minRating: 0,
  sort: "newest",
  tags: [],
};

// ── Tag taxonomy ─────────────────────────────────────────────────────────────

export const TAG_GROUPS: Record<string, string[]> = {
  "VIBE":         ["wholesome", "dark", "mystery", "comedy", "horror", "thriller", "adventure", "drama"],
  "DYNAMIC":      ["dominant", "submissive", "switch", "protective", "tsundere", "yandere", "kuudere", "rivals"],
  "RELATIONSHIP": ["romantic", "platonic", "friends-to-lovers", "enemies", "mentor", "forbidden"],
  "GENRE":        ["fantasy", "sci-fi", "historical", "modern", "supernatural", "isekai", "dystopia", "slice-of-life"],
  "COMMUNITY":    ["wlw", "mlm", "non-binary", "queer", "polyamory"],
  "CONTENT":      ["sexual", "non-sexual", "slow-burn", "action"],
};

export const DISCOVERY_TAGS: string[] = Object.values(TAG_GROUPS).flat();

export const GENDER_OPTIONS = [
  "Female · she/her",
  "Male · he/him",
  "Non-binary · they/them",
  "Trans woman · she/her",
  "Trans man · he/him",
  "Agender · they/them",
  "Genderfluid · they/she/he",
];
