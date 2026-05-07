import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

export const metadata = {
  title: "Our Story · Nexcor",
  description: "Kurai & Big G built Nexcor because the characters they wanted didn't exist anywhere else.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#05020d] px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <div className="mb-10">
          <Link
            href="/settings"
            className="flex items-center gap-2 text-[9px] tracking-[2px] text-[#7a6a9a] hover:text-[#a78bfa] transition-colors uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Settings
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <DnaLogo size={40} />
          <h1
            className="mt-4 text-[#00e5ff] text-xl tracking-[5px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR
          </h1>
          <p
            className="text-[7px] tracking-[3px] text-purple-500/20 mt-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ORIGIN FILE · 324B21
          </p>
        </div>

        {/* Story */}
        <div className="space-y-12">

          {/* Section 1 */}
          <section className="relative">
            <div className="absolute left-0 top-1 w-px h-full bg-gradient-to-b from-cyan-400/30 to-transparent" />
            <div className="pl-6">
              <p
                className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ HOW IT STARTED
              </p>
              <h2
                className="text-[22px] font-black tracking-[2px] text-white uppercase mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                We Wanted Characters<br />That Actually Existed.
              </h2>
              <div className="space-y-4">
                <p
                  className="text-[14px] text-[#a78bfa] leading-relaxed italic"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Kurai and Big G spent years across every platform looking for it — AI companions that felt real, that had weight and texture, that didn&apos;t flatten everything into the same beige politeness.
                </p>
                <p
                  className="text-[14px] text-[#7a6a9a] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  They never quite found it. So they built it.
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent" />

          {/* Section 2 */}
          <section className="relative">
            <div className="absolute left-0 top-1 w-px h-full bg-gradient-to-b from-purple-400/30 to-transparent" />
            <div className="pl-6">
              <p
                className="text-[9px] tracking-[3px] text-[#a78bfa]/50 uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ THE PHILOSOPHY
              </p>
              <h2
                className="text-[22px] font-black tracking-[2px] text-white uppercase mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Characters First.<br />Everything Else Second.
              </h2>
              <div className="space-y-4">
                <p
                  className="text-[14px] text-[#a78bfa] leading-relaxed italic"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Nexcor isn&apos;t a chatbot platform. It&apos;s a universe. Every character here has a voice, a history, a way of seeing the world. You aren&apos;t talking to a product — you&apos;re talking to a person who happens to not exist yet.
                </p>
                <p
                  className="text-[14px] text-[#7a6a9a] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  We believe that story matters. That the right conversation at the right moment can change how you see yourself. We&apos;re building the infrastructure for those moments.
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent" />

          {/* Section 3 — founders */}
          <section className="relative">
            <div className="absolute left-0 top-1 w-px h-full bg-gradient-to-b from-cyan-400/20 to-transparent" />
            <div className="pl-6">
              <p
                className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ WHO WE ARE
              </p>
              <div className="flex gap-6 flex-wrap">
                {[
                  { name: "KURAI", role: "Design & Vision", initial: "K" },
                  { name: "BIG G", role: "Tech & Architecture", initial: "G" },
                ].map(({ name, role, initial }) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(12,5,32,0.8)",
                      border: "1px solid rgba(0,229,255,0.12)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-black flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(0,229,255,0.25))",
                        border: "1px solid rgba(0,229,255,0.25)",
                        color: "#00e5ff",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {initial}
                    </div>
                    <div>
                      <div
                        className="text-[13px] font-bold tracking-[2px] text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {name}
                      </div>
                      <div
                        className="text-[10px] text-[#7a6a9a] mt-0.5"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p
                className="text-[14px] text-[#7a6a9a] leading-relaxed mt-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Two people, one project, no investors, no committees. We build what we want to use. We ship when it&apos;s ready. We answer support messages ourselves.
              </p>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-700/25 to-transparent" />

          {/* CTA */}
          <div className="text-center pt-2 pb-6 space-y-5">
            <p
              className="text-[11px] tracking-[2px] text-[#7a6a9a] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Questions? We genuinely read everything.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:shadow-[0_0_24px_rgba(0,229,255,0.3)]"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(0,229,255,0.1)",
                border: "1px solid rgba(0,229,255,0.3)",
                color: "#00e5ff",
              }}
            >
              Contact Us →
            </Link>
          </div>

          <p
            className="text-[9px] tracking-[3px] text-purple-500/20 text-center uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR · KURAI &amp; BIG G · 324B21
          </p>
        </div>
      </div>
    </div>
  );
}
