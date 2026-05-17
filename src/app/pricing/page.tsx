import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { DnaLogo } from "@/components/DnaLogo";
import { PayPalCTAButton } from "@/components/payment/PayPalCTAButton";

export const metadata = {
  title: "Pricing · Nexcor",
  description:
    "Simple, transparent pricing. Start free and upgrade to Nexcor Brilliant when you're ready.",
};

const COMPARE: { feature: string; free: string; brilliant: string }[] = [
  { feature: "Daily transmissions", free: "5 / day", brilliant: "25 / day" },
  { feature: "Haiku messages", free: "3 ⟡ each", brilliant: "FREE" },
  { feature: "Sonnet messages", free: "10 ⟡ each", brilliant: "8 ⟡ each" },
  { feature: "Opus messages", free: "25 ⟡ each", brilliant: "19 ⟡ each" },
  { feature: "Personas", free: "5", brilliant: "Unlimited" },
  { feature: "Memory cards / character", free: "30", brilliant: "Unlimited" },
  { feature: "Memory depth / character", free: "10,000 chars", brilliant: "15,000 chars" },
  { feature: "AI Generate / week", free: "15", brilliant: "50" },
  { feature: "Daily bonus marks", free: "50 ⟡", brilliant: "100 ⟡" },
  { feature: "Early feature access", free: "✗", brilliant: "✓" },
  { feature: "Priority support", free: "✗", brilliant: "✓" },
  { feature: "Brilliant badge", free: "✗", brilliant: "◈ BRILLIANT" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is Nexcor really free?",
    a: "Yes. The free tier gives you real access: 5 personas, Claude Haiku at 3 Marks per message, a daily login bonus of 50 Marks, and 5 Signal Feed transmissions per day. You can use Nexcor indefinitely without paying a cent.",
  },
  {
    q: "What are Marks?",
    a: "Marks (⟡) are Nexcor's in-platform currency. You earn them from daily login bonuses, gifted transmissions, and (eventually) rewarded activities. You spend them on AI messages — Haiku is cheapest, Opus is most powerful. Brilliant subscribers get Haiku for free and discounts on Sonnet and Opus.",
  },
  {
    q: "How does billing work?",
    a: "We offer three Brilliant plans: 2 weeks ($4.99), 1 month ($9.99), and 1 year ($59.99). All are one-time charges — no auto-renewal. At the end of your period, your account returns to free tier. You can buy again anytime. Payments are processed securely by PayPal.",
  },
  {
    q: "Can I cancel?",
    a: "Since Brilliant is not a recurring subscription, there's nothing to cancel. Your access simply ends when the paid period is over and you revert to free. If you purchased within the last 7 days and haven't used significant Brilliant features, email us for a refund.",
  },
  {
    q: "Do you store my payment details?",
    a: "No. All payments go through PayPal. We never see or store your card number, CVV, or PayPal credentials. PayPal is PCI DSS Level 1 certified — the highest standard for card security.",
  },
  {
    q: "What happens to my characters if I go back to free?",
    a: "You keep all characters you've created. If you have more than 5 personas, they aren't deleted — you just can't create new ones until you're back under the 5-persona limit. Memory cards above the free limit also persist.",
  },
  {
    q: "Is Nexcor safe for me?",
    a: "Nexcor is an 18+ platform for adult roleplay and AI companion scenarios. If you are under 18, please do not create an account. We take platform safety seriously — content involving minors is a zero-tolerance violation.",
  },
  {
    q: "What countries can I pay from?",
    a: "PayPal is available in 200+ countries and supports 25 currencies. Local currency conversion happens at checkout. Prices are shown in USD.",
  },
];

