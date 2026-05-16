import Link from "next/link";

const PRIMARY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "#" },
  { label: "Safety Center", href: "#" },
  { label: "Blog", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Cookie Policy", href: "#" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Charms Terms of Use", href: "#" },
];

export function AppFooter() {
  return (
    <footer
      className="mt-12 py-6 px-6"
      style={{
        borderTop: "1px solid rgba(124,58,237,0.1)",
        background: "rgba(5,2,13,0.4)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {PRIMARY_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[11px] hover:text-purple-400 transition-colors duration-150"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {LEGAL_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[11px] hover:text-purple-400 transition-colors duration-150"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.3)" }}
            >
              {label}
            </Link>
          ))}
        </div>
        <p
          className="text-[10px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.2)" }}
        >
          © {new Date().getFullYear()} Nexcor · AI characters may produce inaccurate responses
        </p>
      </div>
    </footer>
  );
}
