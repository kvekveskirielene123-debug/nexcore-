import { Navbar } from "@/components/Navbar";
import { DnaLogo } from "@/components/DnaLogo";
import Link from "next/link";

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
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] pt-24 pb-32 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
            <DnaLogo size={32} className="mx-auto mb-4 opacity-60" />
            <div
              className="text-[9px] tracking-[4px] text-[#00e5ff]/40 uppercase mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ {versionTag}
            </div>
            <h1
              className="text-[32px] md:text-[42px] font-black tracking-[4px] text-white uppercase leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 30px rgba(0,229,255,0.2)",
              }}
            >
              {title}
            </h1>
            <p
              className="mt-3 text-base md:text-lg text-[#a78bfa] italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {subtitle}
            </p>
            <p
              className="mt-4 text-[10px] tracking-[2px] text-[#5a4a7a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Last updated · {lastUpdated}
            </p>
          </header>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent mb-12" />

          {/* Content */}
          <article
            className="legal-prose text-[#c0b8d8] leading-[1.85] text-[15px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {children}
          </article>

          {/* Footer divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent mt-16 mb-8" />

          {/* Footer */}
          <footer className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-[10px] tracking-[2px] uppercase"
                 style={{ fontFamily: "var(--font-mono)" }}>
              <Link href="/privacy" className="text-[#7a6a9a] hover:text-cyan-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[#7a6a9a] hover:text-cyan-400 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-[#7a6a9a] hover:text-cyan-400 transition-colors">
                Contact
              </Link>
              <Link href="/" className="text-[#7a6a9a] hover:text-cyan-400 transition-colors">
                Home
              </Link>
            </div>
            <p
              className="text-[9px] tracking-[3px] text-[#3a2a5a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Drafted with love by Kurai &amp; Big G · Not lawyers, but we tried · 324B21
            </p>
          </footer>
        </div>
      </main>

      {/* Scoped prose styles */}
      <style>{`
        .legal-prose h2 {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 48px 0 16px 0;
          padding-top: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legal-prose h2::before {
          content: "◈";
          color: #00e5ff;
          font-size: 14px;
          opacity: 0.6;
        }
        .legal-prose h3 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 500;
          color: #e2d9f3;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 28px 0 12px 0;
        }
        .legal-prose p { margin: 0 0 16px 0; }
        .legal-prose ul { margin: 0 0 16px 0; padding-left: 20px; list-style: none; }
        .legal-prose ul li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 8px;
        }
        .legal-prose ul li::before {
          content: "·";
          position: absolute;
          left: 0;
          color: #00e5ff;
          font-weight: bold;
          font-size: 18px;
          line-height: 1;
        }
        .legal-prose strong { color: #ffffff; font-weight: 600; }
        .legal-prose a {
          color: #00e5ff;
          text-decoration: underline;
          text-decoration-color: rgba(0,229,255,0.3);
          text-underline-offset: 2px;
          transition: all 0.15s;
        }
        .legal-prose a:hover {
          color: #7dd3fc;
          text-decoration-color: rgba(0,229,255,0.6);
        }
        .legal-prose blockquote {
          border-left: 2px solid rgba(0,229,255,0.35);
          padding: 10px 16px;
          margin: 16px 0;
          color: #a78bfa;
          font-style: italic;
          background: rgba(0,229,255,0.03);
          border-radius: 0 8px 8px 0;
        }
        .legal-prose code {
          font-family: var(--font-mono);
          font-size: 13px;
          background: rgba(124,58,237,0.12);
          padding: 2px 6px;
          border-radius: 4px;
          color: #a78bfa;
        }
      `}</style>
    </>
  );
}
