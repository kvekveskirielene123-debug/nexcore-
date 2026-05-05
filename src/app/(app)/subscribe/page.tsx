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
    price: "$4.99",
    period: "one-time",
    tag: "TRY IT",
    tagRgb: "124,58,237",
    highlight: false,
    perDay: "$0.36 / day",
  },
  {
    key: "brilliant_1mo",
    label: "1 MONTH",
    sublabel: "Most popular",
    price: "$9.99",
    period: "/ month",
    tag: "MOST POPULAR",
    tagRgb: "0,229,255",
    highlight: true,
    perDay: "$0.33 / day",
  },
  {
    key: "brilliant_2mo",
    label: "2 MONTHS",
    sublabel: "Best value",
    price: "$19.99",
    period: "/ 2 months",
    tag: "BEST VALUE",
    tagRgb: "167,139,250",
    highlight: false,
    perDay: "$0.33 / day",
  },
] as const;

const BENEFITS = [
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M16 4 C20 10 28 10 32 16 C36 22 28 26 24 32 C20 38 28 42 32 44" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M32 4 C28 10 20 10 16 16 C12 22 20 26 24 32 C28 38 20 42 16 44" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="18.5" y1="9" x2="29.5" y2="9" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="14.5" y1="17" x2="33.5" y2="17" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="16" y1="25" x2="32" y2="25" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="14.5" y1="33" x2="33.5" y2="33" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="18.5" y1="40" x2="29.5" y2="40" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    title: "Free Haiku",
    desc: "Haiku messages cost 0 marks. Talk endlessly.",
    save: "100% FREE",
    color: "0,229,255",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <rect x="4" y="6" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="9" y="13" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">A</text>
        <rect x="19" y="6" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="24" y="13" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
        <rect x="34" y="6" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="39" y="13" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">C</text>
        <rect x="4" y="20" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="9" y="27" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">G</text>
        <rect x="19" y="20" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="24" y="27" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">A</text>
        <rect x="34" y="20" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="39" y="27" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
        <rect x="4" y="34" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="9" y="41" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">C</text>
        <rect x="19" y="34" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="24" y="41" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">G</text>
        <rect x="34" y="34" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="39" y="41" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
      </svg>
    ),
    title: "Sonnet discount",
    desc: "Pay 8 ⟡ per message instead of 10.",
    save: "SAVE 20%",
    color: "167,139,250",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <line x1="24" y1="10" x2="12" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="24" y1="10" x2="36" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="12" y1="28" x2="36" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="12" y1="28" x2="8" y2="40" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
        <line x1="36" y1="28" x2="40" y2="40" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="24" cy="10" r="5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="12" cy="28" r="4" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
        <circle cx="36" cy="28" r="4" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
        <circle cx="8" cy="40" r="3" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="3" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Opus discount",
    desc: "Pay 19 ⟡ per message instead of 25.",
    save: "SAVE 24%",
    color: "0,229,255",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <circle cx="24" cy="16" r="8" stroke="#a78bfa" strokeWidth="2" fill="rgba(167,139,250,0.1)"/>
        <path d="M10 40 C10 32 16 28 24 28 C32 28 38 32 38 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="16" r="3" fill="rgba(0,229,255,0.3)" stroke="#00e5ff" strokeWidth="1.5"/>
        <line x1="38" y1="8" x2="44" y2="6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="38" y1="12" x2="44" y2="12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="38" y1="16" x2="44" y2="18" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    title: "Unlimited personas",
    desc: "Free users get 1. Brilliant users get infinite.",
    save: "UNLIMITED",
    color: "124,58,237",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M6 16 L6 8 L14 8" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 16 L42 8 L34 8" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 32 L6 40 L14 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 32 L42 40 L34 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="24" cy="24" rx="7" ry="9" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8"/>
        <path d="M18 20 Q24 16 30 20" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M18 24 Q24 20 30 24" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M18 28 Q24 24 30 28" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        <circle cx="24" cy="24" r="2" fill="#00e5ff" opacity="0.9"/>
      </svg>
    ),
    title: "Priority support",
    desc: "Kurai reads your messages personally.",
    save: "DIRECT LINE",
    color: "167,139,250",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <line x1="8" y1="12" x2="24" y2="24" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="8" y1="36" x2="24" y2="24" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="8" x2="24" y2="24" stroke="#00e5ff" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="40" y2="12" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="40" y2="36" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="24" y2="40" stroke="#00e5ff" strokeWidth="1.2" opacity="0.5"/>
        <circle cx="8" cy="12" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="8" cy="36" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="24" cy="8" r="3.5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="24" cy="40" r="3.5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="40" cy="12" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="40" cy="36" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="5" fill="rgba(0,229,255,0.25)" stroke="#00e5ff" strokeWidth="2"/>
      </svg>
    ),
    title: "Early access",
    desc: "Voice modes, bubble styles, new features first.",
    save: "FIRST IN",
    color: "0,229,255",
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M16 4 C20 10 28 10 32 16 C36 22 28 26 24 32 C20 38 28 42 32 44" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 4 C28 10 20 10 16 16 C12 22 20 26 24 32 C28 38 20 42 16 44" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="3" fill="rgba(167,139,250,0.5)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="24" cy="10" r="2" fill="rgba(124,58,237,0.4)" stroke="#7c3aed" strokeWidth="1.2"/>
        <circle cx="24" cy="38" r="2" fill="rgba(124,58,237,0.4)" stroke="#7c3aed" strokeWidth="1.2"/>
      </svg>
    ),
    title: "Sestra status",
    desc: "◈ BRILLIANT badge. The clones will know.",
    save: "EXCLUSIVE",
    color: "124,58,237",
  },
];

