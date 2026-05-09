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
        <header className="text-center mb-8 max-w-xl mx-auto">
          <p
            className="text-[9px] tracking-[5px] text-cyan-400/35 uppercase mb-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ IDENTITY CONFIG · 324B21
          </p>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[7px] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "#fff",
              textShadow: "0 0 36px rgba(0,229,255,0.22), 0 0 72px rgba(0,229,255,0.08)",
            }}
          >
            EDIT PROFILE
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.18))" }} />
            <p
              className="text-[10px] text-purple-400/50 italic tracking-wide"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your public identity on Nexcor
            </p>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.18))" }} />
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
