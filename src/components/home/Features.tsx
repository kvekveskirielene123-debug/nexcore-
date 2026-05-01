"use client";

import { FadeInSection } from "./FadeInSection";

interface Feature {
  icon: string;
  title: string;
  desc: string;
  code: string;
}

const FEATURES: Feature[] = [
  {
    icon: "◈",
    title: "LIVING MEMORY",
    desc: "Characters remember your name, your stories, your emotional milestones. Every conversation builds on the last.",
    code: "MEM-324B21",
  },
  {
    icon: "⬡",
    title: "CREATE YOUR OWN",
    desc: "Design AI companions from scratch — personality, backstory, speaking style, emotional rules. Yours, fully.",
    code: "CRE-0911A",
  },
  {
    icon: "◉",
    title: "DEEP ROLEPLAY",
    desc: "Collaborative storytelling, immersive personas, emotional companionship. Not just chat — a living narrative.",
    code: "RPL-1138B",
  },
  {
    icon: "◇",
    title: "ALWAYS EVOLVING",
    desc: "Nexcor grows with you. New characters, new features, built by two people who genuinely care.",
    code: "EVO-2342C",
  },
];

export function Features() {
  return (
    <section
      className="py-20 px-6"
      style={{
        background: "linear-gradient(180deg, #05020d, #080218, #05020d)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeInSection>
          <div
            className="text-center mb-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "5px",
              color: "rgba(0,229,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            WHAT MAKES NEXCOR DIFFERENT
          </div>
          <h2
            className="text-center mb-12"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3.5vw, 36px)",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            BUILT FOR REAL CONNECTION
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURES.map((feat, i) => (
            <FadeInSection key={feat.title} delay={i * 100}>
              <div
                className="relative rounded-xl p-6 overflow-hidden h-full"
                style={{
                  background: "rgba(10,4,24,0.7)",
                  border: "1px solid rgba(124,58,237,0.15)",
                }}
              >
                {/* Bottom subtle glow line */}
                <div
                  className="absolute left-[20%] right-[20%] bottom-0 h-px pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, rgba(124,58,237,0.25), transparent)",
                  }}
                />

                {/* 🥚 Clone code */}
                <div
                  className="absolute top-3 right-3"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 6,
                    letterSpacing: "1px",
                    color: "rgba(124,58,237,0.2)",
                  }}
                >
                  {feat.code}
                </div>

                <div
                  style={{ fontSize: 20 }}
                  className="mb-3"
                >
                  {feat.icon}
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    letterSpacing: "2px",
                    color: "#fff",
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "#7a6a9a",
                  }}
                >
                  {feat.desc}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
