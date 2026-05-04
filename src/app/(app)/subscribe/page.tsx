import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DnaLogo } from "@/components/DnaLogo";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { Navbar } from "@/components/Navbar";
import { SubscribeButton } from "@/components/subscribe/SubscribeButton";

export const metadata = {
  title: "Subscribe · Nexcor",
  description: "Unlock unlimited personas, model discounts, and more with Nexcor Brilliant.",
};

const PLANS = [
  {
    key: "brilliant_2wk",
    label: "2 WEEKS",
    sublabel: "Try it",
    price: "$2.99",
    period: "one-time",
    tag: "TRY IT",
    tagRgb: "124,58,237",
    highlight: false,
    perDay: "$0.21 / day",
  },
  {
    key: "brilliant_1mo",
    label: "1 MONTH",
    sublabel: "Most popular",
    price: "$5.99",
    period: "/ month",
    tag: "MOST POPULAR",
    tagRgb: "0,229,255",
    highlight: true,
    perDay: "$0.20 / day",
  },
  {
    key: "brilliant_2mo",
    label: "2 MONTHS",
    sublabel: "Best value",
    price: "$9.99",
    period: "/ 2 months",
    tag: "BEST VALUE",
    tagRgb: "167,139,250",
    highlight: false,
    perDay: "$0.17 / day",
  },
] as const;

