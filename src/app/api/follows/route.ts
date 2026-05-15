import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendFollowNotification } from "@/lib/email/resend";

// GET /api/follows?targetId=xxx
// Returns { following: bool, followerCount: number }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");
  if (!targetId) return NextResponse.json({ error: "Missing targetId" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: followerCount }, followCheck] = await Promise.all([
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", targetId),
    user
      ? supabase
          .from("user_follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", targetId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    following: !!followCheck.data,
    followerCount: followerCount ?? 0,
  });
}

// POST /api/follows  body: { targetId: string }
// Toggles follow — returns { following: bool, followerCount: number }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetId } = await request.json();
  if (!targetId || targetId === user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  // Check if already following
  const { data: existing } = await supabase
    .from("user_follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
  } else {
    await supabase
      .from("user_follows")
      .insert({ follower_id: user.id, following_id: targetId });
  }

  const { count } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", targetId);

  // Fire-and-forget: notify the person being followed (only on new follow)
  if (!existing) {
    (async () => {
      const { data: follower } = await supabase
        .from("profiles").select("username").eq("id", user.id).maybeSingle();
      const authUser = await supabase.auth.admin.getUserById(targetId).catch(() => ({ data: null }));
      const email = (authUser as any)?.data?.user?.email;
      const { data: target } = await supabase
        .from("profiles").select("username").eq("id", targetId).maybeSingle();
      if (email && follower?.username && target?.username) {
        sendFollowNotification({
          toEmail: email,
          toUsername: target.username,
          followerUsername: follower.username,
        });
      }
    })();
  }

  return NextResponse.json({ following: !existing, followerCount: count ?? 0 });
}
