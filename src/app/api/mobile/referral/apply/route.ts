import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called right after signup: registers a pending referral for the new user.
export async function POST(req: Request) {
  try {
    const { userId, referralCode } = await req.json();
    if (!userId || !referralCode) {
      return NextResponse.json({ error: "Missing userId or referralCode" }, { status: 400 });
    }

    const code = (referralCode as string).toUpperCase().trim();

    // Find the referrer by their code
    const { data: referrer } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Block self-referral (also enforced by DB constraint, but catch it early)
    if (referrer.id === userId) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    // Insert pending referral — if referred_id already has a row (unique constraint), silently ignore
    const { error } = await supabaseAdmin.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: userId,
      referral_code: code,
      status: "pending",
    });

    if (error && error.code !== "23505") {
      // 23505 = unique_violation: already referred, which is fine
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[referral/apply]", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
