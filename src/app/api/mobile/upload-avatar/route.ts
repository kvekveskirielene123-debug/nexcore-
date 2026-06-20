import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string | null;
    const file = formData.get("file") as File | null;

    if (!userId || !file) {
      return NextResponse.json({ error: "Missing userId or file" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create bucket if it doesn't exist yet
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === "character-avatars");
    if (!exists) {
      await supabaseAdmin.storage.createBucket("character-avatars", { public: true });
    }

    const path = `${userId}/${Date.now()}.jpg`;
    const buffer = await file.arrayBuffer();

    const { error: upErr } = await supabaseAdmin.storage
      .from("character-avatars")
      .upload(path, buffer, { contentType: "image/jpeg", upsert: false });

    if (upErr) {
      console.error("[upload-avatar] storage error:", upErr.message);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("character-avatars").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error("[mobile/upload-avatar]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
