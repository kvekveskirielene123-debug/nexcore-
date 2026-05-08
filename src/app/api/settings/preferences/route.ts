import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_MODELS = ["haiku", "sonnet", "opus"];
const VALID_FONT_SIZES = ["small", "medium", "large"];
const VALID_THEMES = ["midnight", "bloodline", "dawn", "helix", "void"];
const VALID_LANG_CODES = [
  "en", "ka", "ru", "es", "fr", "de", "pt", "it",
  "ja", "zh", "ko", "ar", "hi", "tr",
];

/**
 * PATCH /api/settings/preferences
 * Updates one or more user preferences on the profiles row.
 * Only includes fields that are present in the request body.
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const updates: Record<string, any> = {};

    if ("show_nsfw" in body) {
      updates.show_nsfw = !!body.show_nsfw;
    }
    if ("show_creator_badge" in body) {
      updates.show_creator_badge = !!body.show_creator_badge;
    }
    if ("default_model" in body) {
      const v = String(body.default_model);
      if (!VALID_MODELS.includes(v)) {
        return NextResponse.json({ error: "Invalid default_model" }, { status: 400 });
      }
      updates.default_model = v;
    }
    if ("chat_language" in body) {
      const v = String(body.chat_language);
      if (!VALID_LANG_CODES.includes(v)) {
        return NextResponse.json({ error: "Invalid chat_language" }, { status: 400 });
      }
      updates.chat_language = v;
    }
    if ("pref_italics_on" in body) {
      updates.pref_italics_on = !!body.pref_italics_on;
    }
    if ("pref_gray_text_on" in body) {
      updates.pref_gray_text_on = !!body.pref_gray_text_on;
    }
    if ("chat_font_size" in body) {
      const v = String(body.chat_font_size);
      if (!VALID_FONT_SIZES.includes(v)) {
        return NextResponse.json({ error: "Invalid chat_font_size" }, { status: 400 });
      }
      updates.chat_font_size = v;
    }
    if ("chat_theme" in body) {
      const v = String(body.chat_theme);
      if (!VALID_THEMES.includes(v)) {
        return NextResponse.json({ error: "Invalid chat_theme" }, { status: 400 });
      }
      updates.chat_theme = v;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Preference update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: Object.keys(updates) });
  } catch (err: any) {
    console.error("Preferences PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