export default async function PricingPage() {
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
    <div className="min-h-screen bg-[#05020d] overflow-x-hidden">
      <style>{`
        @keyframes px-shine {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .px-shine-text {
          background: linear-gradient(90deg, #a78bfa 0%, #fff 40%, #00e5ff 55%, #fff 70%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: px-shine 4s linear infinite;
        }
        .px-card-hover {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .px-card-hover:hover {
          transform: translateY(-3px);
        }
        .px-faq-item summary {
          cursor: pointer;
          list-style: none;
        }
        .px-faq-item summary::-webkit-details-marker { display: none; }
        details[open] .px-chevron { transform: rotate(180deg); }
        .px-chevron { transition: transform 0.2s; display: inline-block; }
      `}</style>

      {/* Background */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle,rgba(124,58,237,0.08) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:-200, left:"20%", width:900, height:600, background:"radial-gradient(ellipse,rgba(124,58,237,0.06) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:-300, right:-100, width:700, height:700, background:"radial-gradient(ellipse,rgba(0,229,255,0.04) 0%,transparent 65%)" }} />
      </div>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-10 h-14"
        style={{
          background: "rgba(5,2,13,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <DnaLogo size={24} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:900, letterSpacing:"4px", color:"rgba(226,217,243,0.7)" }}>
            NEXCOR
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/explore"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                color: "#000",
                background: "#00e5ff",
                padding: "7px 16px",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              OPEN APP
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "2px",
                  color: "rgba(167,139,250,0.7)",
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                LOG IN
              </Link>
              <Link
                href="/signup"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "2px",
                  color: "#000",
                  background: "#00e5ff",
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16">

        {/* ── Header ── */}
        <header className="text-center mb-16">
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"5px", color:"rgba(124,58,237,0.7)", marginBottom:16 }}>
            ◈ NEXCOR · SIMPLE TRANSPARENT PRICING
          </div>

          <h1
            className="px-shine-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px,6vw,64px)",
              fontWeight: 900,
              letterSpacing: "4px",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            START FREE.<br />UPGRADE ANYTIME.
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "rgba(226,217,243,0.45)",
            maxWidth: 440,
            margin: "0 auto",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}>
            No credit card required to start. Brilliant unlocks the full platform
            — cancel anytime.
          </p>
        </header>

        {/* ── Already subscribed ── */}
        {isSubscribed && (
          <div
            className="mb-12 rounded-xl p-5 text-center"
            style={{ border:"1px solid rgba(0,229,255,0.3)", background:"rgba(0,229,255,0.04)" }}
          >
            <p style={{ fontFamily:"var(--font-body)", fontSize:13, color:"#00e5ff", fontStyle:"italic" }}>
              ◈ You&apos;re already a Brilliant subscriber. Thank you!{" "}
              <Link href="/settings/billing" className="underline hover:text-white transition-colors">
                Manage →
              </Link>
            </p>
          </div>
        )}

        {/* ── Pricing grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">

          {/* Free */}
          <div
            className="px-card-hover"
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              border: "1px solid rgba(122,106,154,0.2)",
              background: "rgba(12,5,32,0.7)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"3px", color:"rgba(122,106,154,0.6)", marginBottom:12 }}>
              FREE FOREVER
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:900, color:"#e2d9f3" }}>$0</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"rgba(122,106,154,0.4)", marginBottom:20 }}>
              no payment needed
            </div>

            <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px", flex:1 }}>
              {[
                "5 AI personas",
                "Claude Haiku — 3 ⟡/msg",
                "Claude Sonnet — 10 ⟡/msg",
                "Claude Opus — 25 ⟡/msg",
                "15 AI generates / week",
                "5 transmissions / day",
                "30 memory cards / character",
                "50 bonus marks / day",
              ].map((item) => (
                <li key={item} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"4px 0", fontFamily:"var(--font-body)", fontSize:12, color:"rgba(226,217,243,0.5)" }}>
                  <span style={{ color:"rgba(122,106,154,0.5)", flexShrink:0, marginTop:1 }}>◦</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              style={{
                fontFamily:"var(--font-mono)",
                fontSize:9,
                letterSpacing:"2px",
                fontWeight:700,
                textAlign:"center",
                padding:"12px 0",
                borderRadius:10,
                display:"block",
                border:"1px solid rgba(122,106,154,0.25)",
                color:"rgba(122,106,154,0.6)",
              }}
              className="hover:border-purple-400/30 hover:text-purple-300 transition-all"
            >
              GET STARTED FREE
            </Link>
          </div>

          {/* Brilliant 1-month (HIGHLIGHT) */}
          <div
            className="px-card-hover"
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              border: "1px solid rgba(0,229,255,0.45)",
              background: "rgba(0,229,255,0.04)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 60px rgba(0,229,255,0.08), inset 0 0 30px rgba(0,229,255,0.03)",
            }}
          >
            {/* Top glow line */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,#00e5ff 50%,transparent)", boxShadow:"0 0 15px rgba(0,229,255,0.5)" }} />

            <div className="flex items-center justify-between mb-3">
              <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"3px", color:"rgba(0,229,255,0.7)" }}>
                ◈ MOST POPULAR
              </div>
              <div style={{
                fontFamily:"var(--font-mono)",
                fontSize:7,
                letterSpacing:"1px",
                color:"rgba(0,0,0,0.9)",
                background:"#00e5ff",
                padding:"3px 8px",
                borderRadius:20,
                fontWeight:700,
              }}>
                BRILLIANT
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:900, color:"#00e5ff", textShadow:"0 0 30px rgba(0,229,255,0.4)" }}>$9.99</span>
              <span style={{ fontFamily:"var(--font-body)", fontSize:11, color:"rgba(122,106,154,0.6)" }}>/ month</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"rgba(0,229,255,0.4)", marginBottom:20 }}>
              $0.33 / day · one-time charge
            </div>

            <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px", flex:1 }}>
              {[
                "Unlimited personas",
                "FREE Haiku messages",
                "Sonnet — 8 ⟡/msg (save 20%)",
                "Opus — 19 ⟡/msg (save 24%)",
                "50 AI generates / week",
                "25 transmissions / day",
                "Unlimited memory cards",
                "100 bonus marks / day",
                "◈ Brilliant badge",
                "Priority support",
              ].map((item) => (
                <li key={item} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"4px 0", fontFamily:"var(--font-body)", fontSize:12, color:"rgba(226,217,243,0.6)" }}>
                  <span style={{ color:"rgba(0,229,255,0.6)", flexShrink:0, marginTop:1 }}>◈</span>
                  {item}
                </li>
              ))}
            </ul>

            {user && !isSubscribed ? (
              <PayPalCTAButton tier="brilliant_1mo" highlight label="◈ GO BRILLIANT →" />
            ) : !user ? (
              <Link
                href="/signup?next=/subscribe"
                style={{
                  fontFamily:"var(--font-mono)",
                  fontSize:10,
                  letterSpacing:"3px",
                  fontWeight:700,
                  textAlign:"center",
                  padding:"14px 0",
                  borderRadius:10,
                  display:"block",
                  background:"#00e5ff",
                  color:"#000",
                }}
              >
                GET STARTED →
              </Link>
            ) : (
              <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"2px", color:"rgba(0,229,255,0.5)", textAlign:"center", padding:"12px 0" }}>
                ◈ ALREADY SUBSCRIBED
              </div>
            )}
          </div>

          {/* Brilliant 1-year */}
          <div
            className="px-card-hover"
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              border: "1px solid rgba(167,139,250,0.2)",
              background: "rgba(12,5,32,0.7)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"3px", color:"rgba(167,139,250,0.7)", marginBottom:12 }}>
              BEST VALUE
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:900, color:"#a78bfa" }}>$59.99</span>
              <span style={{ fontFamily:"var(--font-body)", fontSize:11, color:"rgba(122,106,154,0.6)" }}>/ year</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"rgba(167,139,250,0.4)", marginBottom:20 }}>
              $0.16 / day · save $60 vs monthly
            </div>

            <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px", flex:1 }}>
              {[
                "Everything in Brilliant",
                "Save 50% vs monthly",
                "Full year of access",
                "$0.16 / day",
                "No auto-renewal",
              ].map((item) => (
                <li key={item} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"4px 0", fontFamily:"var(--font-body)", fontSize:12, color:"rgba(226,217,243,0.5)" }}>
                  <span style={{ color:"rgba(167,139,250,0.6)", flexShrink:0, marginTop:1 }}>◈</span>
                  {item}
                </li>
              ))}
            </ul>

            {user && !isSubscribed ? (
              <PayPalCTAButton tier="brilliant_1yr" highlight={false} label="GET ANNUAL →" />
            ) : !user ? (
              <Link
                href="/signup?next=/subscribe"
                style={{
                  fontFamily:"var(--font-mono)",
                  fontSize:9,
                  letterSpacing:"2px",
                  fontWeight:700,
                  textAlign:"center",
                  padding:"12px 0",
                  borderRadius:10,
                  display:"block",
                  border:"1px solid rgba(167,139,250,0.3)",
                  color:"rgba(167,139,250,0.7)",
                }}
                className="hover:border-purple-400/50 hover:text-purple-300 transition-all"
              >
                GET ANNUAL →
              </Link>
            ) : (
              <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"2px", color:"rgba(167,139,250,0.5)", textAlign:"center", padding:"12px 0" }}>
                ◈ ALREADY SUBSCRIBED
              </div>
            )}
          </div>
        </div>

        {/* ── Comparison table ── */}
        <section className="mb-20">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex-1 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(122,106,154,0.2))" }} />
            <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"4px", color:"rgba(122,106,154,0.5)" }}>◈ FREE VS BRILLIANT</span>
            <span className="flex-1 h-px" style={{ background:"linear-gradient(to left,transparent,rgba(122,106,154,0.2))" }} />
          </div>

          <div className="overflow-x-auto">
            <div
              style={{
                borderRadius:16,
                border:"1px solid rgba(124,58,237,0.18)",
                background:"rgba(12,5,32,0.7)",
                minWidth:380,
              }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-3 px-5 py-3 border-b"
                style={{ borderColor:"rgba(255,255,255,0.04)", background:"rgba(8,4,26,0.5)" }}
              >
                <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"2px", color:"rgba(122,106,154,0.4)" }}>FEATURE</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"2px", color:"rgba(122,106,154,0.4)", textAlign:"center" }}>FREE</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"2px", color:"rgba(167,139,250,0.7)", textAlign:"center" }}>◈ BRILLIANT</span>
              </div>

              {COMPARE.map((row, i) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-3 px-5 py-3 border-b last:border-0"
                  style={{
                    borderColor: "rgba(255,255,255,0.03)",
                    background: i % 2 === 0 ? "transparent" : "rgba(124,58,237,0.02)",
                  }}
                >
                  <span style={{ fontFamily:"var(--font-body)", fontSize:11, color:"rgba(226,217,243,0.55)" }}>{row.feature}</span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"rgba(122,106,154,0.45)", textAlign:"center", tabularNums:true } as any}>{row.free}</span>
                  <span style={{
                    fontFamily:"var(--font-mono)",
                    fontSize:11,
                    color:"rgba(167,139,250,0.85)",
                    textAlign:"center",
                    fontWeight:700,
                    textShadow:"0 0 10px rgba(167,139,250,0.2)",
                  }}>
                    {row.brilliant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex-1 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(122,106,154,0.2))" }} />
            <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"4px", color:"rgba(122,106,154,0.5)" }}>◈ QUESTIONS</span>
            <span className="flex-1 h-px" style={{ background:"linear-gradient(to left,transparent,rgba(122,106,154,0.2))" }} />
          </div>

          <div className="flex flex-col gap-2">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="px-faq-item"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(124,58,237,0.16)",
                  background: "rgba(12,5,32,0.6)",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontFamily:"var(--font-body)", fontSize:13, color:"rgba(226,217,243,0.75)", fontWeight:500 }}>
                    {faq.q}
                  </span>
                  <span className="px-chevron" style={{ color:"rgba(0,229,255,0.5)", flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </summary>
                <p style={{
                  padding: "0 18px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "rgba(167,139,250,0.6)",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Security strip ── */}
        <div
          className="rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8 mb-12"
          style={{ border:"1px solid rgba(124,58,237,0.12)", background:"rgba(12,5,32,0.5)" }}
        >
          {[
            { icon: "🔒", label: "256-bit SSL", sub: "Encrypted transit" },
            { icon: "🛡", label: "PayPal Secure", sub: "PCI DSS Level 1" },
            { icon: "⟡", label: "No Subscription", sub: "One-time charges only" },
            { icon: "✓", label: "Money Back", sub: "7-day contact window" },
          ].map((b) => (
            <div key={b.label} className="text-center">
              <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"2px", color:"rgba(226,217,243,0.5)", fontWeight:700 }}>
                {b.label}
              </div>
              <div style={{ fontFamily:"var(--font-body)", fontSize:10, color:"rgba(122,106,154,0.4)", fontStyle:"italic" }}>
                {b.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-8 border-t"
          style={{ borderColor:"rgba(124,58,237,0.1)" }}
        >
          {[
            ["← Back to home", "/"],
            ["Privacy Policy", "/privacy"],
            ["Terms of Service", "/terms"],
            ["Refund Policy", "/refund"],
            ["Contact Us", "/contact"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"2px", color:"rgba(122,106,154,0.4)", textTransform:"uppercase" }}
              className="hover:text-cyan-400/60 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <p style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"1px", color:"rgba(122,106,154,0.2)", textAlign:"center", marginTop:16 }}>
          NEXCOR · 18+ PLATFORM · PAYMENTS BY PAYPAL
        </p>
      </div>
    </div>
  );
}
