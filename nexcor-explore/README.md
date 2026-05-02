# Nexcor Explore Page — File Package

## What's in here

All files for the `/explore` page — Netflix-style character discovery with search, filters, sort, and 4 auto-hiding rails.

```
src/
├── app/(app)/explore/
│   ├── page.tsx                 ← Server Component (fetches initial data)
│   └── ExploreClient.tsx        ← Client Component (state, search, filters)
│
├── components/explore/
│   ├── SearchBar.tsx            ← Debounced search input, Neolution style
│   ├── FilterPanel.tsx          ← Filter drawer + SortDropdown (same file)
│   ├── FilterPills.tsx          ← Active filter badges, removable
│   ├── CharacterRail.tsx        ← Horizontal scrolling rail with nav buttons
│   ├── CompactCharacterCard.tsx ← Small card (for rails + grid)
│   ├── FeaturedCharacterCard.tsx← Big card (Featured rail only)
│   └── EmptyState.tsx           ← "No results" state
│
└── lib/queries/
    ├── exploreTypes.ts          ← Shared TypeScript types
    ├── exploreQueries.ts        ← All Supabase queries
    └── favoriteActions.ts       ← Toggle favorite action
```

## How it fits your existing project

- Uses the `characters`, `profiles`, and `character_stats` tables from your v3 schema
- Assumes `@/lib/supabase/client` and `@/lib/supabase/server` exist (from auth build)
- Assumes `@/components/DnaLogo` exists (from landing page)
- Assumes `@/components/Navbar` exists (from landing page)
- Uses Tailwind CSS variables defined in your `globals.css`

## Feature summary

- 4 rails: Featured (big cards) → Trending → New → Your Favorites (logged-in only)
- Rails auto-hide if fewer than 3 characters available
- Search: live, 300ms debounce, searches name + subtitle + description
- Filters: Gender/pronouns checkboxes, NSFW toggle, Creator (All/Nexcor/Community)
- Sort: Newest, Popular, A-Z
- When filtering/searching: rails collapse into unified grid
- Favorites: heart icon on every card, instant toggle, syncs to DB
- NSFW filtering respects `profile.show_nsfw` for logged-in users, always off for logged-out
- Logged-out visitors see everything (SEO-friendly), can't favorite (tooltip explains)
- Floating "+ CREATE ENTITY" button for logged-in users with username

## Easter eggs embedded

- `SUBJECT #xxx-Y` label top-left of every card (color palette chosen deterministically from character ID)
- `324B21` on right side of search bar
- `NEOLUTION ARCHIVES · NO MATCH FOUND · 324B21` in empty state
- Scan line animation on card avatars (offset per card index)
- `◈ FEATURED` badge on Featured rail cards
- `NEXCOR` badge on platform characters (bottom-right of avatar)
