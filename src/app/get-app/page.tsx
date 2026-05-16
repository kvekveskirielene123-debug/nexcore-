import Link from "next/link";

export const metadata = {
  title: "Get Nexcor · Available Everywhere",
  description: "Nexcor runs in your browser on any device. Add it to your home screen for a native app feel.",
};

const STEPS = [
  {
    platform: "iOS (iPhone / iPad)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    color: "#00e5ff",
    steps: [
      'Open nexcor.app in Safari.',
      'Tap the Share icon (box with arrow) at the bottom of the screen.',
      'Scroll down and tap "Add to Home Screen".',
      'Name it "Nexcor" and tap Add.',
      'The Nexcor icon now appears on your home screen — tap it to launch like a native app.',
    ],
  },
  {
    platform: "Android",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <circle cx="12" cy="17" r="1"/>
      </svg>
    ),
    color: "#c084fc",
    steps: [
      'Open nexcor.app in Chrome.',
      'Tap the three-dot menu (⋮) in the top-right corner.',
      'Tap "Add to Home Screen" or "Install App".',
      'Confirm by tapping Add.',
      'Nexcor is now on your home screen with a full-screen experience.',
    ],
  },
  {
    platform: "Desktop (Mac / Windows / Linux)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    color: "#a78bfa",
    steps: [
      'Open nexcor.app in Chrome, Edge, or Brave.',
      'Look for the install icon (⊕) in the address bar on the right side.',
      'Click "Install Nexcor" in the prompt.',
      'Nexcor opens as a standalone window — no browser chrome, full speed.',
    ],
  },
];

export default function GetAppPage() {
  return (
    <div className="min-h-screen" style={{ background: "#05020d" }}>

      {/* Dot grid */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div
        aria-hidden
        className="fixed pointer-events-none"
        style={{ top: -80, right: "10%", width: 600, height: 500, background: "radial-gradient(ellipse at center,rgba(124,58,237,0.05) 0%,transparent 65%)", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-20">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 text-[11px] tracking-[2px] uppercase transition-all duration-200"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.55)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-14 text-center">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-7"
            style={{
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.2)",
              boxShadow: "0 0 40px rgba(0,229,255,0.06)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C8 2 6 5 6 8s2 5 4 6-4 3-4 6 2 2 4 2" stroke="rgba(0,229,255,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 2c4 0 6 3 6 6s-2 5-4 6 4 3 4 6-2 2-4 2" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9"  cy="8"  r="1.2" fill="rgba(0,229,255,0.7)"/>
              <circle cx="15" cy="14" r="1.2" fill="rgba(167,139,250,0.7)"/>
            </svg>
          </div>

          <h1
            className="text-[36px] sm:text-[44px] font-black tracking-tight mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(226,217,243,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Get Nexcor
          </h1>

          <p
            className="text-[15px] leading-relaxed max-w-md mx-auto"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.7)" }}
          >
            Nexcor is a <strong style={{ color: "rgba(226,217,243,0.85)" }}>Progressive Web App</strong> — it works on every device, right from your browser. No app store required. Add it to your home screen for a native app experience.
          </p>

          <div className="mt-8 h-px mx-auto max-w-xs" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.3), transparent)" }} />
        </div>

        {/* Platform steps */}
        <div className="flex flex-col gap-6">
          {STEPS.map(({ platform, icon, color, steps }) => (
            <div
              key={platform}
              className="relative rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }}
              />

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                >
                  {icon}
                </div>
                <h2
                  className="text-[15px] font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}
                >
                  {platform}
                </h2>
              </div>

              <ol className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "var(--font-mono)" }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[13px] leading-relaxed"
                      style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.75)" }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center flex flex-col gap-4 items-center">
          <p
            className="text-[13px]"
            style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.5)" }}
          >
            Already have an account?
          </p>
          <Link
            href="/explore"
            className="px-7 py-3 rounded-xl text-[12px] tracking-[2px] uppercase font-bold transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
              boxShadow: "0 0 20px rgba(0,229,255,0.08)",
            }}
          >
            Open Nexcor →
          </Link>
          <Link
            href="/login"
            className="text-[12px] tracking-[1px] uppercase transition-all"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
          >
            Sign in
          </Link>
        </div>

        <p
          className="text-center text-[8px] tracking-[3px] uppercase mt-10"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.15)" }}
        >
          NEXCOR · PWA · 324B21
        </p>
      </div>
    </div>
  );
}
