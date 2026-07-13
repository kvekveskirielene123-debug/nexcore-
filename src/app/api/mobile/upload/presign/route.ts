import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/mobile/upload/presign
// Body: { key: string, contentType: string }
// Returns: { uploadUrl: string, publicUrl: string }
// The mobile app uploads directly to R2 using the presigned URL (PUT),
// then stores the publicUrl in the database.
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { key?: string; contentType?: string };
  const { key, contentType } = body;

  if (!key || !contentType) {
    return NextResponse.json({ error: "key and contentType required" }, { status: 400 });
  }

  // Scope uploads to the user's folder to prevent path traversal
  const safeKey = `${user.id}/${key.replace(/^\/+/, "").replace(/\.\./g, "")}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: safeKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min
  const publicUrl = `${R2_PUBLIC_URL}/${safeKey}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
