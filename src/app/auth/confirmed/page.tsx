"use client";

import Link from "next/link";

export default function EmailConfirmedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#05020d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(123,95,255,0.18) 0%, transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: 420, width: "100%", textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, rgba(123,95,255,0.22) 0%, rgba(0,212,200,0.12) 100%)",
          border: "1px solid rgba(123,95,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          boxShadow: "0 0 32px rgba(123,95,255,0.2)",
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M 16 2 L 30 11 L 16 30 L 2 11 Z" fill="rgba(0,212,200,0.15)" />
            <path d="M 16 2 L 30 11 L 16 14 L 2 11 Z" fill="rgba(255,255,255,0.18)" />
            <path d="M 2 11 L 30 11" stroke="rgba(0,212,200,0.6)" strokeWidth="1.2" />
            <path d="M 2 11 L 16 14 L 16 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
            <path d="M 30 11 L 16 14 L 16 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Check circle */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(0,212,200,0.1)",
          border: "1.5px solid rgba(0,212,200,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 0 24px rgba(0,212,200,0.15)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, color: "rgba(0,212,200,0.6)", marginBottom: 10, margin: "0 0 10px" }}>
          NEXCOR · EMAIL VERIFIED
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.2 }}>
          You&apos;re confirmed.
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 40px" }}>
          Your email has been verified. Open the Nexcor app and log in with your email and password to get started.
        </p>

        {/* Open app button */}
        <a
          href="com.nexcor.app://"
          style={{
            display: "block", width: "100%",
            padding: "16px 24px", borderRadius: 40,
            background: "rgba(123,95,255,0.15)",
            border: "1px solid rgba(123,95,255,0.5)",
            color: "#a78bfa", fontSize: 13, fontWeight: 900,
            letterSpacing: 2, textDecoration: "none",
            marginBottom: 14,
            boxShadow: "0 0 20px rgba(123,95,255,0.12)",
          }}
        >
          OPEN NEXCOR APP
        </a>

        {/* Fallback text */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          If the button doesn&apos;t open the app, just open Nexcor manually and log in.
        </p>

        {/* Back to site */}
        <Link
          href="/"
          style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none" }}
        >
          Back to n3xcor.com
        </Link>
      </div>
    </main>
  );
}
