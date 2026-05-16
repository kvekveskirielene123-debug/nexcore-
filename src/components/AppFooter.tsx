import Link from "next/link";

/* ─── Nav columns ─────────────────────────────────────────────────────────── */

const FEATURES_LINKS = [
  { label: "Features",             href: "/explore" },
  { label: "FAQ",                  href: "/faq" },
  { label: "Get App",              href: "/get-app" },
  { label: "Create a Character",   href: "/create" },
  { label: "Your Privacy Choices", href: "/privacy#choices" },
  { label: "Delete Account",       href: "/settings#danger" },
  { label: "Export Data",          href: "/export-data" },
];

const EXPLORE_LINKS = [
  { label: "Explore",            href: "/explore" },
  { label: "Events & Tags",      href: "/feed" },
  { label: "Multilingual",       href: "/faq#multilingual" },
  { label: "More AI Characters", href: "/explore" },
  { label: "Feeling Curious",    href: "/explore" },
];

const OVERVIEW_LINKS = [
  { label: "Overview",             href: "/about" },
  { label: "About Us",             href: "/about" },
  { label: "Nexcor Blog",          href: "/blog" },
  { label: "Contact & Support",    href: "/contact" },
  { label: "Terms of Service",     href: "/terms" },
  { label: "Privacy Policy",       href: "/privacy" },
  { label: "Community Guidelines", href: "/guidelines" },
];

/* ─── Social icons (custom SVG paths) ────────────────────────────────────── */

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.74a8.17 8.17 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.02-.13z"/>
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

const SOCIALS = [
  { label: "Discord",    Icon: DiscordIcon,  href: "#" },
  { label: "Reddit",     Icon: RedditIcon,   href: "#" },
  { label: "TikTok",     Icon: TikTokIcon,   href: "#" },
  { label: "Twitter / X",Icon: TwitterXIcon, href: "#" },
  { label: "Instagram",  Icon: InstagramIcon,href: "#" },
];

/* ─── Footer link ─────────────────────────────────────────────────────────── */

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] leading-loose transition-all duration-300 hover:text-[#00e5ff] hover:[filter:drop-shadow(0_0_6px_rgba(0,229,255,0.5))]"
        style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.7)" }}
      >
        {label}
      </Link>
    </li>
  );
}

/* ─── Main footer ─────────────────────────────────────────────────────────── */

export function AppFooter() {
  return (
    <footer
      style={{
        background: "linear-gradient(to bottom, rgba(5,2,13,0) 0%, #05020d 60px)",
        borderTop: "1px solid rgba(124,58,237,0.15)",
      }}
    >
      {/* Top shimmer */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,229,255,0.2), rgba(124,58,237,0.2), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-8">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Brand column ── */}
          <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-1">

            {/* Logo + name */}
            <div className="flex items-center gap-3">
              {/* DNA helix icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.1)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8 2 6 5 6 8s2 5 4 6-4 3-4 6 2 2 4 2" stroke="rgba(0,229,255,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 2c4 0 6 3 6 6s-2 5-4 6 4 3 4 6-2 2-4 2" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9"  cy="8"  r="1" fill="rgba(0,229,255,0.6)"/>
                  <circle cx="15" cy="14" r="1" fill="rgba(167,139,250,0.6)"/>
                </svg>
              </div>
              <div>
                <span
                  className="text-[20px] font-black tracking-[2px]"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(90deg,#00e5ff,#c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  NEXCOR
                </span>
                <p
                  className="text-[9px] tracking-[2px] uppercase -mt-0.5"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                >
                  AI Characters · Live
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p
              className="text-[13px] leading-relaxed max-w-[220px]"
              style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.6)" }}
            >
              Explore AI characters, connect with real users, and shape your universe.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    hover:scale-110
                    hover:text-[#00e5ff]
                    hover:border-[rgba(0,229,255,0.5)]
                    hover:[box-shadow:0_0_14px_rgba(0,229,255,0.3)]
                    hover:[filter:drop-shadow(0_0_6px_rgba(0,229,255,0.6))]
                  "
                  style={{
                    color: "rgba(148,163,184,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2 mt-auto">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 hover:border-[rgba(0,229,255,0.3)]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Globe icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span
                  className="text-[12px]"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(148,163,184,0.55)" }}
                >
                  English
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ── Features column ── */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-[11px] tracking-[2.5px] uppercase font-bold"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.9)" }}
            >
              Features
            </h3>
            <ul className="flex flex-col gap-0.5">
              {FEATURES_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* ── Explore column ── */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-[11px] tracking-[2.5px] uppercase font-bold"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.9)" }}
            >
              Explore
            </h3>
            <ul className="flex flex-col gap-0.5">
              {EXPLORE_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* ── Overview column ── */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-[11px] tracking-[2.5px] uppercase font-bold"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.9)" }}
            >
              Overview
            </h3>
            <ul className="flex flex-col gap-0.5">
              {OVERVIEW_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="my-10 h-px w-full"
          style={{ background: "linear-gradient(to right, transparent, rgba(124,58,237,0.2), rgba(0,229,255,0.1), transparent)" }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p
            className="text-[11px] text-center sm:text-left"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
          >
            Copyright © {new Date().getFullYear()} Nexcor. All rights reserved.
          </p>

          {/* Center: legal quick links */}
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[
              { label: "Privacy Policy",    href: "/privacy" },
              { label: "Terms of Service",  href: "/terms" },
              { label: "Community Guidelines", href: "/guidelines" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[10px] tracking-[1px] transition-all duration-300 hover:text-[#00e5ff]"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.35)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right: powered by + home */}
          <div className="flex items-center gap-4">
            <span
              className="text-[10px] tracking-[1px]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}
            >
              Powered by{" "}
              <span style={{ color: "rgba(167,139,250,0.5)" }}>Anthropic</span>
            </span>

            <Link
              href="/"
              aria-label="Home"
              className="
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-300
                hover:scale-110 hover:text-[#00e5ff]
                hover:[box-shadow:0_0_10px_rgba(0,229,255,0.2)]
              "
              style={{
                color: "rgba(122,106,154,0.4)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Very bottom note ── */}
        <p
          className="text-center text-[8px] tracking-[3px] uppercase mt-8"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.15)" }}
        >
          NEXCOR · AI CHARACTERS MAY PRODUCE INACCURATE RESPONSES · 324B21
        </p>
      </div>
    </footer>
  );
}
