import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DnaLogo } from "@/components/DnaLogo";

export const metadata = {
  title: "Nexcor · Chat with AI Characters",
  description:
    "Create custom AI companions, chat across three AI models, and connect with a community of creators. Start free.",
};

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <circle cx="20" cy="20" r="14" stroke="#00e5ff" strokeWidth="1.5" fill="rgba(0,229,255,0.05)"/>
        <circle cx="20" cy="20" r="5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="1.2"/>
        <path d="M20 6 Q14 13 20 20 Q26 27 20 34" stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M6 20 Q13 14 20 20 Q27 26 34 20" stroke="#00e5ff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    title: "AI Characters",
    desc: "Chat with richly designed personas — each with their own personality, memory, and voice.",
    color: "0,229,255",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <rect x="6" y="10" width="28" height="20" rx="4" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.06)"/>
        <path d="M14 18 L18 22 L26 15" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="30" cy="10" r="5" fill="#a78bfa" opacity="0.9"/>
        <path d="M28 10 L30 12 L33 8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Build Your Own",
    desc: "Design AI companions with custom personas, memory cards, and personality traits — all yours.",
    color: "167,139,250",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <circle cx="8" cy="20" r="4.5" stroke="#00e5ff" strokeWidth="1.4" fill="rgba(0,229,255,0.1)"/>
        <circle cx="20" cy="10" r="4.5" stroke="#a78bfa" strokeWidth="1.4" fill="rgba(167,139,250,0.1)"/>
        <circle cx="32" cy="20" r="4.5" stroke="#00e5ff" strokeWidth="1.4" fill="rgba(0,229,255,0.1)"/>
        <circle cx="20" cy="30" r="4.5" stroke="#a78bfa" strokeWidth="1.4" fill="rgba(167,139,250,0.1)"/>
        <line x1="12" y1="18" x2="16" y2="12" stroke="rgba(0,229,255,0.4)" strokeWidth="1"/>
        <line x1="24" y1="12" x2="28" y2="18" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
        <line x1="28" y1="22" x2="24" y2="28" stroke="rgba(0,229,255,0.4)" strokeWidth="1"/>
        <line x1="16" y1="28" x2="12" y2="22" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
        <circle cx="20" cy="20" r="3" fill="rgba(0,229,255,0.3)" stroke="#00e5ff" strokeWidth="1"/>
      </svg>
    ),
    title: "Signal Feed",
    desc: "Share posts, discover creators, and connect with a community that gets the AI companion space.",
    color: "0,229,255",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <path d="M10 20 L16 14 L22 20 L28 12 L34 20" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="6" y="26" width="28" height="8" rx="2" fill="rgba(0,229,255,0.06)" stroke="rgba(0,229,255,0.3)" strokeWidth="1"/>
        <rect x="6" y="26" width="18" height="8" rx="2" fill="rgba(0,229,255,0.2)"/>
        <text x="20" y="32" textAnchor="middle" fill="#00e5ff" fontSize="6" fontFamily="monospace" fontWeight="bold">HAIKU · SONNET · OPUS</text>
      </svg>
    ),
    title: "Three AI Models",
    desc: "Access Claude Haiku (fast & free), Sonnet (smart), and Opus (most capable). You choose.",
    color: "0,229,255",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <rect x="6" y="8" width="28" height="18" rx="3" fill="rgba(167,139,250,0.06)" stroke="#a78bfa" strokeWidth="1.5"/>
        <line x1="10" y1="14" x2="30" y2="14" stroke="rgba(167,139,250,0.5)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="18" x2="24" y2="18" stroke="rgba(0,229,255,0.4)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="22" x2="26" y2="22" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeLinecap="round"/>
        <path d="M22 30 L26 36 L30 30" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
        <circle cx="28" cy="33" r="4" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1"/>
        <text x="28" y="35" textAnchor="middle" fill="#a78bfa" fontSize="5" fontFamily="monospace">∞</text>
      </svg>
    ),
    title: "Persistent Memory",
    desc: "Characters remember conversations, store personality traits, and grow richer over time.",
    color: "167,139,250",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <polygon points="20,6 24,16 35,16 27,22 30,33 20,27 10,33 13,22 5,16 16,16" stroke="#00e5ff" strokeWidth="1.4" fill="rgba(0,229,255,0.08)" strokeLinejoin="round"/>
        <polygon points="20,12 22,18 29,18 23,22 25,29 20,25 15,29 17,22 11,18 18,18" fill="rgba(0,229,255,0.25)" stroke="rgba(167,139,250,0.5)" strokeWidth="0.8"/>
        <text x="20" y="24" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">⟡</text>
      </svg>
    ),
    title: "Marks Economy",
    desc: "Earn daily Marks, gift them to creators, spend them on AI messages. Real value, real community.",
    color: "0,229,255",
  },
];

