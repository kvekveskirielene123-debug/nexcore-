import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { creditMarks } from "@/lib/marks/balance";
import { isUserBanned } from "@/lib/checkBanned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AD_MARKS_REWARD  = 20;
const BATCH_SIZE       = 10;   // ads per batch
const BATCH_WINDOW_MS  = 30 * 60 * 1000;  // 30 minutes
const DAILY_CAP        = 50;   // max ads per 24-hour window
// "Daily" = 24 hours since the FIRST ad watched, not calendar midnight.
// This prevents timezone gaming where users reset at UTC midnight to
// get a longer effective window.
const DAILY_WINDOW_MS  = 24 * 60 * 60 * 1000;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getToken(request: Request): string {
  return request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
}

export async function POST(request: Request) {
  try {
    const { data: { user: authUser }, error: authErr } = await supabaseAdmin.auth.getUser(getToken(request));
    if (authErr || !authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = authUser.id;

    if (await isUserBanned(userId, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // TODO: verify AdMob SSV signature here before crediting marks
    // Until AdMob is live this endpoint is not exposed in the UI.

    const now = Date.now();

    // Fetch ad tracking state from profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("ad_first_watched_at, ads_watched_total_window, ad_batch_start_at, ads_watched_in_batch")
      .eq("id", userId)
      .single();

    const adFirstAt       = profile?.ad_first_watched_at ? new Date(profile.ad_first_watched_at).getTime() : null;
    const adsTotalWindow  = profile?.ads_watched_total_window ?? 0;
    const batchStartAt    = profile?.ad_batch_start_at ? new Date(profile.ad_batch_start_at).getTime() : null;
    const adsInBatch      = profile?.ads_watched_in_batch ?? 0;

    // ── Daily cap check (24h since first ad, not midnight) ──────────────
    const dailyWindowActive = adFirstAt && (now - adFirstAt) < DAILY_WINDOW_MS;
    const adsToday = dailyWindowActive ? adsTotalWindow : 0;

    if (adsToday >= DAILY_CAP) {
      const resetsAt = new Date((adFirstAt ?? now) + DAILY_WINDOW_MS).toISOString();
      return NextResponse.json({
        error: "daily_cap_reached",
        message: `You've watched ${DAILY_CAP} ads today. Resets in 24h from your first ad.`,
        resets_at: resetsAt,
      }, { status: 429 });
    }

    // ── Batch check (10 per 30-minute window) ────────────────────────────
    const batchActive = batchStartAt && (now - batchStartAt) < BATCH_WINDOW_MS;
    const currentBatchCount = batchActive ? adsInBatch : 0;

    if (batchActive && currentBatchCount >= BATCH_SIZE) {
      const batchResetsAt = new Date((batchStartAt ?? now) + BATCH_WINDOW_MS).toISOString();
      return NextResponse.json({
        error: "batch_limit_reached",
        message: "You've used your 10-ad batch. Wait 30 minutes for the next one.",
        resets_at: batchResetsAt,
      }, { status: 429 });
    }

    // ── Credit marks ─────────────────────────────────────────────────────
    const newBatchCount = currentBatchCount + 1;
    const newTotalWindow = adsToday + 1;

    const updates: Record<string, any> = {
      ads_watched_in_batch:      newBatchCount,
      ads_watched_total_window:  newTotalWindow,
    };

    // Start new batch timer if needed
    if (!batchActive) updates.ad_batch_start_at = new Date(now).toISOString();

    // Start 24h window timer if this is the first ad in the window
    if (!dailyWindowActive) {
      updates.ad_first_watched_at      = new Date(now).toISOString();
      updates.ads_watched_total_window = 1;
    }

    await supabaseAdmin.from("profiles").update(updates).eq("id", userId);

    const newBalance = await creditMarks(userId, AD_MARKS_REWARD, "ad_watch", `ad_${now}`);

    return NextResponse.json({
      success: true,
      marks_earned: AD_MARKS_REWARD,
      new_balance: newBalance,
      ads_in_batch: newBatchCount,
      ads_remaining_in_batch: BATCH_SIZE - newBatchCount,
      ads_today: newTotalWindow,
      ads_remaining_today: DAILY_CAP - newTotalWindow,
    });

  } catch (err: any) {
    console.error("claim-ad error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
