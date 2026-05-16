"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface LegalPageProps {
  logo: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated: string;
  versionTag: string;
  children: React.ReactNode;
}

export function LegalPage({ logo, title, subtitle, lastUpdated, versionTag, children }: LegalPageProps) {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-[#05020d]">

        {/* Scanline texture */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)" }}
        />

        {/* Sticky nav bar */}
        <nav
          className="sticky top-0 z-50 flex items-center h-11 px-4 gap-3"
          style={{
            background: "rgba(5,2,13,0.92)",
            borderBottom: "1px solid rgba(124,58,237,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Glow line */}
          <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,0.18),transparent)" }} />

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.2)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.05)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "rgba(0,229,255,0.6)" }}>
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "2px", color: "rgba(122,106,154,0.8)" }}>BACK</span>
          </button>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-4" style={{ borderLeft: "1px solid rgba(124,58,237,0.15)", paddingLeft: 14 }}>
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Refunds", "/refund"], ["Contact", "/contact"]].map(([label, href]) => (
              <Link key={href} href={href}
                style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", color: "rgba(122,106,154,0.4)", textTransform: "uppercase" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#00e5ff")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.4)")}
              >{label}</Link>
            ))}
          </div>
        </nav>

        {/* Main */}
        <main className="relative z-10 max-w-[700px] mx-auto px-5 md:px-10 pt-14 pb-28">

          {/* ── PAGE HEADER ── */}
          <header className="mb-14 flex flex-col items-center text-center">

            {/* Logo */}
            <div className="mb-7 relative">
              {logo}
            </div>

            {/* Version eyebrow */}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "5px", color: "rgba(0,229,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>
              ◈ &nbsp;{versionTag}&nbsp; ◈
            </div>

            {/* Title */}
            <h1
              className="uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 6vw, 54px)",
                fontWeight: 900,
                letterSpacing: "7px",
                lineHeight: 1,
                color: "#fff",
                textShadow: "0 0 60px rgba(0,229,255,0.22), 0 0 120px rgba(124,58,237,0.1)",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(167,139,250,0.7)", marginTop: 14, fontStyle: "italic", maxWidth: 440 }}>
              {subtitle}
            </p>

            {/* Date */}
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-10" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.25))" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", color: "rgba(122,106,154,0.45)", textTransform: "uppercase" }}>
                Last updated · {lastUpdated}
              </span>
              <div className="h-px w-10" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.25))" }} />
            </div>
          </header>

          {/* Divider */}
          <div className="mb-12 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,229,255,0.2) 35%,rgba(167,139,250,0.15) 65%,transparent)" }} />

          {/* ── PROSE CONTENT ── */}
          <article className="legal-prose">
            {children}
          </article>

          {/* Bottom divider */}
          <div className="mt-16 mb-10 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(167,139,250,0.2) 35%,rgba(0,229,255,0.15) 65%,transparent)" }} />

          {/* ── FOOTER ── */}
          <footer className="flex flex-col items-center gap-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "2.5px", color: "rgba(122,106,154,0.7)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.2)", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00e5ff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.7)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              BACK TO PREVIOUS PAGE
            </button>

            <div className="flex items-center gap-5" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px" }}>
              {[["PRIVACY", "/privacy"], ["TERMS", "/terms"], ["REFUNDS", "/refund"], ["CONTACT", "/contact"], ["HOME", "/"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ color: "rgba(122,106,154,0.35)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#00e5ff")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.35)")}
                >{label}</Link>
              ))}
            </div>

            <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "3px", color: "rgba(58,42,90,0.7)", textTransform: "uppercase", marginTop: 4 }}>
              Drafted by Kurai &amp; Big G · Not lawyers, but we tried · 324B21
            </p>
          </footer>
        </main>
      </div>

      <style>{`
        /* ── PROSE ── */
        .legal-prose {
          counter-reset: section-counter;
          font-family: var(--font-body);
          font-size: 15px;
          color: rgba(192,184,216,0.88);
          line-height: 1.88;
        }

        /* Section headers */
        .legal-prose h2 {
          counter-increment: section-counter;
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 52px -20px 20px -20px;
          padding: 13px 20px 13px 20px;
          background: linear-gradient(90deg, rgba(0,229,255,0.07) 0%, rgba(0,229,255,0.02) 55%, transparent 100%);
          border-left: 3px solid #00e5ff;
          border-radius: 0 10px 10px 0;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #ffffff;
        }
        @media (max-width: 640px) {
          .legal-prose h2 {
            margin-left: -20px;
            margin-right: -20px;
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        .legal-prose h2::before {
          content: "§" counter(section-counter);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(0,229,255,0.45);
          flex-shrink: 0;
          min-width: 20px;
        }

        /* Sub-section headers */
        .legal-prose h3 {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(167,139,250,0.65);
          margin: 26px 0 10px 0;
        }

        /* Paragraphs */
        .legal-prose p { margin: 0 0 14px 0; }

        /* Notice / blockquote */
        .legal-prose blockquote {
          position: relative;
          border: 1px solid rgba(167,139,250,0.22);
          border-radius: 10px;
          padding: 14px 18px;
          margin: 0 0 20px 0;
          background: rgba(124,58,237,0.05);
          color: rgba(167,139,250,0.8);
          font-style: italic;
          font-size: 14px;
          line-height: 1.78;
        }
        .legal-prose blockquote::before {
          content: "◈ NOTE";
          display: block;
          font-family: var(--font-mono);
          font-style: normal;
          font-size: 8px;
          letter-spacing: 3px;
          color: rgba(167,139,250,0.5);
          margin-bottom: 8px;
        }

        /* Lists */
        .legal-prose ul, .legal-prose ol {
          margin: 0 0 16px 0;
          padding: 0;
          list-style: none;
        }
        .legal-prose ol { counter-reset: ol-counter; }
        .legal-prose li {
          position: relative;
          padding: 7px 10px 7px 22px;
          margin-bottom: 2px;
          border-radius: 7px;
          line-height: 1.7;
          transition: background 0.15s;
        }
        .legal-prose li:hover { background: rgba(255,255,255,0.025); }
        .legal-prose ul li::before {
          content: "·";
          position: absolute;
          left: 6px;
          top: 5px;
          color: rgba(0,229,255,0.5);
          font-size: 20px;
          font-weight: bold;
          line-height: 1.15;
        }
        .legal-prose ol li { counter-increment: ol-counter; }
        .legal-prose ol li::before {
          content: counter(ol-counter);
          position: absolute;
          left: 5px;
          top: 9px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: rgba(0,229,255,0.45);
          line-height: 1;
        }

        /* Inline elements */
        .legal-prose strong { color: #ffffff; font-weight: 600; }
        .legal-prose a {
          color: #00e5ff;
          text-decoration: underline;
          text-decoration-color: rgba(0,229,255,0.25);
          text-underline-offset: 3px;
          transition: color 0.15s, text-decoration-color 0.15s;
        }
        .legal-prose a:hover {
          color: #7dd3fc;
          text-decoration-color: rgba(0,229,255,0.5);
        }
        .legal-prose code {
          font-family: var(--font-mono);
          font-size: 12px;
          background: rgba(124,58,237,0.14);
          border: 1px solid rgba(167,139,250,0.15);
          padding: 1px 6px;
          border-radius: 4px;
          color: rgba(167,139,250,0.9);
        }

        /* Logo glow keyframes */
        @keyframes prv-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes trm-glow { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
      `}</style>
    </>
  );
}
