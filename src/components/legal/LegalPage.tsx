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
      <div className="min-h-screen bg-[#05020d] relative overflow-x-hidden">

        {/* Scanline texture overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)",
          }}
        />

        {/* Ambient radial glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%)",
          }}
        />

        {/* DNA sequence tickers */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute whitespace-nowrap"
            style={{
              top: "12%",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "1px",
              color: "rgba(0,229,255,0.035)",
              animation: "lp-seq 28s linear infinite",
            }}
          >
            ATG-GCC-TAC-GGT-CAA-GTT-ACC-GGA-TCG-AAT-CCG-TTA-GCT-AAC · 324B21 · NEXCOR · ATG-GCC-TAC-GGT-CAA-GTT
          </div>
          <div
            className="absolute whitespace-nowrap"
            style={{
              top: "55%",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "1px",
              color: "rgba(0,229,255,0.025)",
              animation: "lp-seq 36s linear infinite",
              animationDelay: "-14s",
            }}
          >
            GAT-CCA-AGT-TGG-AAC-CTT-GGA-TAC-CGT-AGC · DATA CLASSIFIED · 324B21 · GAT-CCA-AGT-TGG
          </div>
          <div
            className="absolute whitespace-nowrap"
            style={{
              bottom: "8%",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "1px",
              color: "rgba(167,139,250,0.025)",
              animation: "lp-seq 22s linear infinite",
              animationDelay: "-6s",
            }}
          >
            CCG-TTA-GCT-AAC-GGT-TAC-CAG · NEOLUTION · PRIVACY · TERMS · CCG-TTA-GCT-AAC
          </div>
        </div>

        {/* Horizontal scan bar */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 h-px z-10"
          style={{
            background: "linear-gradient(to right, transparent, rgba(0,229,255,0.18), transparent)",
            animation: "lp-scan 9s ease-in-out infinite",
          }}
        />

        {/* ── Sticky back bar ── */}
        <div
          className="sticky top-0 z-50 flex items-center gap-3 px-5 h-12 border-b"
          style={{
            background: "rgba(5,2,13,0.9)",
            borderColor: "rgba(124,58,237,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Bottom glow line on bar */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.2), transparent)" }}
          />

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 group"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ color: "rgba(0,229,255,0.5)", transition: "color 0.2s" }}
              className="group-hover:!text-[#00e5ff]"
            >
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="group-hover:text-[#00e5ff] transition-colors duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "2.5px",
                color: "rgba(122,106,154,0.7)",
              }}
            >
              BACK
            </span>
          </button>

          <div className="flex-1" />

          <DnaLogo size={18} className="opacity-30" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "3px",
              color: "rgba(0,229,255,0.25)",
            }}
          >
            N·X·R
          </span>

          <div
            className="hidden sm:flex items-center gap-4 ml-2"
            style={{ borderLeft: "1px solid rgba(124,58,237,0.2)", paddingLeft: 12 }}
          >
            <Link
              href="/privacy"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                color: "rgba(122,106,154,0.5)",
              }}
              className="hover:text-[#00e5ff] transition-colors uppercase"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                color: "rgba(122,106,154,0.5)",
              }}
              className="hover:text-[#00e5ff] transition-colors uppercase"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 pt-16 pb-32">

          {/* Hero header */}
          <header className="mb-16 text-center flex flex-col items-center">

            {/* Large logo */}
            <DnaLogo size={56} interactive className="mb-6 opacity-80" />

            {/* Eyebrow tag */}
            <div
              className="mb-4"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "5px",
                color: "rgba(0,229,255,0.35)",
              }}
            >
              ◈ &nbsp;{versionTag}&nbsp; ◈
            </div>

            {/* Title */}
            <h1
              className="uppercase leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(34px, 7vw, 58px)",
                fontWeight: 900,
                letterSpacing: "6px",
                color: "#fff",
                textShadow: "0 0 50px rgba(0,229,255,0.25), 0 0 100px rgba(124,58,237,0.1)",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              className="mt-4 italic"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "rgba(167,139,250,0.7)",
                maxWidth: 420,
              }}
            >
              {subtitle}
            </p>

            {/* Date row */}
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3))" }} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "2.5px",
                  color: "rgba(122,106,154,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Last updated · {lastUpdated}
              </span>
              <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.3))" }} />
            </div>
          </header>

          {/* Divider */}
          <div
            className="mb-12 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.2) 40%, rgba(167,139,250,0.15) 60%, transparent)" }}
          />

          {/* Article */}
          <article
            className="legal-prose"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "rgba(192,184,216,0.9)",
              lineHeight: 1.85,
            }}
          >
            {children}
          </article>

          {/* Bottom divider */}
          <div
            className="mt-20 mb-10 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.2) 40%, rgba(0,229,255,0.15) 60%, transparent)" }}
          />

          {/* Footer */}
          <footer className="flex flex-col items-center gap-5">

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "2.5px",
                color: "rgba(122,106,154,0.7)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(124,58,237,0.2)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#00e5ff";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.7)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              BACK TO PREVIOUS PAGE
            </button>

            {/* Footer links */}
            <div
              className="flex items-center gap-5"
              style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px" }}
            >
              <Link href="/privacy" className="transition-colors duration-200" style={{ color: "rgba(122,106,154,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00e5ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(122,106,154,0.4)")}
              >PRIVACY</Link>
              <span style={{ color: "rgba(124,58,237,0.25)" }}>·</span>
              <Link href="/terms" className="transition-colors duration-200" style={{ color: "rgba(122,106,154,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00e5ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(122,106,154,0.4)")}
              >TERMS</Link>
              <span style={{ color: "rgba(124,58,237,0.25)" }}>·</span>
              <Link href="/contact" className="transition-colors duration-200" style={{ color: "rgba(122,106,154,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00e5ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(122,106,154,0.4)")}
              >CONTACT</Link>
              <span style={{ color: "rgba(124,58,237,0.25)" }}>·</span>
              <Link href="/" className="transition-colors duration-200" style={{ color: "rgba(122,106,154,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00e5ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(122,106,154,0.4)")}
              >HOME</Link>
            </div>

            <DnaLogo size={20} className="opacity-20 mt-1" />

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "3px",
                color: "rgba(58,42,90,0.8)",
                textTransform: "uppercase",
              }}
            >
              Drafted by Kurai &amp; Big G · Not lawyers, but we tried · 324B21
            </p>
          </footer>
        </main>
      </div>

      {/* ── Prose styles ── */}
      <style>{`
        @keyframes lp-seq {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-200%); }
        }
        @keyframes lp-scan {
          0%   { top: 0;    opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 0.25; }
          100% { top: 100%; opacity: 0; }
        }

        .legal-prose h2 {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 52px 0 14px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .legal-prose h2::before {
          content: "";
          display: inline-block;
          width: 3px;
          height: 18px;
          background: linear-gradient(to bottom, #00e5ff, rgba(124,58,237,0.6));
          border-radius: 2px;
          flex-shrink: 0;
        }
        .legal-prose h2::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(0,229,255,0.2), transparent);
          min-width: 20px;
        }
        .legal-prose h3 {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          color: rgba(167,139,250,0.7);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin: 28px 0 10px 0;
        }
        .legal-prose p {
          margin: 0 0 14px 0;
        }
        .legal-prose ul,
        .legal-prose ol {
          margin: 0 0 14px 0;
          padding-left: 0;
          list-style: none;
        }
        .legal-prose ol {
          counter-reset: lp-counter;
        }
        .legal-prose li {
          position: relative;
          padding: 6px 8px 6px 22px;
          margin-bottom: 2px;
          border-radius: 6px;
        }
        .legal-prose ul li::before {
          content: "·";
          position: absolute;
          left: 7px;
          top: 4px;
          color: rgba(0,229,255,0.5);
          font-size: 20px;
          line-height: 1.1;
          font-weight: bold;
        }
        .legal-prose ol li {
          counter-increment: lp-counter;
        }
        .legal-prose ol li::before {
          content: counter(lp-counter);
          position: absolute;
          left: 5px;
          top: 8px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: rgba(0,229,255,0.45);
          line-height: 1;
        }
        .legal-prose strong {
          color: #ffffff;
          font-weight: 600;
        }
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
        .legal-prose blockquote {
          border-left: 2px solid rgba(167,139,250,0.35);
          padding: 12px 18px;
          margin: 0 0 18px 0;
          color: rgba(167,139,250,0.75);
          font-style: italic;
          font-size: 14px;
          line-height: 1.75;
          background: rgba(124,58,237,0.04);
          border-radius: 0 8px 8px 0;
        }
        .legal-prose code {
          font-family: var(--font-mono);
          font-size: 12px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(167,139,250,0.12);
          padding: 1px 6px;
          border-radius: 4px;
          color: rgba(167,139,250,0.85);
        }
      `}</style>
    </>
  );
}
