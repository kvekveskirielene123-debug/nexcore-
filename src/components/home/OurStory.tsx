"use client";

import { StoryCanvas } from "@/components/StoryCanvas";
import { FadeInSection } from "./FadeInSection";

export function OurStory() {
  return (
    <section
      id="story"
      className="relative py-24 px-6 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #05020d 0%, #08021a 50%, #05020d 100%)",
      }}
    >
      {/* Animated DNA helix canvas */}
      <StoryCanvas />

      {/* 🥚 SESTRA watermark */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none select-none"
        style={{
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(60px, 12vw, 120px)",
          fontWeight: 900,
          color: "rgba(124,58,237,0.028)",
          letterSpacing: "16px",
          whiteSpace: "nowrap",
          zIndex: 1,
        }}
      >
        SESTRA
      </div>

      {/* Purple glow */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
        }}
      />

      <FadeInSection className="relative z-[2] max-w-xl mx-auto text-center">
        {/* Section label */}
        <div
          className="mb-7 flex items-center justify-center gap-3"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "5px",
            color: "rgba(0,229,255,0.3)",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 36,
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(0,229,255,0.25), transparent)",
            }}
          />
          OUR STORY
          <span
            style={{
              width: 36,
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(0,229,255,0.25), transparent)",
            }}
          />
        </div>

        {/* Body */}
        <div
          className="leading-[2] font-light"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(226,217,243,0.82)",
          }}
        >
          <p className="mb-5">
            Hey, I&apos;m{" "}
            <span style={{ color: "#00e5ff" }}>Kurai</span> &mdash; a bread baker
            who spent years searching for AI companions that actually felt{" "}
            <span style={{ color: "#fff", fontStyle: "italic" }}>
              warm, alive, and real.
            </span>
          </p>
          <p className="mb-5">
            I wanted a place where conversations could be deep, joyful, and
            memorable &mdash; where characters remember you and genuinely{" "}
            <span style={{ color: "#fff", fontStyle: "italic" }}>
              make you smile again.
            </span>
          </p>
          <p className="mb-5">
            So with my friend{" "}
            <span style={{ color: "#00e5ff" }}>Big G</span>, we started building
            Nexcor together. It&apos;s still early, still growing, and made with a
            lot of heart,{" "}
            <span style={{ color: "#fff", fontStyle: "italic" }}>
              late nights, and limited credits.
            </span>
          </p>
          <p className="mb-5">
            This is our little corner of the internet &mdash; a digital
            playground where imagination meets intelligence. A place for{" "}
            <span style={{ color: "#fff", fontStyle: "italic" }}>
              storytelling, role-play, and real emotional connections.
            </span>
          </p>
          <p className="mb-5">
            We&apos;re learning every day and pushing through. If Nexcor brings you
            even a little joy or comfort,{" "}
            <span style={{ color: "#00e5ff" }}>
              it means the world to us.
            </span>
          </p>
          <p>
            Thank you for being here with us.
            <br />
            <span style={{ color: "#fff", fontStyle: "italic" }}>
              Let&apos;s evolve together.
            </span>
          </p>
        </div>

        {/* Signature */}
        <div className="mt-10 flex flex-col items-center gap-2.5">
          <div
            className="w-12 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0,229,255,0.35), transparent)",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 12,
              letterSpacing: "4px",
              color: "rgba(167,139,250,0.65)",
            }}
          >
            &mdash; KURAI &amp; BIG G
          </div>
          {/* 🥚 Clone designation */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7,
              letterSpacing: "3px",
              color: "rgba(0,229,255,0.12)",
              marginTop: 2,
            }}
          >
            ORIG. DESIGNATION · 324B21-K &amp; 324B21-G
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
