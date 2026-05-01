"use client";

import Link from "next/link";
import { FadeInSection } from "./FadeInSection";

interface FinalCtaProps {
  isLoggedIn: boolean;
}

export function FinalCta({ isLoggedIn }: FinalCtaProps) {
  const title = isLoggedIn ? "PICK UP WHERE YOU LEFT OFF" : "YOUR STORY BEGINS NOW";
  const subtitle = isLoggedIn
    ? "Your characters are waiting."
    : "Free to join. No credit card. Just you and your characters.";
  const primary = isLoggedIn
    ? { label: "EXPLORE CHARACTERS", href: "/explore" }
    : { label: "CREATE FREE ACCOUNT", href: "/signup" };
  const secondary = isLoggedIn
    ? { label: "+ CREATE ENTITY", href: "/create" }
    : { label: "EXPLORE FIRST", href: "/explore" };

  return (
    <section className="relative py-24 px-6 text-center overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)",
        }}
      />

      <FadeInSection className="relative z-[2]">
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 4vw, 48px)",
            fontWeight: 900,
            letterSpacing: "4px",
            color: "#fff",
            textShadow: "0 0 40px rgba(0,229,255,0.2)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        <p
          className="mb-10 italic"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            color: "#7a6a9a",
          }}
        >
          {subtitle}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href={primary.href}
            className="px-8 py-[14px] rounded-lg font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              color: "#000",
              background: "#00e5ff",
              boxShadow: "0 0 28px rgba(0,229,255,0.28)",
            }}
          >
            {primary.label}
          </Link>
          <Link
            href={secondary.href}
            className="px-8 py-[14px] rounded-lg"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              color: "#a78bfa",
              background: "transparent",
              border: "1px solid rgba(124,58,237,0.35)",
            }}
          >
            {secondary.label}
          </Link>
        </div>
      </FadeInSection>
    </section>
  );
}
