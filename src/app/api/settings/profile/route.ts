import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
const RESERVED = [
  "admin","administrator","nexcor","support","help","mod","moderator",
  "staff","team","bigg","system","bot","api","root","null",
  "undefined","test","user","users","account","accounts","profile",
  "profiles","settings","explore","chat","store","legal","privacy",
  "terms","about","home","index","static","public","assets",
];
const VALID_TONES = ["casual","formal","playful","gentle","serious","flirty"];

function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(u);
}

/**
 * PATCH /api/settings/profile
 * Updates user's profile: avatar_url, username, bio, tone_preference.
 * Username changes are rate-limited to once per 30 days.
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      bio?: string;
      tone_preference?: string;
      avatar_url?: string | null;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load current profile for comparison
    const { data: current } = await supabase
      .from("profiles")
      .select("username, username_changed_at, bio, tone_preference, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (!current) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    // ── Username ─────────────────────────────────────────
    if (body.username !== undefined) {
      const newUsername = body.username.trim().toLowerCase();

      if (!isValidUsername(newUsername)) {
        return NextResponse.json(
          { error: "Username must be 3-30 chars, letters/numbers/underscore only." },
          { status: 400 }
        );
      }
      if (RESERVED.includes(newUsername)) {
        return NextResponse.json(
          { error: "That username is reserved." },
          { status: 400 }
        );
      }

      const isChanging = newUsername !== current.username?.toLowerCase();

      if (isChanging) {
        // Rate-limit check
        if (current.username_changed_at) {
          const daysSince =
            (Date.now() - new Date(current.username_changed_at).getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSince < USERNAME_CHANGE_COOLDOWN_DAYS) {
            const daysLeft = Math.ceil(USERNAME_CHANGE_COOLDOWN_DAYS - daysSince);
            return NextResponse.json(
              {
                error: `You can change your username again in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
                rate_limited: true,
                days_left: daysLeft,
              },
              { status: 429 }
            );
          }
        }

        // Uniqueness check (case-insensitive)
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", newUsername)
          .neq("id", user.id)
          .maybeSingle();
        if (taken) {
          return NextResponse.json(
            { error: "Username already taken." },
            { status: 409 }
          );
        }

        updates.username = newUsername;
        updates.username_changed_at = new Date().toISOString();
      }
    }

    // ── Bio ───────────────────────────────────────────────
    if (body.bio !== undefined) {
      const bio = body.bio.trim();
      if (bio.length > 300) {
        return NextResponse.json(
          { error: "Bio must be 300 chars or less." },
          { status: 400 }
        );
      }
      updates.bio = bio || null;
    }

    // ── Tone preference ───────────────────────────────────
    if (body.tone_preference !== undefined) {
      if (!VALID_TONES.includes(body.tone_preference)) {
        return NextResponse.json(
          { error: "Invalid tone preference." },
          { status: 400 }
        );
      }
      updates.tone_preference = body.tone_preference;
    }

    // ── Avatar URL ────────────────────────────────────────
    if ("avatar_url" in body) {
      updates.avatar_url = body.avatar_url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true, message: "Nothing to update." });
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      username_changed: !!updates.username,
    });
  } catch (err: any) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
