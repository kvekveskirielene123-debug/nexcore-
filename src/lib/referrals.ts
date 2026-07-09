// Server-only referral helpers. Never import from client components.

const REFERRAL_BONUS = 300;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 look-alikes

function randomCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function getOrCreateReferralCode(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any
): Promise<string> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();

  if (data?.referral_code) return data.referral_code as string;

  // Generate a unique code (retry loop handles rare collisions)
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId)
      .is("referral_code", null); // only write if still unset (race guard)

    if (!error) return code;
  }

  throw new Error("Failed to generate a unique referral code after 10 attempts");
}

export async function tryCompleteReferral(
  referredUserId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any
): Promise<boolean> {
  // Fast path: if already redeemed, skip
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("referral_redeemed")
    .eq("id", referredUserId)
    .single();
  if (prof?.referral_redeemed) return false;

  // Find a pending referral for this user
  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id")
    .eq("referred_id", referredUserId)
    .eq("status", "pending")
    .maybeSingle();

  if (!referral) return false;

  // Atomically mark as completed — guards against concurrent duplicate completions
  const { data: updated } = await supabaseAdmin
    .from("referrals")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", referral.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!updated) return false;

  // Fetch both profiles for usernames and push token
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, username, push_token")
    .in("id", [referral.referrer_id, referredUserId]);

  const referrerProfile = (profiles ?? []).find((p: { id: string }) => p.id === referral.referrer_id);
  const referredProfile  = (profiles ?? []).find((p: { id: string }) => p.id === referredUserId);
  const referrerUsername = (referrerProfile as any)?.username ?? "your friend";
  const referredUsername = (referredProfile as any)?.username  ?? "someone";

  // Credit marks to both users (fire-and-forget individually so one failure doesn't block the other)
  await Promise.allSettled([
    supabaseAdmin.rpc("credit_marks", {
      p_user_id: referral.referrer_id,
      p_amount: REFERRAL_BONUS,
      p_reason: `referral_bonus — invited @${referredUsername}`,
      p_payment_session_id: null,
    }),
    supabaseAdmin.rpc("credit_marks", {
      p_user_id: referredUserId,
      p_amount: REFERRAL_BONUS,
      p_reason: `welcome_bonus — referred by @${referrerUsername}`,
      p_payment_session_id: null,
    }),
  ]);

  // Mark referred user as redeemed so future message sends skip this check
  await supabaseAdmin
    .from("profiles")
    .update({ referral_redeemed: true })
    .eq("id", referredUserId);

  // Push notification to referrer (non-blocking)
  const referrerToken = (referrerProfile as any)?.push_token;
  if (referrerToken) {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: referrerToken,
        title: "✦ Referral bonus!",
        body: `@${referredUsername} joined using your invite — you both got ${REFERRAL_BONUS} marks!`,
        data: { screen: "Referral" },
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
    }).catch(() => {});
  }

  return true;
}
