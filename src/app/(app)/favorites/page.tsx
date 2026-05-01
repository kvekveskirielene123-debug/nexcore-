import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DnaLogo } from "@/components/DnaLogo";
import { FavoriteHeart } from "@/components/character/FavoriteHeart";

export const metadata = {
  title: "Favorites · Nexcor",
  description: "Characters you've saved on Nexcor.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/favorites");

  // Fetch favorites with character data + stats joined.
  // Supabase returns the related character inline.
  const { data: favorites } = await supabase
    .from("character_favorites")
    .select(
      `created_at,
       character:characters!inner (
         id, name, subtitle, avatar_url, gender_pronouns,
         is_platform, is_nsfw, tier, visibility
       )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (favorites ?? []).filter((f: any) => f.character);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <DnaLogo size={32} className="mx-auto mb-4 opacity-70" />
            <div
              className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ SAVED ENTITIES · 324B21
            </div>
            <h1
              className="text-[32px] md:text-[44px] font-black tracking-[5px] text-white uppercase"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 40px rgba(0,229,255,0.25)",
              }}
            >
              FAVORITES
            </h1>
            <p
              className="text-sm text-[#7a6a9a] italic mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {rows.length === 0
                ? "No subjects saved yet."
                : `${rows.length} subject${rows.length === 1 ? "" : "s"} designated.`}
            </p>
          </div>

          {/* Empty state */}
          {rows.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <p
                className="text-[#a78bfa] italic mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                When you find a character you love, tap the heart to save them
                here. Your favorites will always be one tap away.
              </p>
              <Link
                href="/explore"
                className="inline-block px-7 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_36px_rgba(0,229,255,0.4)] transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                EXPLORE CHARACTERS →
              </Link>
            </div>
          ) : (
            /* Grid of favorited characters */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rows.map((fav: any) => {
                const c = fav.character;
                return (
                  <Link
                    key={c.id}
                    href={`/character/${c.id}`}
                    className="group relative block rounded-xl overflow-hidden border border-purple-700/20 bg-[#0c0520]/70 hover:border-cyan-400/40 transition-all"
                  >
                    {/* Top cyan gradient */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

                    {/* Avatar */}
                    <div className="relative aspect-square overflow-hidden bg-[#150035]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.avatar_url}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Favorite heart — top right corner */}
                      <div className="absolute top-2 right-2">
                        <FavoriteHeart
                          characterId={c.id}
                          initialFavorited={true}
                        />
                      </div>
                      {/* NSFW badge */}
                      {c.is_nsfw && (
                        <span
                          className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-[9px] tracking-[2px] text-amber-400"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          NSFW
                        </span>
                      )}
                      {/* Verified platform badge */}
                      {c.is_platform && (
                        <span
                          className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 text-[9px] tracking-[2px] text-cyan-400"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          ◈ NEXCOR
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div
                        className="text-base font-semibold tracking-[2px] text-white truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {c.name}
                      </div>
                      <div
                        className="text-[9px] tracking-[1.5px] text-[#7a6a9a] uppercase mt-1 truncate"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {c.gender_pronouns}
                      </div>
                      {c.subtitle && (
                        <p
                          className="text-[12px] text-[#a78bfa] italic mt-2 line-clamp-2 leading-relaxed"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {c.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
