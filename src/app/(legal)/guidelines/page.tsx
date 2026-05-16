import Link from "next/link";

export const metadata = {
  title: "Community Guidelines · Nexcor",
  description: "Rules that keep Nexcor a safe, creative, and respectful space for everyone.",
};

/* ─── Animated shield logo ─────────────────────────────────────────────────── */

function ShieldLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>

      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.09) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)",
        }}
      />

      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden>

        {/* ── Outer spinning dashed orbit ── */}
        <circle cx="50" cy="50" r="47" stroke="rgba(0,229,255,0.1)" strokeWidth="0.8" strokeDasharray="4 7" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
        </circle>

        {/* ── Counter-rotating inner orbit ── */}
        <circle cx="50" cy="50" r="38" stroke="rgba(167,139,250,0.1)" strokeWidth="0.7" strokeDasharray="2 8" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="28s" repeatCount="indefinite"/>
        </circle>

        {/* ── Cardinal ticks ── */}
        <line x1="50" y1="3"  x2="50" y2="8"  stroke="rgba(0,229,255,0.5)"    strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="97" y1="50" x2="92" y2="50" stroke="rgba(167,139,250,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="3"  y1="50" x2="8"  y2="50" stroke="rgba(167,139,250,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="50" y1="97" x2="50" y2="92" stroke="rgba(0,229,255,0.3)"   strokeWidth="1.2" strokeLinecap="round"/>

        {/* ── Orbiting dot ── */}
        <circle cx="50" cy="3" r="2.2" fill="#00e5ff" opacity="0.9">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="7s" repeatCount="indefinite"/>
        </circle>

        {/* ── Shield body ── */}
        {/* Shield path: top-flat hexagon-like shield */}
        <path
          d="M50 15 L72 24 L72 50 Q72 68 50 80 Q28 68 28 50 L28 24 Z"
          fill="rgba(5,2,13,0.85)"
          stroke="url(#shieldStroke)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Shield inner glow fill */}
        <path
          d="M50 18 L69 26 L69 50 Q69 65 50 76 Q31 65 31 50 L31 26 Z"
          fill="rgba(0,229,255,0.03)"
        />

        {/* ── DNA strand left ── */}
        <path
          d="M35 28 Q42 33 35 40 Q28 47 35 52 Q42 57 35 62"
          stroke="rgba(0,229,255,0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.25;0.6;0.25" dur="2.5s" repeatCount="indefinite"/>
        </path>

        {/* ── DNA strand right ── */}
        <path
          d="M65 28 Q58 33 65 40 Q72 47 65 52 Q58 57 65 62"
          stroke="rgba(167,139,250,0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.25;0.6;0.25" dur="2.5s" begin="1.25s" repeatCount="indefinite"/>
        </path>

        {/* ── DNA rungs ── */}
        {[30, 36, 42, 48, 54, 60].map((y, i) => (
          <line
            key={y}
            x1="36" y1={y} x2="64" y2={y}
            stroke={i % 2 === 0 ? "rgba(0,229,255,0.15)" : "rgba(167,139,250,0.12)"}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        ))}

        {/* ── Checkmark (gradient) ── */}
        <path
          d="M38 50 l8 8 16-16"
          stroke="url(#checkGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ── Pulse ring from shield centre ── */}
        <ellipse cx="50" cy="50" rx="18" ry="22" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8">
          <animate attributeName="rx" values="18;32;18" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="22;38;22" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
        </ellipse>

        {/* ── Corner node dots ── */}
        <circle cx="50" cy="3" r="0" fill="rgba(0,229,255,0)"/>
        <circle cx="28" cy="24" r="1.5" fill="rgba(0,229,255,0.5)">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="72" cy="24" r="1.5" fill="rgba(167,139,250,0.5)">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="80" r="1.5" fill="rgba(0,229,255,0.4)">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.2s" begin="1.4s" repeatCount="indefinite"/>
        </circle>

        {/* ── Gradients ── */}
        <defs>
          <linearGradient id="shieldStroke" x1="28" y1="15" x2="72" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.8"/>
            <stop offset="50%"  stopColor="#a78bfa" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="checkGrad" x1="38" y1="42" x2="62" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#00e5ff"/>
            <stop offset="100%" stopColor="#c084fc"/>
          </linearGradient>
        </defs>

      </svg>
    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const RULES = [
  {
    num: "01",
    title: "Respect Everyone",
    accent: "#00e5ff",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    lead: "Treat other users the way you want to be treated. Disagreements happen — harassment doesn't. Targeted insults, slurs, threats, doxxing, or sustained campaigns against a user are not allowed. This includes behaviour that starts on Nexcor and continues elsewhere.",
    rules: [],
  },
  {
    num: "02",
    title: "No Harassment or Bullying",
    accent: "#f87171",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
    lead: null,
    rules: [
      "Do not send unwanted explicit DMs or repeatedly message someone who hasn't responded.",
      "Do not impersonate real people — users or public figures — in a way designed to deceive.",
      "Do not coordinate attacks or pile-ons against any user.",
      "Do not threaten or encourage harm against any person, group, or animal.",
    ],
  },
  {
    num: "03",
    title: "Tag NSFW Content Correctly",
    accent: "#fb923c",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
    lead: "Nexcor allows adult-oriented content for verified adult users, but it must be properly labelled.",
    rules: [
      "Mark any post with nudity, explicit sexuality, or graphic violence using the NSFW toggle before posting.",
      "Characters with adult themes must have the NSFW flag enabled — this hides them from users who opt out.",
      "Sexual content involving minors is absolutely prohibited and results in immediate removal and a report to authorities.",
    ],
  },
  {
    num: "04",
    title: "No Illegal Content",
    accent: "#ef4444",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    lead: "The following are never allowed under any circumstances:",
    rules: [
      "Child sexual abuse material (CSAM) or any sexual content depicting minors.",
      "Content that facilitates real-world violence, terrorism, or human trafficking.",
      "Malware, phishing links, or content designed to defraud users.",
      "Content that violates another person's copyright or intellectual property rights in bad faith.",
    ],
  },
  {
    num: "05",
    title: "No Spam or Platform Manipulation",
    accent: "#a78bfa",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    lead: null,
    rules: [
      "Do not post the same or substantially similar content repeatedly across the Feed.",
      "Do not create multiple accounts to evade a ban or artificially inflate engagement.",
      "Do not use bots or scripts to interact with Nexcor in unintended ways.",
      "Do not post referral codes, promotional links, or ads without prior approval.",
    ],
  },
  {
    num: "06",
    title: "Keep AI Characters Responsible",
    accent: "#c084fc",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    lead: "You are responsible for the characters you create. A character's personality prompt is yours to write, but:",
    rules: [
      "Do not instruct characters to provide real instructions for making weapons, drugs, or carrying out illegal acts.",
      "Do not create characters that impersonate real living people in a harmful or deceptive way.",
      "Do not use characters to harvest personal information from other users.",
      "Do not publish NSFW characters without the NSFW flag enabled.",
    ],
  },
  {
    num: "07",
    title: "Protect Privacy",
    accent: "#00e5ff",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    lead: null,
    rules: [
      "Do not share another user's private information (name, address, phone number) without their explicit consent.",
      "Do not screenshot and share private DM conversations without the other person's knowledge.",
      "Do not attempt to identify anonymous or pseudonymous users.",
    ],
  },
  {
    num: "08",
    title: "Signal Feed Rules",
    accent: "#22d3ee",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1 6c0 0 4-2 11-2s11 2 11 2"/>
        <path d="M1 12c0 0 4-2 11-2s11 2 11 2"/>
        <path d="M1 18c0 0 4-2 11-2s11 2 11 2"/>
      </svg>
    ),
    lead: "The Signal Feed is public. Posts expire after 24 hours. In addition to the rules above:",
    rules: [
      "Keep posts under 500 characters of meaningful content — not just repeated symbols.",
      "Images must comply with the NSFW policy above.",
      "Tag posts with relevant tags so users can filter content they want to see.",
    ],
  },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen" style={{ background: "#05020d" }}>

      {/* Dot grid */}
      <div
        aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0 }}
      />
      {/* Scanline */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)", zIndex: 0 }}/>
      {/* Ambient glows */}
      <div aria-hidden className="fixed pointer-events-none" style={{ top: -120, left: "20%", width: 800, height: 600, background: "radial-gradient(ellipse,rgba(0,229,255,0.05) 0%,transparent 65%)", zIndex: 0 }}/>
      <div aria-hidden className="fixed pointer-events-none" style={{ bottom: -80, right: "5%",  width: 600, height: 500, background: "radial-gradient(ellipse,rgba(124,58,237,0.05) 0%,transparent 65%)", zIndex: 0 }}/>

      {/* ── Sticky nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center h-11 px-4 gap-3"
        style={{ background: "rgba(5,2,13,0.92)", borderBottom: "1px solid rgba(124,58,237,0.12)", backdropFilter: "blur(20px)" }}
      >
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,0.15),transparent)" }}/>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.2)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "2px", color: "rgba(122,106,154,0.8)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          HOME
        </Link>
        <div className="flex-1"/>
        <div className="hidden sm:flex items-center gap-4" style={{ borderLeft: "1px solid rgba(124,58,237,0.15)", paddingLeft: 14 }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", color: "rgba(122,106,154,0.4)", textTransform: "uppercase" }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pb-20">

        {/* ── Hero ── */}
        <div className="pt-14 sm:pt-20 pb-14 flex flex-col items-center text-center gap-5">

          <ShieldLogo />

          {/* Label */}
          <div className="flex items-center gap-3">
            <div className="h-px w-10" style={{ background: "linear-gradient(to left, rgba(0,229,255,0.4), transparent)" }}/>
            <span className="text-[9px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.55)" }}>
              NEXCOR
            </span>
            <div className="h-px w-10" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.4), transparent)" }}/>
          </div>

          <h1
            className="text-[44px] sm:text-[62px] font-black tracking-tight leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(0,229,255,0.85) 45%, rgba(167,139,250,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Community<br/>Guidelines
          </h1>

          <p className="text-[14px] leading-relaxed max-w-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}>
            Rules that keep Nexcor creative, safe, and worth showing up to.
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full" style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 6px #00e5ff" }}/>
              <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.65)" }}>Active</span>
            </div>
            <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>Last updated · May 16, 2026</span>
            <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}>8 rules</span>
          </div>

          {/* Intro box */}
          <div
            className="w-full max-w-xl rounded-2xl px-6 py-5 text-left mt-2"
            style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)" }}
          >
            <p className="text-[13px] leading-[1.75]" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.72)" }}>
              These guidelines exist for one reason — so everyone: creators, chatters, and casual visitors — can enjoy Nexcor without running into content that ruins the experience. They apply everywhere on Nexcor: the Signal Feed, character pages, DMs, and profile bios.
            </p>
          </div>

          {/* Rule */}
          <div className="w-full h-px max-w-md" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3), rgba(167,139,250,0.2), transparent)" }}/>
        </div>

        {/* ── Rule cards ── */}
        <div className="flex flex-col gap-4">
          {RULES.map((rule) => (
            <section
              key={rule.num}
              id={`rule-${rule.num}`}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Colored left bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: `linear-gradient(to bottom, ${rule.accent}, transparent)` }}/>

              {/* Top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${rule.accent}50, ${rule.accent}18, transparent)` }}/>

              <div className="pl-6 pr-5 pt-5 pb-6">
                {/* Header row */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Number */}
                  <span
                    className="text-[28px] font-black leading-none flex-shrink-0 mt-0.5"
                    style={{ fontFamily: "var(--font-display)", color: `${rule.accent}20`, letterSpacing: "-1px" }}
                  >
                    {rule.num}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Title + icon */}
                    <div className="flex items-center gap-2.5 mb-1">
                      <span style={{ color: rule.accent }}>{rule.icon}</span>
                      <h2
                        className="text-[16px] sm:text-[18px] font-black leading-snug"
                        style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
                      >
                        {rule.title}
                      </h2>
                    </div>

                    {/* Lead text */}
                    {rule.lead && (
                      <p className="text-[13px] leading-[1.7] mt-2" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}>
                        {rule.lead}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rules list */}
                {rule.rules.length > 0 && (
                  <ul className="flex flex-col gap-2.5 ml-14">
                    {rule.rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-1" style={{ color: rule.accent, fontSize: 9 }}>◈</span>
                        <span className="text-[13px] leading-[1.65]" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}>
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* ── Enforcement + Report + Changes ── */}
        <div className="mt-5 flex flex-col gap-4">

          {/* Enforcement */}
          <div
            className="relative rounded-2xl overflow-hidden px-6 py-5"
            style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, rgba(239,68,68,0.4), transparent)" }}/>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "linear-gradient(to bottom, rgba(239,68,68,0.7), transparent)" }}/>
            <div className="flex items-center gap-2.5 mb-3 ml-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h3 className="text-[11px] tracking-[2.5px] uppercase font-bold" style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.75)" }}>
                Enforcement
              </h3>
            </div>
            <p className="text-[13px] leading-[1.7] ml-3" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}>
              Violations can result in content removal, temporary suspension, or a permanent ban depending on severity and history. The most serious violations (CSAM, real-world harm, repeated abuse) result in immediate permanent removal. We are a small team and cannot catch everything — your reports are important.
            </p>
          </div>

          {/* How to report */}
          <div
            className="relative rounded-2xl overflow-hidden px-6 py-5"
            style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.35), transparent)" }}/>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.6), transparent)" }}/>
            <div className="flex items-center gap-2.5 mb-3 ml-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              <h3 className="text-[11px] tracking-[2.5px] uppercase font-bold" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.6)" }}>
                How to Report
              </h3>
            </div>
            <p className="text-[13px] leading-[1.7] ml-3" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}>
              Use the flag/report button on any post, character, or profile. For urgent safety issues,{" "}
              <Link href="/contact" className="transition-colors" style={{ color: "rgba(0,229,255,0.7)", textDecoration: "underline", textDecorationColor: "rgba(0,229,255,0.25)" }}>
                contact us directly
              </Link>
              . We take safety reports seriously and respond promptly.
            </p>
          </div>

          {/* Changes */}
          <div
            className="relative rounded-2xl overflow-hidden px-6 py-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "linear-gradient(to bottom, rgba(167,139,250,0.4), transparent)" }}/>
            <div className="flex items-center gap-2.5 mb-3 ml-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="2" strokeLinecap="round">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <h3 className="text-[11px] tracking-[2.5px] uppercase font-bold" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.55)" }}>
                Changes to These Guidelines
              </h3>
            </div>
            <p className="text-[13px] leading-[1.7] ml-3" style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.55)" }}>
              These guidelines will evolve as Nexcor grows. Material changes will be announced and the "last updated" date above will reflect the most recent revision.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-4 mt-14 justify-center">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, rgba(122,106,154,0.12), transparent)" }}/>
          <p className="text-[8px] tracking-[3px] uppercase text-center" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}>
            DRAFTED BY KURAI & BIG G · NOT LAWYERS, BUT WE TRIED · 324B21
          </p>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, rgba(122,106,154,0.12), transparent)" }}/>
        </div>

      </div>
    </div>
  );
}
