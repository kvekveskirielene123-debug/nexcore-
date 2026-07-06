import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = new Set([
  "character-avatars",
  "persona-avatars",
  "profile-avatars",
  "group-photos",
  "chat-attachments",
  "feed-images",
]);

// 8 MB max per file — covers high-res photos with room to spare
const MAX_FILE_BYTES = 8 * 1024 * 1024;
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

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum 8 MB." }, { status: 413 });
    }

    if (!checkRateLimit(`upload:${userId}`, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW)) {
      return NextResponse.json({ error: "Too many uploads. Slow down." }, { status: 429 });
    }

    await ensureBucket(bucket);

    const path = `${userId}/${Date.now()}.jpg`;
    const buffer = await file.arrayBuffer();

    const { error: upErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: "image/jpeg", upsert: false });

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
