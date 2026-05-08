import Link from "next/link";

export const metadata = { title: "404 · Nexcor" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 text-center max-w-sm">
        <div
          className="text-[11px] tracking-[4px] uppercase mb-4"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}
        >
          ◈ ENTITY NOT FOUND · 324B21
        </div>

        <div
          className="text-[96px] font-black leading-none mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "rgba(0,229,255,0.12)",
            textShadow: "3px 0 rgba(124,58,237,0.3), -3px 0 rgba(0,229,255,0.3)",
            letterSpacing: "0.05em",
          }}
        >
          404
        </div>

        <h1
          className="text-[18px] font-bold tracking-[3px] uppercase mb-3"
          style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.85)" }}
        >
          SUBJECT UNLOCATED
        </h1>

        <p
          className="text-[13px] leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.8)" }}
        >
          The entity you&apos;re looking for doesn&apos;t exist or has been removed from the archive.
        </p>

        <Link
          href="/explore"
          className="inline-block px-6 py-2.5 rounded-lg text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,229,255,0.3)]"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(0,229,255,0.1)",
            border: "1px solid rgba(0,229,255,0.35)",
            color: "#00e5ff",
          }}
        >
          RETURN TO EXPLORE →
        </Link>

        <p
          className="mt-8 text-[9px] tracking-[2px] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.25)" }}
        >
          NEXCOR · NEOLUTION SCIENCE DIVISION · 324B21
        </p>
      </div>
    </div>
  );
}
