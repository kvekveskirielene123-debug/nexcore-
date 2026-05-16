import Link from "next/link";

export const metadata = {
  title: "Signal Log · Nexcor Blog",
  description: "Updates, announcements, and stories from the two people building Nexcor.",
};

const POSTS = [
  {
    tag:      "ANNOUNCEMENT",
    tagColor: "#00e5ff",
    date:     "May 16, 2026",
    readTime: "4 min read",
    title:    "Nexcor is live — welcome to the Signal",
    excerpt:
      "Today we're officially opening Nexcor to everyone. Explore AI characters, post on the Signal Feed, and now chat directly with other users. Here's everything that's live on day one.",
    index:    "001",
  },
  {
    tag:      "FEATURE",
    tagColor: "#c084fc",
    date:     "May 16, 2026",
    readTime: "3 min read",
    title:    "Direct Messages — chat with real users",
    excerpt:
      "You can now send direct messages to any Nexcor user. Conversations are private, delivered in real time, and visible only to you and the other person.",
    index:    "002",
  },
  {
    tag:      "DEEP DIVE",
    tagColor: "#a78bfa",
    date:     "May 15, 2026",
    readTime: "7 min read",
    title:    "How AI character memory works on Nexcor",
    excerpt:
      "A behind-the-scenes look at how long-term memory, conversation history, and system prompts combine to make AI characters feel consistent — and what the limits are.",
    index:    "003",
  },
];

/* ─── Animated signal broadcast logo ──────────────────────────────────────── */

function SignalLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>

      {/* Ambient glow blob */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background:
            "radial-gradient(circle, rgba(0,229,255,0.1) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
        }}
      />

      <svg width="92" height="92" viewBox="0 0 92 92" fill="none" aria-hidden>

        {/* ── Outer spinning dashed ring ── */}
        <circle cx="46" cy="46" r="43" stroke="rgba(0,229,255,0.12)" strokeWidth="0.8" strokeDasharray="3 6" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 46 46" to="360 46 46" dur="22s" repeatCount="indefinite"/>
        </circle>

        {/* ── Broadcast arc 3 (outermost) ── */}
        <path
          d="M14 46 A32 32 0 0 1 46 14"
          stroke="rgba(0,229,255,0.22)" strokeWidth="1.4" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur="2.4s" begin="0.6s" repeatCount="indefinite"/>
        </path>
        <path
          d="M78 46 A32 32 0 0 0 46 14"
          stroke="rgba(0,229,255,0.22)" strokeWidth="1.4" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur="2.4s" begin="0.6s" repeatCount="indefinite"/>
        </path>

        {/* ── Broadcast arc 2 (mid) ── */}
        <path
          d="M22 46 A24 24 0 0 1 46 22"
          stroke="rgba(0,229,255,0.38)" strokeWidth="1.6" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.4s" begin="0.3s" repeatCount="indefinite"/>
        </path>
        <path
          d="M70 46 A24 24 0 0 0 46 22"
          stroke="rgba(0,229,255,0.38)" strokeWidth="1.6" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.4s" begin="0.3s" repeatCount="indefinite"/>
        </path>

        {/* ── Broadcast arc 1 (inner) ── */}
        <path
          d="M30 46 A16 16 0 0 1 46 30"
          stroke="rgba(0,229,255,0.65)" strokeWidth="1.8" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        </path>
        <path
          d="M62 46 A16 16 0 0 0 46 30"
          stroke="rgba(0,229,255,0.65)" strokeWidth="1.8" strokeLinecap="round" fill="none"
        >
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        </path>

        {/* ── Tower stem ── */}
        <line x1="46" y1="46" x2="46" y2="74" stroke="rgba(0,229,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>

        {/* ── Tower base spread ── */}
        <line x1="38" y1="74" x2="54" y2="74" stroke="rgba(0,229,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="34" y1="80" x2="58" y2="80" stroke="rgba(0,229,255,0.2)"  strokeWidth="1.2" strokeLinecap="round"/>

        {/* ── Center transmitter node ── */}
        <circle cx="46" cy="46" r="4.5" fill="rgba(5,2,13,0.9)" stroke="#00e5ff" strokeWidth="1.4"/>
        <circle cx="46" cy="46" r="2" fill="#00e5ff">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite"/>
        </circle>

        {/* ── Pulse ring from center ── */}
        <circle cx="46" cy="46" r="4.5" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1">
          <animate attributeName="r" values="4.5;22;4.5" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
        </circle>

        {/* ── Cardinal ticks ── */}
        <line x1="46" y1="3"  x2="46" y2="7"  stroke="rgba(0,229,255,0.5)"    strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="89" y1="46" x2="85" y2="46" stroke="rgba(167,139,250,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="3"  y1="46" x2="7"  y2="46" stroke="rgba(167,139,250,0.4)" strokeWidth="1.4" strokeLinecap="round"/>

        {/* ── Orbiting data dot ── */}
        <circle cx="46" cy="3" r="2" fill="#c084fc" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 46 46" to="360 46 46" dur="7s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="7s" repeatCount="indefinite"/>
        </circle>

        {/* ── Waveform line at base of tower ── */}
        <polyline
          points="32,70 34,66 36,70 38,62 40,70 42,68 44,70 46,64 48,70 50,68 52,70 54,62 56,70 58,66 60,70"
          stroke="rgba(0,229,255,0.25)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"
        >
          <animate attributeName="opacity" values="0.15;0.55;0.15" dur="1.8s" repeatCount="indefinite"/>
        </polyline>

      </svg>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ background: "#05020d" }}>

      {/* Dot grid */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      {/* Ambient glows */}
      <div aria-hidden className="fixed pointer-events-none" style={{ top: -120, left: "25%", width: 800, height: 600, background: "radial-gradient(ellipse,rgba(0,229,255,0.05) 0%,transparent 65%)", zIndex: 0 }}/>
      <div aria-hidden className="fixed pointer-events-none" style={{ bottom: -100, right: "10%", width: 600, height: 500, background: "radial-gradient(ellipse,rgba(124,58,237,0.05) 0%,transparent 65%)", zIndex: 0 }}/>

      {/* Scanline texture */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)", zIndex: 0 }}/>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pb-20">

        {/* ── Hero ── */}
        <div className="pt-12 sm:pt-20 pb-14 flex flex-col items-center text-center gap-6">

          {/* Back link — top left on mobile, absolute on desktop */}
          <Link
            href="/"
            className="self-start inline-flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase transition-colors duration-200 mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back
          </Link>

          {/* Logo */}
          <SignalLogo />

          {/* Label */}
          <div className="flex items-center gap-3">
            <div className="h-px w-10" style={{ background: "linear-gradient(to left, rgba(0,229,255,0.4), transparent)" }}/>
            <span
              className="text-[9px] tracking-[4px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.55)" }}
            >
              NEXCOR BLOG
            </span>
            <div className="h-px w-10" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.4), transparent)" }}/>
          </div>

          {/* Title */}
          <h1
            className="text-[52px] sm:text-[72px] font-black tracking-tight leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(0,229,255,0.8) 50%, rgba(167,139,250,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Signal<br/>Log
          </h1>

          <p
            className="text-[14px] sm:text-[16px] leading-relaxed max-w-md"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}
          >
            Product updates, feature deep-dives, and stories from the two people building Nexcor.
          </p>

          {/* Status chip */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.18)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#00e5ff", boxShadow: "0 0 6px #00e5ff" }}
            />
            <span
              className="text-[9px] tracking-[2.5px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
            >
              Transmitting · 3 signals logged
            </span>
          </div>

          {/* Gradient rule */}
          <div
            className="w-full max-w-lg h-px mt-2"
            style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3), rgba(167,139,250,0.2), transparent)" }}
          />
        </div>

        {/* ── Posts ── */}
        <div className="flex flex-col gap-5">
          {POSTS.map((post, i) => (
            <article
              key={i}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Colored left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: `linear-gradient(to bottom, ${post.tagColor}, transparent)` }}
              />

              {/* Top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(to right, ${post.tagColor}60, ${post.tagColor}20, transparent)` }}
              />

              <div className="pl-6 pr-6 pt-5 pb-6">

                {/* Top row: index + tag + date + read time */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {/* Index */}
                  <span
                    className="text-[10px] font-black tracking-[2px]"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.08)" }}
                  >
                    #{post.index}
                  </span>

                  {/* Tag pill */}
                  <span
                    className="text-[8px] tracking-[2.5px] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: post.tagColor,
                      background: `${post.tagColor}12`,
                      border: `1px solid ${post.tagColor}30`,
                    }}
                  >
                    {post.tag}
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Date */}
                    <span
                      className="text-[10px]"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
                    >
                      {post.date}
                    </span>
                    <span style={{ color: "rgba(122,106,154,0.25)", fontSize: 10 }}>·</span>
                    {/* Read time */}
                    <span
                      className="text-[10px]"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
                    >
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="text-[19px] sm:text-[22px] font-black mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.94)" }}
                >
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p
                  className="text-[13px] leading-[1.7] mb-6"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.62)" }}
                >
                  {post.excerpt}
                </p>

                {/* Footer row */}
                <div className="flex items-center gap-3">
                  {/* Transmission indicator */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="2" fill="rgba(122,106,154,0.4)"/>
                      <circle cx="5" cy="5" r="4" stroke="rgba(122,106,154,0.15)" strokeWidth="0.8" fill="none"/>
                    </svg>
                    <span
                      className="text-[8px] tracking-[2px] uppercase"
                      style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
                    >
                      Full post incoming
                    </span>
                  </div>

                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${post.tagColor}15, transparent)` }}/>

                  {/* Decorative signal bars */}
                  <div className="flex items-end gap-0.5">
                    {[3, 5, 7, 5, 3].map((h, j) => (
                      <div
                        key={j}
                        style={{
                          width: 2,
                          height: h,
                          borderRadius: 1,
                          background: post.tagColor,
                          opacity: 0.25 + j * 0.06,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── CTA block ── */}
        <div
          className="mt-10 relative rounded-2xl overflow-hidden p-8 sm:p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(124,58,237,0.22)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), rgba(0,229,255,0.2), transparent)" }}/>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>

          <p
            className="text-[15px] font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}
          >
            Full articles coming soon
          </p>
          <p
            className="text-[13px] mb-7 max-w-xs mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.55)" }}
          >
            We&apos;re writing them now. Get in touch if you have a question about any of these topics.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all duration-300 active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.09)",
              border: "1px solid rgba(0,229,255,0.28)",
              color: "#00e5ff",
              boxShadow: "0 0 24px rgba(0,229,255,0.06)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Get in touch
          </Link>
        </div>

        {/* Footer tag */}
        <div className="flex items-center gap-4 mt-12 justify-center">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, rgba(122,106,154,0.12), transparent)" }}/>
          <p
            className="text-[8px] tracking-[3px] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.18)" }}
          >
            NEXCOR · SIGNAL LOG · 324B21
          </p>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, rgba(122,106,154,0.12), transparent)" }}/>
        </div>

      </div>
    </div>
  );
}
