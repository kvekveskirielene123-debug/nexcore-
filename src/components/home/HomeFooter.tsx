"use client";

import Link from "next/link";
import { useState } from "react";
import { DnaLogo } from "@/components/DnaLogo";
import { SupportContactDialog } from "@/components/support/SupportContactDialog";

export function HomeFooter() {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <footer
        className="border-t"
        style={{
          borderColor: "rgba(0,229,255,0.06)",
          background: "#05020d",
          padding: "48px 24px 28px",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* NEXCOR col */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DnaLogo size={18} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    letterSpacing: "3px",
                    color: "#00e5ff",
                  }}
                >
                  NEXCOR
                </span>
              </div>
              <p
                className="italic leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "rgba(122,106,154,0.7)",
                }}
              >
                Where memory meets imagination.
              </p>
            </div>

            {/* EXPLORE col */}
            <FooterCol title="EXPLORE">
              <FooterLink href="/explore">Characters</FooterLink>
              <FooterLink href="/create">Create</FooterLink>
              <FooterLink href="/store">Mark Store</FooterLink>
            </FooterCol>

            {/* LEGAL col */}
            <FooterCol title="LEGAL">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </FooterCol>

            {/* CONTACT col */}
            <FooterCol title="CONTACT">
              <button
                onClick={() => setSupportOpen(true)}
                className="text-left"
                style={footerLinkStyle}
              >
                Support
              </button>
              <FooterLink href="#story">About Us</FooterLink>
            </FooterCol>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-6"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(124,58,237,0.18), transparent)",
            }}
          />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                color: "rgba(122,106,154,0.4)",
                textTransform: "uppercase",
              }}
            >
              © {new Date().getFullYear()} NEXCOR · KURAI &amp; BIG G · BUILT WITH HEART
            </div>

            <div
              className="flex items-center gap-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "3px",
                color: "rgba(0,229,255,0.08)",
                textTransform: "uppercase",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
                <path d="M18 6 Q32 18 46 6" stroke="#00e5ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M18 24 Q32 36 46 24" stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M18 42 Q32 54 46 42" stroke="#00e5ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <line x1="18" y1="6" x2="18" y2="48" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
                <line x1="46" y1="6" x2="46" y2="48" stroke="#7c3aed" strokeWidth="1.5" opacity="0.4"/>
              </svg>
              <span>NEOLUTION SCIENCE DIVISION · BUILD 324B21 · SESTRA PROTOCOL ACTIVE</span>
            </div>
          </div>
        </div>
      </footer>

      <SupportContactDialog open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}

// ── Helpers ────────────────────────────────────────────

const footerLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "rgba(122,106,154,0.7)",
  display: "block",
  padding: "4px 0",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: "color 0.15s",
};

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "3px",
          color: "rgba(0,229,255,0.4)",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </h4>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={footerLinkStyle}
      className="hover:text-cyan-400"
    >
      {children}
    </Link>
  );
}