const BENEFITS = [
  {
    icon: "◉",
    title: "Sonnet discount",
    desc: "Pay 8 ⟡ per message instead of 10.",
    save: "SAVE 20%",
    color: "167,139,250",
  },
  {
    icon: "◈",
    title: "Opus discount",
    desc: "Pay 19 ⟡ per message instead of 25.",
    save: "SAVE 24%",
    color: "0,229,255",
  },
  {
    icon: "✦",
    title: "Unlimited personas",
    desc: "Free users get 1. Brilliant users get infinite.",
    save: "UNLIMITED",
    color: "124,58,237",
  },
  {
    icon: "⟡",
    title: "Priority support",
    desc: "Kurai reads your messages personally.",
    save: "DIRECT LINE",
    color: "167,139,250",
  },
  {
    icon: "◇",
    title: "Early access",
    desc: "Voice modes, bubble styles, new features first.",
    save: "FIRST IN",
    color: "0,229,255",
  },
  {
    icon: "🧬",
    title: "Sestra status",
    desc: "◈ BRILLIANT badge. The clones will know.",
    save: "EXCLUSIVE",
    color: "124,58,237",
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
    <main className="min-h-screen bg-[#05020d] pt-24 pb-32">

      {/* ── Ambient background ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 80% 70%, rgba(0,229,255,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">

        {/* ── Hero header ── */}
        <header className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <DnaLogo
              size={44}
              className="mx-auto"
              style={{ filter: "drop-shadow(0 0 20px rgba(124,58,237,0.6))" }}
            />
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ border: "1px solid rgba(124,58,237,0.2)", animationDuration: "3s" }}
            />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-10 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.5))" }} />
            <span
              className="text-[9px] tracking-[4px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.7)" }}
            >
              ◈ NEXCOR BRILLIANT · DESIGNATION UPGRADE
            </span>
            <span className="w-10 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(124,58,237,0.5))" }} />
          </div>

          <h1
            className="text-[40px] md:text-[60px] font-black tracking-[6px] text-white uppercase mb-4"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 60px rgba(124,58,237,0.3), 0 0 30px rgba(0,229,255,0.1)",
            }}
          >
            GO{" "}
            <span
              style={{
                color: "#a78bfa",
                textShadow: "0 0 40px rgba(167,139,250,0.6)",
              }}
            >
              BRILLIANT
            </span>
          </h1>

          <p
            className="text-[15px] text-[#a78bfa] italic max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Deeper connections. Smarter conversations. A platform that grows with you.
          </p>
        </header>

        {/* ── Already subscribed banner ── */}
        {isSubscribed && (
          <div
            className="mb-12 rounded-xl p-5 text-center"
            style={{
              border: "1px solid rgba(0,229,255,0.3)",
              background: "rgba(0,229,255,0.04)",
            }}
          >
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

        {/* ── Benefits grid ── */}
        <section className="mb-16">
          <div
            className="text-[10px] tracking-[3px] text-center uppercase mb-8"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            ◈ WHAT YOU UNLOCK
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl relative overflow-hidden transition-all duration-300 hover:border-opacity-50"
                style={{
                  border: `1px solid rgba(${b.color},0.18)`,
                  background: "rgba(12,5,32,0.6)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg,transparent,rgba(${b.color},0.4),transparent)` }}
                />

                {/* Save badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className="text-[7px] tracking-[2px] px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `rgba(${b.color},0.9)`,
                      background: `rgba(${b.color},0.1)`,
                      border: `1px solid rgba(${b.color},0.25)`,
                    }}
                  >
                    {b.save}
                  </span>
                </div>

                <div className="p-5">
                  <div
                    className="text-2xl mb-3"
                    style={{ filter: `drop-shadow(0 0 8px rgba(${b.color},0.5))` }}
                  >
                    {b.icon}
                  </div>
                  <h3
                    className="text-[13px] tracking-[2px] text-white uppercase mb-2"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-[12px] italic leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", color: `rgba(${b.color},0.6)` }}
                  >
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing tiers ── */}
        <section className="mb-10">
          <div
            className="text-[10px] tracking-[3px] text-center uppercase mb-8"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            ◈ CHOOSE YOUR PLAN
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  border: plan.highlight
                    ? "1px solid rgba(0,229,255,0.45)"
                    : `1px solid rgba(${plan.tagRgb},0.2)`,
                  background: plan.highlight
                    ? "rgba(0,229,255,0.04)"
                    : "rgba(12,5,32,0.7)",
                  boxShadow: plan.highlight
                    ? "0 0 40px rgba(0,229,255,0.08), inset 0 0 20px rgba(0,229,255,0.02)"
                    : "none",
                }}
              >
                {/* Top gradient line */}
                <div
                  className="h-px flex-shrink-0"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(90deg, transparent, #00e5ff 50%, transparent)"
                      : `linear-gradient(90deg, transparent, rgba(${plan.tagRgb},0.5), transparent)`,
                    boxShadow: plan.highlight ? "0 0 10px rgba(0,229,255,0.4)" : "none",
                  }}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Tag */}
                  <div
                    className="text-[8px] tracking-[2px] uppercase px-2.5 py-1 rounded-full self-start mb-4"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `rgba(${plan.tagRgb},1)`,
                      background: `rgba(${plan.tagRgb},0.1)`,
                      border: `1px solid rgba(${plan.tagRgb},0.3)`,
                    }}
                  >
                    {plan.tag}
                  </div>

                  {/* Duration */}
                  <div
                    className="text-[11px] tracking-[3px] uppercase mb-1"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                  >
                    {plan.label}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span
                      className="text-[38px] font-black"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: plan.highlight ? "#00e5ff" : "#e2d9f3",
                        textShadow: plan.highlight ? "0 0 25px rgba(0,229,255,0.4)" : undefined,
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.6)" }}
                    >
                      {plan.period}
                    </span>
                  </div>

                  {/* Per-day value */}
                  <div
                    className="text-[9px] tracking-[1px] mb-5"
                    style={{ fontFamily: "var(--font-mono)", color: `rgba(${plan.tagRgb},0.5)` }}
                  >
                    {plan.perDay}
                  </div>

                  <div className="flex-1" />

                  {/* CTA */}
                  {isSubscribed ? (
                    <div
                      className="w-full py-3 rounded-xl text-[10px] tracking-[2px] text-center"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "rgba(122,106,154,0.5)",
                        border: "1px solid rgba(122,106,154,0.15)",
                      }}
                    >
                      ALREADY SUBSCRIBED
                    </div>
                  ) : user ? (
                    <SubscribeButton tier={plan.key} highlight={plan.highlight} />
                  ) : (
                    <Link
                      href={`/signup?next=/subscribe`}
                      className={`w-full py-3.5 rounded-xl text-[10px] tracking-[3px] font-bold text-center transition-all ${
                        plan.highlight
                          ? "bg-cyan-400 text-black hover:shadow-[0_0_32px_rgba(0,229,255,0.5)]"
                          : "border border-purple-500/40 text-[#a78bfa] hover:border-cyan-400/50 hover:text-cyan-400"
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
          className="text-[10px] text-[#7a6a9a] italic text-center leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Payments processed securely by Stripe. Cancel anytime from Settings → Billing.
          You keep access until the end of your billing period.
        </p>

        <p
          className="text-[9px] tracking-[3px] text-purple-500/20 text-center mt-6 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
        </p>
      </div>
    </main>
    </>
  );
}
