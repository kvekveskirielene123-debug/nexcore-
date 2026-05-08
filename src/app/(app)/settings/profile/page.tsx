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
    <>
      <main className="min-h-screen bg-[#05020d] pt-8 pb-20 px-4 md:px-8">
        <header className="text-center mb-10 max-w-xl mx-auto">
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ IDENTITY CONFIG · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            EDIT PROFILE
          </h1>
          <p
            className="text-[13px] text-[#a78bfa] italic mt-3 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your public face on Nexcor.
          </p>
        </header>

        <ProfileClient
          username={profile.username}
          bio={profile.bio ?? null}
          avatarUrl={profile.avatar_url ?? null}
          tonePreference={profile.tone_preference ?? "casual"}
          usernameChangedAt={profile.username_changed_at ?? null}
        />
      </main>
    </>
  );
}
