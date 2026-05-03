import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { grantSignupBonus, grantDailyBonus } from "@/lib/marks/bonuses";

export const runtime = "nodejs";

// POST /api/marks/on-auth
// Called client-side after every successful email login or email signup.
// Safe to call repeatedly — both bonus functions are fully idempotent.
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [signup, daily] = await Promise.allSettled([
      grantSignupBonus(user.id),
      grantDailyBonus(user.id),
    ]);

    return NextResponse.json({
      signup_bonus: signup.status === "fulfilled" ? signup.value : false,
      daily_bonus: daily.status === "fulfilled" ? daily.value : false,
    });
  } catch (err) {
    console.error("on-auth bonus error:", err);
    // Never block the auth flow — return 200 even on unexpected errors
    return NextResponse.json({ ok: true });
  }
}