const COMPARE_ROWS = [
  { feature: "Haiku messages", free: "3 ⟡ each", brilliant: "FREE", brilliantHighlight: true },
  { feature: "Sonnet messages", free: "10 ⟡ each", brilliant: "8 ⟡ each", brilliantHighlight: true },
  { feature: "Opus messages", free: "25 ⟡ each", brilliant: "19 ⟡ each", brilliantHighlight: true },
  { feature: "Personas", free: "1", brilliant: "Unlimited", brilliantHighlight: true },
  { feature: "Daily bonus marks", free: "50 ⟡", brilliant: "100 ⟡", brilliantHighlight: true },
  { feature: "Early feature access", free: "✗", brilliant: "✓", brilliantHighlight: true },
  { feature: "Priority support", free: "✗", brilliant: "✓", brilliantHighlight: true },
  { feature: "Brilliant badge", free: "✗", brilliant: "◈ BRILLIANT", brilliantHighlight: true },
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
    <main className="min-h-screen bg-[#05020d] pt-24 pb-32 overflow-hidden">

      {/* ── Ambient background ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 80% 70%, rgba(0,229,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 10% 60%, rgba(124,58,237,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* ── Floating orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 600, height: 600,
            top: "-200px", left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 400, height: 400,
            bottom: "10%", right: "-100px",
            background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)",
            animationDuration: "6s",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">

        {/* ── Hero header ── */}
        <header className="text-center mb-16">
          <div className="relative inline-block mb-8">
            {/* Outer glow rings */}
            <div
              className="absolute rounded-full animate-ping"
              style={{
                inset: -20,
                border: "1px solid rgba(124,58,237,0.15)",
                animationDuration: "3s",
              }}
            />
            <div
              className="absolute rounded-full animate-ping"
              style={{
                inset: -8,
                border: "1px solid rgba(124,58,237,0.25)",
                animationDuration: "3s",
                animationDelay: "0.5s",
              }}
            />
            <DnaLogo
              size={56}
              className="mx-auto relative z-10"
              style={{ filter: "drop-shadow(0 0 30px rgba(124,58,237,0.8)) drop-shadow(0 0 60px rgba(124,58,237,0.3))" }}
            />
          </div>

          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-16 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.6))" }} />
            <span
              className="text-[9px] tracking-[4px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.8)" }}
            >
              ◈ NEXCOR BRILLIANT · DESIGNATION UPGRADE
            </span>
            <span className="w-16 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(124,58,237,0.6))" }} />
          </div>

          <h1
            className="text-[44px] md:text-[68px] font-black tracking-[6px] text-white uppercase mb-5"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 80px rgba(124,58,237,0.4), 0 0 40px rgba(0,229,255,0.1)",
            }}
          >
            GO{" "}
            <span
              style={{
                color: "#a78bfa",
                textShadow: "0 0 60px rgba(167,139,250,0.8), 0 0 120px rgba(167,139,250,0.3)",
              }}
            >
              BRILLIANT
            </span>
          </h1>

          <p
            className="text-[16px] text-[#a78bfa] italic max-w-xl mx-auto leading-relaxed mb-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Deeper connections. Smarter conversations. A platform that grows with you.
          </p>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { value: "24%", label: "SAVINGS ON OPUS" },
              { value: "∞", label: "PERSONAS" },
              { value: "20%", label: "SAVINGS ON SONNET" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div
                  className="text-[28px] font-black"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#a78bfa",
                    textShadow: "0 0 20px rgba(167,139,250,0.5)",
                  }}
                >
                  {value}
                </div>
                <div
                  className="text-[8px] tracking-[2px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
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
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(122,106,154,0.2))" }} />
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              ◈ WHAT YOU UNLOCK
            </span>
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(122,106,154,0.2))" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  border: `1px solid rgba(${b.color},0.18)`,
                  background: "rgba(12,5,32,0.6)",
                  boxShadow: `0 0 0 0 rgba(${b.color},0)`,
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg,transparent,rgba(${b.color},0.5),transparent)` }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(${b.color},0.06) 0%, transparent 70%)` }}
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
                    className="mb-3"
                    style={{ filter: `drop-shadow(0 0 10px rgba(${b.color},0.6))` }}
                  >
                    {b.svg}
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
        <section className="mb-14">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(122,106,154,0.2))" }} />
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              ◈ CHOOSE YOUR PLAN
            </span>
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(122,106,154,0.2))" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  border: plan.highlight
                    ? "1px solid rgba(0,229,255,0.5)"
                    : `1px solid rgba(${plan.tagRgb},0.2)`,
                  background: plan.highlight
                    ? "rgba(0,229,255,0.05)"
                    : "rgba(12,5,32,0.7)",
                  boxShadow: plan.highlight
                    ? "0 0 60px rgba(0,229,255,0.12), inset 0 0 30px rgba(0,229,255,0.03)"
                    : "none",
                }}
              >
                {/* Top gradient line */}
                <div
                  className="h-px flex-shrink-0"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(90deg, transparent, #00e5ff 50%, transparent)"
                      : `linear-gradient(90deg, transparent, rgba(${plan.tagRgb},0.6), transparent)`,
                    boxShadow: plan.highlight ? "0 0 15px rgba(0,229,255,0.5)" : "none",
                  }}
                />

                {plan.highlight && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 60%)",
                    }}
                  />
                )}

                <div className="p-6 flex flex-col flex-1 relative">
                  {/* Tag */}
                  <div
                    className="text-[8px] tracking-[2px] uppercase px-2.5 py-1 rounded-full self-start mb-4"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `rgba(${plan.tagRgb},1)`,
                      background: `rgba(${plan.tagRgb},0.12)`,
                      border: `1px solid rgba(${plan.tagRgb},0.35)`,
                      boxShadow: `0 0 10px rgba(${plan.tagRgb},0.15)`,
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
                      className="text-[42px] font-black"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: plan.highlight ? "#00e5ff" : "#e2d9f3",
                        textShadow: plan.highlight ? "0 0 30px rgba(0,229,255,0.5)" : undefined,
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
                    className="text-[9px] tracking-[1px] mb-6"
                    style={{ fontFamily: "var(--font-mono)", color: `rgba(${plan.tagRgb},0.6)` }}
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

        {/* ── Free vs Brilliant comparison ── */}
        <section className="mb-14">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(122,106,154,0.2))" }} />
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              ◈ FREE VS BRILLIANT
            </span>
            <span className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(122,106,154,0.2))" }} />
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(124,58,237,0.2)",
              background: "rgba(12,5,32,0.7)",
            }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-3 px-6 py-3 border-b border-white/[0.04]"
              style={{ background: "rgba(8,4,26,0.5)" }}
            >
              <span
                className="text-[9px] tracking-[2px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
              >
                FEATURE
              </span>
              <span
                className="text-[9px] tracking-[2px] uppercase text-center"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
              >
                FREE
              </span>
              <span
                className="text-[9px] tracking-[2px] uppercase text-center"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)" }}
              >
                ◈ BRILLIANT
              </span>
            </div>

            {COMPARE_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 px-6 py-3.5 border-b border-white/[0.03] last:border-0"
                style={{ background: i % 2 === 0 ? "transparent" : "rgba(124,58,237,0.02)" }}
              >
                <span
                  className="text-[11px]"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(226,217,243,0.6)" }}
                >
                  {row.feature}
                </span>
                <span
                  className="text-[11px] text-center tabular-nums"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                >
                  {row.free}
                </span>
                <span
                  className="text-[11px] text-center font-bold tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: row.brilliantHighlight ? "rgba(167,139,250,0.9)" : "rgba(122,106,154,0.5)",
                    textShadow: row.brilliantHighlight ? "0 0 10px rgba(167,139,250,0.3)" : undefined,
                  }}
                >
                  {row.brilliant}
                </span>
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
