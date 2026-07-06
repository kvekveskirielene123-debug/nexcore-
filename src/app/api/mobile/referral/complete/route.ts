import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { tryCompleteReferral } from "@/lib/referrals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called after the new user's first message (AI chat or DM).
// Idempotent: if already completed or no pending referral exists, returns {ok:true, completed:false}.
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completed = await tryCompleteReferral(authUser.id, supabaseAdmin);
    return NextResponse.json({ ok: true, completed });
  } catch (err: any) {
    console.error("[referral/complete]", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
