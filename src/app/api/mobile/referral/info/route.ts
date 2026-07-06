import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getOrCreateReferralCode } from "@/lib/referrals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const [referralCode, statsRes] = await Promise.all([
      getOrCreateReferralCode(userId, supabaseAdmin),
      supabaseAdmin
        .from("referrals")
        .select("status")
        .eq("referrer_id", userId),
    ]);

    const rows = (statsRes.data ?? []) as Array<{ status: string }>;
    const completedCount = rows.filter(r => r.status === "completed").length;
    const pendingCount   = rows.filter(r => r.status === "pending").length;

    return NextResponse.json({ referralCode, completedCount, pendingCount });
  } catch (err: any) {
    console.error("[referral/info]", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
