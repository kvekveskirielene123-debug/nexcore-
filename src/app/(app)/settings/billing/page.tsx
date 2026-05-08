import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";
import { stripe } from "@/lib/stripe";
import { BillingClient } from "./BillingClient";

export const metadata = {
  title: "Billing · Nexcor",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/billing");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("marks, subscription_expires_at, stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("mark_transactions")
      .select("id, amount, reason, balance_after, created_at, stripe_session_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Fetch cancel_at_period_end from Stripe if the user has an active subscription
  let cancelAtPeriodEnd = false;
  if (profile?.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
      cancelAtPeriodEnd = sub.cancel_at_period_end;
    } catch {
      // Stripe unavailable — default to false
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#05020d] pt-8 pb-32 px-4 md:px-8">
        <header className="text-center mb-10 max-w-3xl mx-auto">
          <DnaLogo size={28} className="mx-auto mb-4 opacity-60" />
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ FINANCIAL LEDGER · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            BILLING
          </h1>
          <p
            className="text-[13px] text-[#a78bfa] italic mt-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your Marks balance, transaction history, and payment settings.
          </p>
        </header>

        <BillingClient
          transactions={transactions ?? []}
          marksBalance={profile?.marks ?? 0}
          subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
        />
      </main>
    </>
  );
}
