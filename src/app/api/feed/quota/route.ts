import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .single();

  const isBrilliant = isSubscriptionActive(profile?.subscription_expires_at ?? null);
  const dailyLimit  = isBrilliant ? 25 : 5;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("feed_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  const used      = count ?? 0;
  const remaining = Math.max(0, dailyLimit - used);
  return NextResponse.json({ used, remaining, limit: dailyLimit, isBrilliant });
}