const PLANS = [
  {
    label: "FREE",
    price: "$0",
    period: "forever",
    color: "122,106,154",
    items: ["5 personas", "Haiku (3 ⟡/msg)", "15 AI generates/week", "5 transmissions/day"],
    cta: "Get Started Free",
    ctaHref: "/signup",
    highlight: false,
  },
  {
    label: "BRILLIANT",
    price: "$9.99",
    period: "/ month",
    color: "0,229,255",
    items: ["Unlimited personas", "Free Haiku messages", "50 AI generates/week", "25 transmissions/day", "◈ Brilliant badge"],
    cta: "Go Brilliant",
    ctaHref: "/signup?next=/subscribe",
    highlight: true,
  },
  {
    label: "BRILLIANT ANNUAL",
    price: "$59.99",
    period: "/ year",
    color: "167,139,250",
    items: ["Everything in Brilliant", "Save $60 vs monthly", "$0.16 per day", "Priority support"],
    cta: "Best Value",
    ctaHref: "/signup?next=/subscribe",
    highlight: false,
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/explore");

  return (
    <div className="min-h-screen bg-[#05020d] overflow-x-hidden">
      <style>{`
        @keyframes nx-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes nx-pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes nx-shine {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes nx-scan {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        .nx-hero-float { animation: nx-float 6s ease-in-out infinite; }
        .nx-hero-float-2 { animation: nx-float 8s ease-in-out infinite 1s; }
        .nx-shine-text {
          background: linear-gradient(90deg, #a78bfa 0%, #fff 40%, #00e5ff 55%, #fff 70%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: nx-shine 4s linear infinite;
        }
        .nx-glow-pulse { animation: nx-pulse-glow 3s ease-in-out infinite; }
        .nx-card-hover {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .nx-card-hover:hover {
          transform: translateY(-4px) scale(1.01);
        }
        .nx-btn-primary {
          transition: all 0.2s;
        }
        .nx-btn-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 0 32px rgba(0,229,255,0.4);
        }
        .nx-scan-line {
          animation: nx-scan 8s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* ── Background grid + orbs ── */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle,rgba(124,58,237,0.08) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:-200, left:"30%", width:900, height:700, background:"radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:-300, right:-200, width:800, height:800, background:"radial-gradient(ellipse,rgba(0,229,255,0.04) 0%,transparent 65%)" }} />
      </div>

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-14"
        style={{
          background: "rgba(5,2,13,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(124,58,237,0.14)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <DnaLogo size={28} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "4px",
              color: "#e2d9f3",
            }}
          >
            NEXCOR
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {[["About", "/about"], ["Pricing", "/pricing"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                color: "rgba(122,106,154,0.6)",
                padding: "6px 10px",
                textTransform: "uppercase",
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "2px",
              color: "rgba(167,139,250,0.8)",
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(124,58,237,0.25)",
            }}
            className="hover:border-purple-400/50 hover:text-purple-300 transition-all"
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
              padding: "7px 16px",
              borderRadius: 8,
              background: "#00e5ff",
              fontWeight: 700,
            }}
            className="nx-btn-primary"
          >
            SIGN UP
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-14">

        {/* Floating DNA logo */}
        <div className="nx-hero-float mb-8" style={{ filter: "drop-shadow(0 0 40px rgba(0,229,255,0.25))" }}>
          <DnaLogo size={80} interactive />
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "5px",
            color: "rgba(124,58,237,0.7)",
            marginBottom: 20,
          }}
        >
          ◈ NEXCOR · CHARACTER AI NETWORK
        </div>

        <h1
          className="nx-shine-text"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(44px,8vw,88px)",
            fontWeight: 900,
            letterSpacing: "4px",
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          CHAT WITH<br />AI CHARACTERS
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            color: "rgba(226,217,243,0.55)",
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: 36,
            fontStyle: "italic",
          }}
        >
          Build custom AI companions. Unlock your imagination. Connect with creators
          who share your world.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/signup"
            className="nx-btn-primary"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              fontWeight: 700,
              color: "#000",
              background: "#00e5ff",
              padding: "14px 32px",
              borderRadius: 12,
              whiteSpace: "nowrap",
            }}
          >
            GET STARTED FREE →
          </Link>
          <Link
            href="/pricing"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "2px",
              color: "rgba(167,139,250,0.7)",
              padding: "13px 28px",
              borderRadius: 12,
              border: "1px solid rgba(124,58,237,0.3)",
              whiteSpace: "nowrap",
            }}
            className="hover:border-purple-400/50 hover:text-purple-300 transition-all"
          >
            SEE PRICING
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 opacity-60">
          {[
            { value: "3", label: "AI MODELS" },
            { value: "∞", label: "CHARACTERS" },
            { value: "18+", label: "PLATFORM" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#00e5ff",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "2px",
                  color: "rgba(122,106,154,0.5)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "2px", color: "#a78bfa" }}>SCROLL</div>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="#a78bfa" strokeWidth="1.2"/>
            <circle cx="8" cy="7" r="2" fill="#a78bfa">
              <animate attributeName="cy" values="7;14;7" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-24">
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(122,106,154,0.2))" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "4px", color: "rgba(122,106,154,0.5)" }}>
            ◈ WHAT YOU GET
          </span>
          <span className="flex-1 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(122,106,154,0.2))" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="nx-card-hover group"
              style={{
                padding: "24px",
                borderRadius: 16,
                border: `1px solid rgba(${f.color},0.16)`,
                background: "rgba(12,5,32,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: `linear-gradient(90deg,transparent,rgba(${f.color},0.5),transparent)`,
                }}
              />
              <div style={{ filter: `drop-shadow(0 0 10px rgba(${f.color},0.5))`, marginBottom: 14 }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: `rgba(${f.color},0.6)`,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(122,106,154,0.2))" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "4px", color: "rgba(122,106,154,0.5)" }}>
            ◈ SIMPLE PRICING
          </span>
          <span className="flex-1 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(122,106,154,0.2))" }} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "rgba(122,106,154,0.5)",
            textAlign: "center",
            marginBottom: 32,
            fontStyle: "italic",
          }}
        >
          Start free. Upgrade when you&apos;re ready.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.label}
              className="nx-card-hover"
              style={{
                padding: "24px",
                borderRadius: 16,
                border: plan.highlight
                  ? "1px solid rgba(0,229,255,0.4)"
                  : `1px solid rgba(${plan.color},0.18)`,
                background: plan.highlight
                  ? "rgba(0,229,255,0.04)"
                  : "rgba(12,5,32,0.6)",
                boxShadow: plan.highlight
                  ? "0 0 40px rgba(0,229,255,0.08)"
                  : "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "2px",
                  color: `rgba(${plan.color},0.7)`,
                  marginBottom: 12,
                }}
              >
                {plan.label}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 34,
                    fontWeight: 900,
                    color: plan.highlight ? "#00e5ff" : "#e2d9f3",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    color: "rgba(122,106,154,0.5)",
                  }}
                >
                  {plan.period}
                </span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", flex: 1 }}>
                {plan.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 11,
                      color: `rgba(${plan.color},0.65)`,
                      padding: "3px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: `rgba(${plan.color},0.8)`, fontSize: 9 }}>◈</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "2px",
                  fontWeight: 700,
                  textAlign: "center",
                  padding: "11px 0",
                  borderRadius: 10,
                  display: "block",
                  background: plan.highlight ? "#00e5ff" : "transparent",
                  color: plan.highlight ? "#000" : `rgba(${plan.color},0.8)`,
                  border: plan.highlight ? "none" : `1px solid rgba(${plan.color},0.3)`,
                }}
                className="nx-btn-primary"
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/pricing"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "2px",
              color: "rgba(0,229,255,0.5)",
            }}
            className="hover:text-cyan-400 transition-colors underline underline-offset-4"
          >
            SEE FULL COMPARISON →
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="relative z-10 text-center px-4 py-24"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-16 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(124,58,237,0.5))" }} />
          <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"4px", color:"rgba(124,58,237,0.7)" }}>◈ JOIN THE NETWORK</span>
          <span className="w-16 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(124,58,237,0.5))" }} />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px,5vw,56px)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "4px",
            marginBottom: 16,
            textShadow: "0 0 60px rgba(124,58,237,0.3)",
          }}
        >
          READY TO START?
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "rgba(226,217,243,0.45)",
            maxWidth: 400,
            margin: "0 auto 32px",
            fontStyle: "italic",
          }}
        >
          No credit card required. Free forever, upgrade when you&apos;re ready.
        </p>

        <Link
          href="/signup"
          className="nx-btn-primary inline-block"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "3px",
            fontWeight: 700,
            color: "#000",
            background: "#00e5ff",
            padding: "16px 40px",
            borderRadius: 14,
          }}
        >
          CREATE FREE ACCOUNT →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 border-t px-4 md:px-10 py-10"
        style={{ borderColor: "rgba(124,58,237,0.12)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <DnaLogo size={22} />
            <span style={{ fontFamily:"var(--font-display)", fontSize:13, fontWeight:900, letterSpacing:"4px", color:"rgba(226,217,243,0.4)" }}>
              NEXCOR
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["Refunds", "/refund"],
              ["FAQ", "/faq"],
              ["Contact", "/contact"],
              ["About", "/about"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "2px",
                  color: "rgba(122,106,154,0.4)",
                  textTransform: "uppercase",
                }}
                className="hover:text-cyan-400/60 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <p style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"1px", color:"rgba(122,106,154,0.25)" }}>
            © {new Date().getFullYear()} NEXCOR · 18+ ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
