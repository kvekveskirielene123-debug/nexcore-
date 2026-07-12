import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isUserBanned } from "@/lib/checkBanned";

function detectMediaType(buf: Uint8Array): { ext: string; mime: string; isVideo: boolean } | null {
  if (buf.length < 12) return null;
  // JPEG
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)
    return { ext: "jpg", mime: "image/jpeg", isVideo: false };
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)
    return { ext: "png", mime: "image/png", isVideo: false };
  // WebP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50)
    return { ext: "webp", mime: "image/webp", isVideo: false };
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46)
    return { ext: "gif", mime: "image/gif", isVideo: false };
  // MP4 / MOV — ISO Base Media File Format: bytes 4-7 == "ftyp"
  if (buf.length >= 8 &&
      buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70)
    return { ext: "mp4", mime: "video/mp4", isVideo: true };
  // MOV — older QuickTime: bytes 4-7 == "moov" or "wide"
  if (buf.length >= 8 && (
      (buf[4] === 0x6D && buf[5] === 0x6F && buf[6] === 0x6F && buf[7] === 0x76) ||
      (buf[4] === 0x77 && buf[5] === 0x69 && buf[6] === 0x64 && buf[7] === 0x65)))
    return { ext: "mov", mime: "video/quicktime", isVideo: true };
  return null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = new Set([
  "character-avatars",
  "persona-avatars",
  "profile-avatars",
  "group-photos",
  "chat-attachments",
  "feed-images",
  "feed-videos",
]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;   // 8 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
// 20 uploads per 10 minutes per user across all buckets
const RATE_LIMIT_COUNT  = 20;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureBucket(name: string) {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === name)) {
    await supabaseAdmin.storage.createBucket(name, { public: true });
  }
}

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
    const bucket = formData.get("bucket") as string | null;
    const file = formData.get("file") as File | null;

    if (!bucket || !file) {
      return NextResponse.json({ error: "Missing bucket or file" }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    if (await isUserBanned(userId, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (!checkRateLimit(`upload:${userId}`, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW)) {
      return NextResponse.json({ error: "Too many uploads. Slow down." }, { status: 429 });
    }

    await ensureBucket(bucket);

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const mediaType = detectMediaType(bytes);
    if (!mediaType) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
    }

    const maxBytes = mediaType.isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: mediaType.isVideo ? "Video too large. Maximum 100 MB." : "File too large. Maximum 8 MB." },
        { status: 413 }
      );
    }

    const path = `${userId}/${Date.now()}.${mediaType.ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: mediaType.mime, upsert: false });

    if (upErr) {
      console.error(`[upload] ${bucket} error:`, upErr.message);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error("[mobile/upload]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
