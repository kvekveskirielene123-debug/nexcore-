"use client";

import { DnaLogo } from "@/components/DnaLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LegalPageProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  versionTag: string;
  children: React.ReactNode;
}

export function LegalPage({
  title,
  subtitle,
  lastUpdated,
  versionTag,
  children,
}: LegalPageProps) {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-[#05020d] relative">
        {/* Ambient background glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,255,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 80%, rgba(167,139,250,0.04) 0%, transparent 60%)",
          }}
        />

        {/* Sticky top bar */}
        <div
          className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 border-b border-white/5"
          style={{ background: "rgba(5,2,13,0.85)", backdropFilter: "blur(18px)" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-[#7a6a9a] hover:text-white hover:border-[#00e5ff]/30 hover:bg-white/5 transition-all duration-200"
            style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1.5px" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            BACK
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <DnaLogo size={16} className="opacity-40 shrink-0" />
            <span
              className="text-[#5a4a7a] text-[9px] tracking-[3px] uppercase truncate"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {versionTag}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/privacy"
              className="text-[#5a4a7a] hover:text-[#00e5ff] text-[9px] tracking-[2px] uppercase transition-colors hidden sm:block"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#5a4a7a] hover:text-[#00e5ff] text-[9px] tracking-[2px] uppercase transition-colors hidden sm:block"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-12 pb-32">
          {/* Header */}
          <header className="mb-14 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/15 mb-6"
              style={{ background: "rgba(0,229,255,0.04)" }}
            >
              <span
                className="text-[8px] tracking-[4px] text-[#00e5ff]/50 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ {versionTag}
              </span>
            </div>

            <h1
              className="text-[36px] md:text-[52px] font-black tracking-[6px] uppercase leading-none"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #ffffff 30%, rgba(0,229,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {title}
            </h1>

            <p
              className="mt-4 text-[15px] text-[#a78bfa]/80 italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {subtitle}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00e5ff]/25" />
              <span
                className="text-[9px] tracking-[2px] text-[#5a4a7a] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Last updated · {lastUpdated}
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00e5ff]/25" />
            </div>
          </header>

          {/* Top divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#00e5ff]/20 to-transparent mb-12" />

          {/* Content */}
          <article
            className="legal-prose text-[#c0b8d8] leading-[1.9] text-[15px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {children}
          </article>

          {/* Bottom divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#a78bfa]/20 to-transparent mt-16 mb-10" />

          {/* Footer */}
          <footer className="text-center space-y-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-[#7a6a9a] hover:text-white hover:border-[#00e5ff]/30 hover:bg-white/5 transition-all duration-200 mx-auto"
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              BACK TO PREVIOUS PAGE
            </button>

            <div
              className="flex items-center justify-center gap-6 text-[9px] tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Link href="/privacy" className="text-[#7a6a9a] hover:text-[#00e5ff] transition-colors">
                Privacy
              </Link>
              <span className="text-[#3a2a5a]">·</span>
              <Link href="/terms" className="text-[#7a6a9a] hover:text-[#00e5ff] transition-colors">
                Terms
              </Link>
              <span className="text-[#3a2a5a]">·</span>
              <Link href="/contact" className="text-[#7a6a9a] hover:text-[#00e5ff] transition-colors">
                Contact
              </Link>
              <span className="text-[#3a2a5a]">·</span>
              <Link href="/" className="text-[#7a6a9a] hover:text-[#00e5ff] transition-colors">
                Home
              </Link>
            </div>

            <p
              className="text-[8px] tracking-[3px] text-[#3a2a5a] uppercase pt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Drafted with love by Kurai &amp; Big G · Not lawyers, but we tried · 324B21
            </p>
          </footer>
        </main>
      </div>

      {/* Scoped prose styles */}
      <style>{`
        .legal-prose h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin: 52px 0 16px 0;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(90deg, rgba(0,229,255,0.06) 0%, transparent 100%);
          border-left: 2px solid rgba(0,229,255,0.4);
          border-radius: 0 8px 8px 0;
        }
        .legal-prose h2::before {
          content: "◈";
          color: #00e5ff;
          font-size: 12px;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .legal-prose h3 {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          color: #a78bfa;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 28px 0 12px 0;
          opacity: 0.85;
        }
        .legal-prose p { margin: 0 0 16px 0; }
        .legal-prose ul, .legal-prose ol { margin: 0 0 16px 0; padding-left: 0; list-style: none; }
        .legal-prose ol { counter-reset: legal-counter; }
        .legal-prose ul li, .legal-prose ol li {
          position: relative;
          padding: 8px 12px 8px 28px;
          margin-bottom: 4px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .legal-prose ul li:hover, .legal-prose ol li:hover {
          background: rgba(255,255,255,0.025);
        }
        .legal-prose ul li::before {
          content: "·";
          position: absolute;
          left: 10px;
          color: #00e5ff;
          font-weight: bold;
          font-size: 20px;
          line-height: 1.2;
          opacity: 0.6;
        }
        .legal-prose ol li {
          counter-increment: legal-counter;
        }
        .legal-prose ol li::before {
          content: counter(legal-counter);
          position: absolute;
          left: 8px;
          color: #00e5ff;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          opacity: 0.6;
          top: 11px;
        }
        .legal-prose strong { color: #ffffff; font-weight: 600; }
        .legal-prose a {
          color: #00e5ff;
          text-decoration: underline;
          text-decoration-color: rgba(0,229,255,0.3);
          text-underline-offset: 3px;
          transition: all 0.15s;
        }
        .legal-prose a:hover {
          color: #7dd3fc;
          text-decoration-color: rgba(0,229,255,0.6);
        }
        .legal-prose blockquote {
          border-left: 2px solid rgba(167,139,250,0.4);
          padding: 14px 20px;
          margin: 0 0 20px 0;
          color: #a78bfa;
          font-style: italic;
          background: rgba(167,139,250,0.05);
          border-radius: 0 10px 10px 0;
          font-size: 14px;
          line-height: 1.7;
        }
        .legal-prose code {
          font-family: var(--font-mono);
          font-size: 12px;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(167,139,250,0.15);
          padding: 2px 6px;
          border-radius: 4px;
          color: #a78bfa;
        }
      `}</style>
    </>
  );
}
