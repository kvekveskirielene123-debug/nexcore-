"use client";

const ICONS = [
  {
    label: "DNA HELIX",
    sublabel: "Sestra Protocol",
    color: "#00e5ff",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M16 4 C20 10 28 10 32 16 C36 22 28 26 24 32 C20 38 28 42 32 44" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M32 4 C28 10 20 10 16 16 C12 22 20 26 24 32 C28 38 20 42 16 44" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="18.5" y1="9" x2="29.5" y2="9" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="14.5" y1="17" x2="33.5" y2="17" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="16" y1="25" x2="32" y2="25" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="14.5" y1="33" x2="33.5" y2="33" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="18.5" y1="40" x2="29.5" y2="40" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  {
    label: "GENETIC CODE",
    sublabel: "ATCG Sequence",
    color: "#a78bfa",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <rect x="4" y="6" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="9" y="13" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">A</text>
        <rect x="19" y="6" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="24" y="13" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
        <rect x="34" y="6" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="39" y="13" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">C</text>
        <rect x="4" y="20" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="9" y="27" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">G</text>
        <rect x="19" y="20" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="24" y="27" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">A</text>
        <rect x="34" y="20" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="39" y="27" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
        <rect x="4" y="34" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="9" y="41" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">C</text>
        <rect x="19" y="34" width="10" height="8" rx="2" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="24" y="41" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">G</text>
        <rect x="34" y="34" width="10" height="8" rx="2" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <text x="39" y="41" textAnchor="middle" fill="#00e5ff" fontSize="7" fontFamily="monospace" fontWeight="bold">T</text>
      </svg>
    ),
  },
  {
    label: "MOLECULE",
    sublabel: "Neural Bonds",
    color: "#00e5ff",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <line x1="24" y1="10" x2="12" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="24" y1="10" x2="36" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="12" y1="28" x2="36" y2="28" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
        <line x1="12" y1="28" x2="8" y2="40" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
        <line x1="36" y1="28" x2="40" y2="40" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="24" cy="10" r="5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="2"/>
        <circle cx="12" cy="28" r="4" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
        <circle cx="36" cy="28" r="4" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
        <circle cx="8" cy="40" r="3" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="3" fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "BIOMETRIC",
    sublabel: "Identity Scan",
    color: "#a78bfa",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M6 16 L6 8 L14 8" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 16 L42 8 L34 8" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 32 L6 40 L14 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 32 L42 40 L34 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="24" cy="24" rx="7" ry="9" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8"/>
        <path d="M18 20 Q24 16 30 20" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M18 24 Q24 20 30 24" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M18 28 Q24 24 30 28" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        <circle cx="24" cy="24" r="2" fill="#00e5ff" opacity="0.9"/>
      </svg>
    ),
  },
  {
    label: "IDENTITY",
    sublabel: "Clone Status",
    color: "#00e5ff",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <circle cx="24" cy="16" r="8" stroke="#a78bfa" strokeWidth="2" fill="rgba(167,139,250,0.1)"/>
        <path d="M10 40 C10 32 16 28 24 28 C32 28 38 32 38 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M18 14 Q24 10 30 14" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        <circle cx="24" cy="16" r="3" fill="rgba(0,229,255,0.3)" stroke="#00e5ff" strokeWidth="1.5"/>
        <line x1="38" y1="8" x2="44" y2="6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="38" y1="12" x2="44" y2="12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="38" y1="16" x2="44" y2="18" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    label: "NEURAL NET",
    sublabel: "AI Pathways",
    color: "#a78bfa",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <line x1="8" y1="12" x2="24" y2="24" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="8" y1="36" x2="24" y2="24" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="8" x2="24" y2="24" stroke="#00e5ff" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="40" y2="12" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="40" y2="36" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
        <line x1="24" y1="24" x2="24" y2="40" stroke="#00e5ff" strokeWidth="1.2" opacity="0.5"/>
        <line x1="8" y1="12" x2="8" y2="36" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/>
        <line x1="40" y1="12" x2="40" y2="36" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/>
        <circle cx="8" cy="12" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="8" cy="36" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="24" cy="8" r="3.5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="24" cy="40" r="3.5" fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth="1.5"/>
        <circle cx="40" cy="12" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="40" cy="36" r="3.5" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="5" fill="rgba(0,229,255,0.25)" stroke="#00e5ff" strokeWidth="2"/>
      </svg>
    ),
  },
];

export function BrilliantIconGrid() {
  return (
    <section className="mb-16">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.15); }
        }
        .brilliant-card {
          animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.4s cubic-bezier(0.4,0,0.2,1),
                      border-color 0.4s cubic-bezier(0.4,0,0.2,1),
                      background 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .brilliant-card:hover {
          transform: translateY(-12px) scale(1.05);
          border-color: rgba(0,229,255,0.7) !important;
          background: rgba(0,229,255,0.06) !important;
          box-shadow: 0 20px 60px rgba(0,229,255,0.2), 0 0 30px rgba(0,229,255,0.15);
        }
        .brilliant-card .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(0,229,255,0.15) 50%, transparent 60%);
          transform: translateX(-100%) skewX(-15deg);
          pointer-events: none;
        }
        .brilliant-card:hover .shimmer {
          animation: shimmer 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .brilliant-card .pulse-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 50% 50%, rgba(0,229,255,0.08) 0%, transparent 70%);
          animation: pulseGlow 3s ease-in-out infinite;
          pointer-events: none;
        }
        .brilliant-card:hover .pulse-bg {
          animation: pulseGlow 1.2s ease-in-out infinite;
        }
        .brilliant-card .icon-label {
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease;
          transform: translateY(4px);
          opacity: 0.7;
        }
        .brilliant-card:hover .icon-label {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>

      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(122,106,154,0.2))" }} />
        <span
          className="text-[10px] tracking-[3px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
        >
          ◈ SESTRA SCIENCE DIVISION
        </span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(122,106,154,0.2))" }} />
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        <style>{`
          @media (max-width: 768px) {
            .icon-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .icon-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        {ICONS.map((icon, i) => (
          <div
            key={icon.label}
            className="brilliant-card rounded-2xl flex flex-col items-center justify-center gap-3 aspect-square"
            style={{
              border: `1px solid rgba(${icon.color === "#00e5ff" ? "0,229,255" : "167,139,250"},0.2)`,
              background: "rgba(12,5,32,0.7)",
              backdropFilter: "blur(12px)",
              animationDelay: `${i * 0.08}s`,
              padding: "16px 8px",
            }}
          >
            <div className="pulse-bg" />
            <div className="shimmer" />

            <div
              className="relative z-10"
              style={{ filter: `drop-shadow(0 0 8px ${icon.color}80)` }}
            >
              {icon.svg}
            </div>

            <div className="icon-label relative z-10 text-center">
              <div
                className="text-[8px] tracking-[2px] uppercase font-bold"
                style={{ fontFamily: "var(--font-mono)", color: icon.color }}
              >
                {icon.label}
              </div>
              <div
                className="text-[7px] tracking-[1px] mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
              >
                {icon.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p
        className="text-center mt-5 text-[10px] italic"
        style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.4)" }}
      >
        Brilliant subscribers unlock the full science of Nexcor.
      </p>
    </section>
  );
}
