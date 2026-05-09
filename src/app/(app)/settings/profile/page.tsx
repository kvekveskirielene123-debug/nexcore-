import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "Edit Profile · Nexcor",
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, bio, avatar_url, tone_preference, username_changed_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username) redirect("/onboarding/username");

  return (
    <main className="relative min-h-screen bg-[#05020d] overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 pt-10 pb-20 px-4 md:px-8">
        {/* Header */}
        <header className="text-center mb-10 max-w-lg mx-auto">
          <p
            className="text-[9px] tracking-[5px] text-cyan-400/40 uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ IDENTITY CONFIG · 324B21
          </p>
          <h1
            className="text-[30px] md:text-[38px] font-black tracking-[6px] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "#fff",
              textShadow: "0 0 40px rgba(0,229,255,0.25), 0 0 80px rgba(0,229,255,0.1)",
            }}
          >
            EDIT PROFILE
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/20" />
            <p
              className="text-[11px] text-purple-400/60 italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your public face on Nexcor.
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/20" />
          </div>
        </header>

        <ProfileClient
          username={profile.username}
          bio={profile.bio ?? null}
          avatarUrl={profile.avatar_url ?? null}
          tonePreference={profile.tone_preference ?? "casual"}
          usernameChangedAt={profile.username_changed_at ?? null}
        />
      </div>
    </main>
  );
}
