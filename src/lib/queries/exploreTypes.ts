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

export type SortOption =
  | "newest"
  | "popular"
  | "rating"
  | "alphabetical";

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

export const DISCOVERY_TAGS = ["wlw", "mlm", "dominant", "submissive", "switch", "sexual", "romantic", "other"] as const;

export const GENDER_OPTIONS = [
  "Female · she/her",
  "Male · he/him",
  "Non-binary · they/them",
  "Trans woman · she/her",
  "Trans man · he/him",
  "Agender · they/them",
  "Genderfluid · they/she/he",
];
