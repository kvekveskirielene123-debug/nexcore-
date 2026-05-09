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
    .select("username, bio, avatar_url, tone_preference, username_changed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username) redirect("/onboarding/username");

  return (
    <main className="relative min-h-screen bg-[#05020d] overflow-hidden">

      {/* Subtle hex grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial atmosphere glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,212,255,0.07) 0%, transparent 70%), " +
            "radial-gradient(ellipse 40% 30% at 80% 80%, rgba(124,58,237,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Top border glow */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 30%, rgba(167,139,250,0.2) 70%, transparent)" }}
      />

      <div className="relative z-10 pt-10 pb-20 px-4 md:px-8">

        {/* ── PAGE HEADER ────────────────────────────────────────── */}
        <header className="text-center mb-10 max-w-xl mx-auto">

          {/* System label row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ height: 1, width: 40, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.3))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
              <span
                style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 6, color: "rgba(0,212,255,0.4)", textTransform: "uppercase" }}
              >
                IDENTITY CONFIG · 324B21
              </span>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
            </div>
            <div style={{ height: 1, width: 40, background: "linear-gradient(to left, transparent, rgba(0,212,255,0.3))" }} />
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
              textShadow: "0 0 40px rgba(0,212,255,0.25), 0 0 80px rgba(0,212,255,0.08)",
              marginBottom: 12,
            }}
          >
            EDIT PROFILE
          </h1>

          {/* Decorative divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ height: 1, flex: 1, maxWidth: 80, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.2))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 3, height: 3, background: "rgba(0,212,255,0.4)", transform: "rotate(45deg)" }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(167,139,250,0.45)", fontStyle: "italic", letterSpacing: 1 }}>
                Your public identity on Nexcor
              </p>
              <div style={{ width: 3, height: 3, background: "rgba(0,212,255,0.4)", transform: "rotate(45deg)" }} />
            </div>
            <div style={{ height: 1, flex: 1, maxWidth: 80, background: "linear-gradient(to left, transparent, rgba(0,212,255,0.2))" }} />
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
