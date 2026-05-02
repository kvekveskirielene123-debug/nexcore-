import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AD_REWARD_MARKS = 50;
const MAX_ADS_PER_WINDOW = 5;
const WINDOW_MINUTES = 30;

/**
 * POST /api/marks/watch-ad
 *
 * Credits 50 ⟡ to the user after they watch an ad.
 * Rate-limited: max 5 ads per 30 minutes.
 *
 * In production, pass a verification token from your ad network SDK
 * in the request body ({ ad_token: string }) and verify it server-side
 * before crediting. For now (stub mode), no token is required.
 *
 * Returns:
 *   { ok: true, credited: 50, new_balance: number }
 *   { error: "rate_limited", next_available_at: ISO, ads_remaining: 0 }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limit check ─────────────────────────────────
    // Count how many ad_watch transactions occurred in the last 30 minutes
    const windowStart = new Date(
      Date.now() - WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { count: recentAds } = await supabase
      .from("mark_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("reason", "ad_watch")
      .gte("created_at", windowStart);

    if ((recentAds ?? 0) >= MAX_ADS_PER_WINDOW) {
      // Find when the oldest ad in the window expires
      const { data: oldest } = await supabase
        .from("mark_transactions")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("reason", "ad_watch")
        .gte("created_at", windowStart)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const nextAvailableAt = oldest
        ? new Date(
            new Date(oldest.created_at).getTime() +
              WINDOW_MINUTES * 60 * 1000
          ).toISOString()
        : null;

      return NextResponse.json(
        {
          error: "rate_limited",
          message: `You can watch ${MAX_ADS_PER_WINDOW} ads per ${WINDOW_MINUTES} minutes.`,
          next_available_at: nextAvailableAt,
          ads_remaining: 0,
        },
        { status: 429 }
      );
    }

    // ── In production: verify ad token from SDK here ──────
    // const body = await request.json();
    // const { ad_token } = body;
    // await verifyAdToken(ad_token); // SDK-specific call
    // If verification fails, return 400 before crediting.

    // ── Credit the marks atomically ───────────────────────
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "credit_marks",
      {
        p_user_id: user.id,
        p_amount: AD_REWARD_MARKS,
        p_reason: "ad_watch",
      }
    );

    if (creditError) {
      console.error("Ad reward credit failed:", creditError);
      return NextResponse.json({ error: "Could not credit marks." }, { status: 500 });
    }

    const adsRemaining = MAX_ADS_PER_WINDOW - (recentAds ?? 0) - 1;

    return NextResponse.json({
      ok: true,
      credited: AD_REWARD_MARKS,
      new_balance: creditResult,
      ads_remaining: adsRemaining,
      ads_per_window: MAX_ADS_PER_WINDOW,
      window_minutes: WINDOW_MINUTES,
    });
  } catch (err: any) {
    console.error("Watch ad error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/marks/watch-ad
 * Check how many ads are remaining in the current window.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const windowStart = new Date(
      Date.now() - WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { count: recentAds } = await supabase
      .from("mark_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("reason", "ad_watch")
      .gte("created_at", windowStart);

    const adsUsed = recentAds ?? 0;
    const adsRemaining = Math.max(0, MAX_ADS_PER_WINDOW - adsUsed);

    return NextResponse.json({
      ads_remaining: adsRemaining,
      ads_used: adsUsed,
      max_ads: MAX_ADS_PER_WINDOW,
      window_minutes: WINDOW_MINUTES,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
