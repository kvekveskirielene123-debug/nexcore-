import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isUserBanned } from "@/lib/checkBanned";

function detectImageType(buf: Uint8Array): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)
    return { ext: "jpg", mime: "image/jpeg" };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)
    return { ext: "png", mime: "image/png" };
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50)
    return { ext: "webp", mime: "image/webp" };
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46)
    return { ext: "gif", mime: "image/gif" };
  return null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES   = 8 * 1024 * 1024;
const RATE_LIMIT_COUNT  = 20;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const userId = authUser.id;
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum 8 MB." }, { status: 413 });
    }

    if (await isUserBanned(userId, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (!checkRateLimit(`upload:${userId}`, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW)) {
      return NextResponse.json({ error: "Too many uploads. Slow down." }, { status: 429 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const imageType = detectImageType(bytes);
    if (!imageType) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 415 });
    }

    // Create bucket if it doesn't exist yet
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === "character-avatars");
    if (!exists) {
      await supabaseAdmin.storage.createBucket("character-avatars", { public: true });
    }

    const path = `${userId}/${Date.now()}.${imageType.ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("character-avatars")
      .upload(path, buffer, { contentType: imageType.mime, upsert: false });

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
