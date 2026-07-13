import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { creditMarks } from "@/lib/marks/balance";
import { isUserBanned } from "@/lib/checkBanned";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLAIM_AMOUNT = 50;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getToken(req: Request) {
  return req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`claim-referral:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(getToken(req));
    if (authError || !authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const claimerId = authUser.id;

    if (await isUserBanned(claimerId, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const normalizedCode = (code as string).toUpperCase().trim();

    // Resolve the code owner
    const { data: owner } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("referral_code", normalizedCode)
      .maybeSingle();

    if (!owner) {
      return NextResponse.json({ error: "Invalid code — check it and try again" }, { status: 404 });
    }

    // No self-claims
    if (owner.id === claimerId) {
      return NextResponse.json({ error: "You cannot claim your own code" }, { status: 400 });
    }

    // One claim per user, enforced both here and by the UNIQUE INDEX on claimer_id
    const { data: existing } = await supabaseAdmin
      .from("code_claims")
      .select("id")
      .eq("claimer_id", claimerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You've already claimed a friend code" }, { status: 409 });
    }

    const { error: insertErr } = await supabaseAdmin
      .from("code_claims")
      .insert({ claimer_id: claimerId, owner_id: owner.id });

    if (insertErr) {
      // 23505 = unique_violation — race condition, treat as already-claimed
      if (insertErr.code === "23505") {
        return NextResponse.json({ error: "You've already claimed a friend code" }, { status: 409 });
      }
      throw insertErr;
    }

    // Award both users simultaneously
    const [claimerBalance] = await Promise.all([
      creditMarks(claimerId, CLAIM_AMOUNT, "friend_code_claim", undefined, supabaseAdmin),
      creditMarks(owner.id,   CLAIM_AMOUNT, "friend_code_reward", undefined, supabaseAdmin),
    ]);

    return NextResponse.json({ ok: true, amount: CLAIM_AMOUNT, new_balance: claimerBalance });
  } catch (err: any) {
    console.error("[claim-referral]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
