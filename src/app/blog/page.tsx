import Link from "next/link";

export const metadata = {
  title: "Blog · Nexcor",
  description: "Updates, announcements, and stories from the Nexcor team.",
};

const POSTS = [
  {
    tag: "ANNOUNCEMENT",
    date: "May 16, 2026",
    title: "Nexcor is live — welcome to the Signal",
    excerpt:
      "Today we're officially opening Nexcor to everyone. Explore AI characters, post on the Signal Feed, and now chat directly with other users. Here's everything that's live on day one.",
    tagColor: "#00e5ff",
  },
  {
    tag: "FEATURE",
    date: "May 16, 2026",
    title: "Direct Messages — chat with real users",
    excerpt:
      "You can now send direct messages to any Nexcor user. Conversations are private, delivered in real time, and end-to-end visible only to you and the other person.",
    tagColor: "#c084fc",
  },
  {
    tag: "DEEP DIVE",
    date: "May 15, 2026",
    title: "How AI character memory works on Nexcor",
    excerpt:
      "A behind-the-scenes look at how long-term memory, conversation history, and system prompts combine to make AI characters feel consistent — and what the limits are.",
    tagColor: "#a78bfa",
  },
];

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

      {/* Ambient glow */}
      <div
        aria-hidden
        className="fixed pointer-events-none"
        style={{ top: -100, left: "30%", width: 700, height: 600, background: "radial-gradient(ellipse at center,rgba(0,229,255,0.04) 0%,transparent 65%)", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-20">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 text-[11px] tracking-[2px] uppercase transition-all duration-200"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.55)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
            >
              NEXCOR BLOG
            </span>
          </div>

          <h1
            className="text-[36px] sm:text-[48px] font-black tracking-tight leading-[1.05] mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(226,217,243,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Signal Log
          </h1>
          <p
            className="text-[15px] leading-relaxed max-w-lg"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.7)" }}
          >
            Product updates, feature deep-dives, and stories from the two people building Nexcor.
          </p>

          {/* Gradient line */}
          <div className="mt-8 h-px" style={{ background: "linear-gradient(to right, rgba(0,229,255,0.3), rgba(124,58,237,0.2), transparent)" }} />
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-6">
          {POSTS.map((post, i) => (
            <article
              key={i}
              className="group relative rounded-2xl p-6 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{ background: `linear-gradient(to right, transparent, ${post.tagColor}40, transparent)` }}
              />

              {/* Tag + date */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[9px] tracking-[2.5px] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: post.tagColor,
                    background: `${post.tagColor}15`,
                    border: `1px solid ${post.tagColor}30`,
                  }}
                >
                  {post.tag}
                </span>
                <span
                  className="text-[10px]"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
                >
                  {post.date}
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-[18px] sm:text-[20px] font-black mb-3 leading-snug"
                style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.92)" }}
              >
                {post.title}
              </h2>

              {/* Excerpt */}
              <p
                className="text-[13px] leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.65)" }}
              >
                {post.excerpt}
              </p>

              {/* Read more */}
              <div className="mt-5 flex items-center gap-2 text-[11px] tracking-[1.5px] uppercase transition-all duration-300" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>
                <span>Full post coming soon</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <p
            className="text-[13px] mb-4"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.6)" }}
          >
            Full blog articles are coming soon. For now, follow us or check back regularly.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] tracking-[2px] uppercase font-bold transition-all active:scale-95"
            style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.25)", color: "#00e5ff" }}
          >
            Get in touch →
          </Link>
        </div>

        <p
          className="text-center text-[8px] tracking-[3px] uppercase mt-10"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.15)" }}
        >
          NEXCOR · SIGNAL LOG · 324B21
        </p>
      </div>
    </div>
  );
}
