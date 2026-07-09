import { Metadata } from "next";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Join me on Nexcor",
    description: `Use invite code ${code.toUpperCase()} when you sign up and we both get 300 marks free.`,
  };
}

export default async function ReferralLandingPage({ params }: Props) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#05020d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,212,200,0.14) 0%, transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: 420, width: "100%", textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, rgba(0,212,200,0.18) 0%, rgba(123,95,255,0.12) 100%)",
          border: "1px solid rgba(0,212,200,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
          boxShadow: "0 0 32px rgba(0,212,200,0.15)",
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M 16 2 L 30 11 L 16 30 L 2 11 Z" fill="rgba(0,212,200,0.15)" />
            <path d="M 16 2 L 30 11 L 16 14 L 2 11 Z" fill="rgba(255,255,255,0.18)" />
            <path d="M 2 11 L 30 11" stroke="rgba(0,212,200,0.6)" strokeWidth="1.2" />
            <path d="M 2 11 L 16 14 L 16 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
            <path d="M 30 11 L 16 14 L 16 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, color: "rgba(0,212,200,0.6)", margin: "0 0 12px" }}>
          YOU&apos;VE BEEN INVITED TO
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: -0.5 }}>
          Nexcor
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 40px" }}>
          AI character chats &amp; social. Sign up with this invite code and you both get <strong style={{ color: "#00d4c8" }}>300 marks free</strong>.
        </p>

        {/* Code box */}
        <div style={{
          width: "100%", padding: "28px 24px",
          borderRadius: 20, marginBottom: 28,
          background: "rgba(0,212,200,0.06)",
          border: "1px solid rgba(0,212,200,0.3)",
          boxShadow: "0 0 40px rgba(0,212,200,0.08)",
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, color: "rgba(0,212,200,0.55)", margin: "0 0 12px" }}>
            YOUR INVITE CODE
          </p>
          <p style={{ fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: 8, margin: 0 }}>
            {upperCode}
          </p>
        </div>

        {/* CTA */}
        <a
          href="https://n3xcor.com/get-app"
          style={{
            display: "block", width: "100%",
            padding: "16px 24px", borderRadius: 40,
            background: "rgba(0,212,200,0.14)",
            border: "1px solid rgba(0,212,200,0.5)",
            color: "#00d4c8", fontSize: 13, fontWeight: 900,
            letterSpacing: 2, textDecoration: "none",
            marginBottom: 14,
            boxShadow: "0 0 20px rgba(0,212,200,0.12)",
          }}
        >
          DOWNLOAD NEXCOR
        </a>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Enter code <strong style={{ color: "rgba(255,255,255,0.45)" }}>{upperCode}</strong> when you sign up
        </p>
      </div>
    </main>
  );
}
