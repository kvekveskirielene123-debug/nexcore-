import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { DnaLogo } from "@/components/DnaLogo";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const metadata = {
  title: "Subscribe · Nexcor",
  description: "Unlock unlimited personas, model discounts, and more with Nexcor Brilliant.",
};

const PLANS = [
  {
    key: "brilliant_2wk",
    label: "2 WEEKS",
    price: "$2.99",
    period: "one-time",
    tag: "TRY IT",
    tagColor: "rgba(124,58,237,0.5)",
    highlight: false,
  },
  {
    key: "brilliant_1mo",
    label: "1 MONTH",
    price: "$5.99",
    period: "/ month",
    tag: "MOST POPULAR",
    tagColor: "rgba(0,229,255,0.5)",
    highlight: true,
  },
  {
    key: "brilliant_2mo",
    label: "2 MONTHS",
    price: "$9.99",
    period: "/ 2 months",
    tag: "BEST VALUE",
    tagColor: "rgba(124,58,237,0.5)",
    highlight: false,
  },
] as const;

const BENEFITS = [
  {
    icon: "◉",
    title: "Sonnet discount",
    desc: "Pay 8 ⟡ per Sonnet message instead of 10. Save 20% on every reply.",
  },
  {
    icon: "◈",
    title: "Opus discount",
    desc: "Pay 19 ⟡ per Opus message instead of 25. Save 24% on the best model.",
  },
  {
    icon: "✦",
    title: "Unlimited personas",
    desc: "Free users get 1 persona. Brilliant users create as many as they want.",
  },
  {
    icon: "⟡",
    title: "Priority support",
    desc: "Your messages go to the top of the queue. Kurai reads them personally.",
  },
  {
    icon: "◇",
    title: "Early access",
    desc: "New features — bubble styles, profile frames, voice modes — ship to subscribers first.",
  },
  {
    icon: "🧬",
    title: "Sestra status",
    desc: "A ◈ BRILLIANT badge on your profile. The clones will know your designation.",
  },
] as const;

export default async function SubscribePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSubscribed = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    isSubscribed = isSubscriptionActive(profile?.subscription_expires_at ?? null);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] pt-24 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <header className="text-center mb-16">
            <DnaLogo size={36} className="mx-auto mb-5 opacity-70" />
            <div
              className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ NEXCOR BRILLIANT · DESIGNATION UPGRADE
            </div>
            <h1
              className="text-[36px] md:text-[56px] font-black tracking-[6px] text-white uppercase"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 50px rgba(0,229,255,0.25)",
              }}
            >
              GO BRILLIANT
            </h1>
            <p
              className="text-[15px] text-[#a78bfa] italic mt-4 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Deeper connections. Smarter conversations. A platform that grows with you.
            </p>
          </header>

          {/* Already subscribed state */}
          {isSubscribed && (
            <div className="mb-10 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-5 text-center">
              <p
                className="text-[13px] text-cyan-400 italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ◈ You&apos;re already a Brilliant subscriber. Thank you for your support.{" "}
                <Link href="/settings/billing" className="underline hover:text-white transition-colors">
                  Manage subscription →
                </Link>
              </p>
            </div>
          )}

          {/* Benefits grid */}
          <section className="mb-14">
            <div
              className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase text-center mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ WHAT YOU GET
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="rounded-xl border border-purple-700/20 bg-[#0c0520]/60 p-5 relative overflow-hidden hover:border-cyan-400/25 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                  <div
                    className="text-2xl mb-3"
                    style={{ color: "#00e5ff", textShadow: "0 0 12px rgba(0,229,255,0.4)" }}
                  >
                    {b.icon}
                  </div>
                  <h3
                    className="text-[14px] tracking-[2px] text-white uppercase mb-2"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-[12px] text-[#a78bfa] italic leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing tiers */}
          <section>
            <div
              className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase text-center mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ CHOOSE YOUR PLAN
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`rounded-xl border relative overflow-hidden flex flex-col ${
                    plan.highlight
                      ? "border-cyan-400/50 bg-cyan-400/5"
                      : "border-purple-700/25 bg-[#0c0520]/60"
                  }`}
                >
                  <div
                    className="h-px"
                    style={{
                      background: plan.highlight
                        ? "linear-gradient(90deg, transparent, #00e5ff, transparent)"
                        : "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
                    }}
                  />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Tag */}
                    <div
                      className="text-[8px] tracking-[2px] uppercase mb-3 px-2 py-1 rounded-md border self-start"
                      style={{
                        fontFamily: "var(--font-mono)",
                        borderColor: plan.tagColor,
                        color: plan.highlight ? "#00e5ff" : "#a78bfa",
                        background: plan.highlight ? "rgba(0,229,255,0.08)" : "rgba(124,58,237,0.08)",
                      }}
                    >
                      {plan.tag}
                    </div>

                    {/* Duration */}
                    <div
                      className="text-[13px] tracking-[3px] text-[#7a6a9a] uppercase mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {plan.label}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="text-[32px] font-black"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: plan.highlight ? "#00e5ff" : "#e2d9f3",
                          textShadow: plan.highlight ? "0 0 20px rgba(0,229,255,0.3)" : undefined,
                        }}
                      >
                        {plan.price}
                      </span>
                      <span
                        className="text-[11px] text-[#7a6a9a]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {plan.period}
                      </span>
                    </div>

                    <div className="flex-1" />

                    {/* CTA */}
                    {isSubscribed ? (
                      <div
                        className="w-full py-3 rounded-lg border border-purple-700/20 text-[10px] tracking-[2px] text-[#7a6a9a] text-center"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        ALREADY SUBSCRIBED
                      </div>
                    ) : user ? (
                      <SubscribeButton tier={plan.key} highlight={plan.highlight} />
                    ) : (
                      <Link
                        href={`/signup?next=/subscribe`}
                        className={`w-full py-3 rounded-lg text-[10px] tracking-[3px] font-bold text-center transition-all ${
                          plan.highlight
                            ? "bg-cyan-400 text-black hover:shadow-[0_0_24px_rgba(0,229,255,0.5)]"
                            : "border border-purple-700/40 text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        SIGN UP TO SUBSCRIBE
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fine print */}
          <p
            className="text-[10px] text-[#7a6a9a] italic text-center mt-8 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Payments processed securely by Stripe. Cancel anytime from Settings → Billing.
            You keep access until the end of your billing period.
          </p>

          <p
            className="text-[9px] tracking-[3px] text-purple-500/20 text-center mt-8 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
          </p>
        </div>
      </main>
    </>
  );
}

// Client component for the subscribe button (needs fetch)
function SubscribeButton({ tier, highlight }: { tier: string; highlight: boolean }) {
  "use client";
  return (
    <form
      action={async () => {
        "use server";
        // We use a server action here for simplicity.
        // The client-side JS fetch version is in the README as an alternative.
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-subscription`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier }),
          }
        );
        const data = await res.json();
        if (data.url) {
          // redirect is called from server actions
          const { redirect } = await import("next/navigation");
          redirect(data.url);
        }
      }}
    >
      <button
        type="submit"
        className={`w-full py-3 rounded-lg text-[10px] tracking-[3px] font-bold transition-all ${
          highlight
            ? "bg-cyan-400 text-black hover:shadow-[0_0_24px_rgba(0,229,255,0.5)]"
            : "border border-purple-700/40 text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400"
        }`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ◈ GET BRILLIANT →
      </button>
    </form>
  );
}
