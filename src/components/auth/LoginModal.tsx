"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthModal } from "@/context/AuthModalContext";

const GRID_CARDS = [
  { accent: "#00e5ff", label: "ARIA-7",  hot: true  },
  { accent: "#c084fc", label: "VALE",    hot: false },
  { accent: "#f472b6", label: "NOVA",    hot: true  },
  { accent: "#00e5ff", label: "KURAI",   hot: false },
  { accent: "#a78bfa", label: "ECHO",    hot: false },
  { accent: "#34d399", label: "SERAPH",  hot: true  },
  { accent: "#c084fc", label: "LYRA",    hot: false },
  { accent: "#f59e0b", label: "CIPHER",  hot: false },
  { accent: "#00e5ff", label: "VANCE",   hot: true  },
  { accent: "#f472b6", label: "MIRA",    hot: false },
  { accent: "#a78bfa", label: "ZARA",    hot: false },
  { accent: "#34d399", label: "REX",     hot: false },
];

function CharacterGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div
        className="grid gap-2 p-3 w-full h-full"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", opacity: 0.3 }}
      >
        {GRID_CARDS.map((card, i) => (
          <div
            key={i}
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: `linear-gradient(160deg, rgba(10,5,25,0.9) 0%, ${card.accent}18 100%)`,
              border: `1px solid ${card.accent}22`,
              minHeight: 90,
            }}
          >
            <div
              className="flex-1 flex items-center justify-center"
              style={{ background: `radial-gradient(circle at 50% 60%, ${card.accent}12, transparent 70%)` }}
            >
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${card.accent}2e, rgba(124,58,237,0.28))`,
                  border: `1px solid ${card.accent}3a`,
                }}
              />
            </div>
            <div className="px-2 pb-2">
              <p
                className="text-[7px] font-black tracking-[1.5px]"
                style={{ fontFamily: "var(--font-display)", color: `${card.accent}b0` }}
              >
                {card.label}
              </p>
            </div>
            {card.hot && (
              <div
                className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-[1px]"
                style={{ background: "rgba(239,68,68,0.82)", color: "#fff", fontFamily: "var(--font-mono)" }}
              >
                HOT
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Radial fade so grid doesn't overpower modal */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 65% 70% at 50% 50%, transparent 20%, rgba(5,2,13,0.75) 70%)" }}
      />
    </div>
  );
}

export function LoginModal() {
  const { isOpen, closeLoginModal } = useAuthModal();

  const handleGoogle = useCallback(async () => {
    const supabase = createClient();
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/auth/callback?next=/explore`,
        queryParams: { prompt: "select_account" },
      },
    });
  }, []);

  const handleEmail = useCallback(() => {
    closeLoginModal();
    window.location.href = "/login";
  }, [closeLoginModal]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLoginModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeLoginModal]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(5,2,13,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      onClick={closeLoginModal}
    >
      <CharacterGrid />

      {/* Modal card */}
      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 440,
          borderRadius: 44,
          background: "rgba(10,5,25,0.97)",
          border: "1px solid rgba(124,58,237,0.28)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,229,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: "nx-modal-slide-up 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.55), rgba(167,139,250,0.4), transparent)" }}
        />

        {/* Close */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#00e5ff";
            (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.1)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.45)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center px-8 pt-10 pb-9 gap-6">

          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-3.5">
            <div
              className="w-[52px] h-[52px] rounded-[18px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.14), rgba(124,58,237,0.22))",
                border: "1px solid rgba(0,229,255,0.24)",
                boxShadow: "0 0 36px rgba(0,229,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
                <defs>
                  <linearGradient id="lgModalDna" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path d="M2 3c1 4 6 6 6 9s-5 5-6 9" stroke="url(#lgModalDna)" strokeWidth="1.7" />
                <path d="M22 3c-1 4-6 6-6 9s5 5 6 9" stroke="url(#lgModalDna)" strokeWidth="1.7" />
                <line x1="4.5" y1="9"  x2="19.5" y2="9"  stroke="url(#lgModalDna)" strokeWidth="1.1" />
                <line x1="4.5" y1="15" x2="19.5" y2="15" stroke="url(#lgModalDna)" strokeWidth="1.1" />
              </svg>
            </div>

            <div className="text-center">
              <h2
                className="text-[22px] font-black tracking-[0.5px]"
                style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.95)" }}
              >
                Log In Now!
              </h2>
              <p
                className="text-[12px] mt-1 max-w-[260px] leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(148,163,184,0.55)" }}
              >
                Thousands of AI characters are waiting for you
              </p>
            </div>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[13px] transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.96)",
              color: "#16101f",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#ffffff";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(0,0,0,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.96)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.45)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
            <span
              className="text-[10px] tracking-[2.5px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.38)" }}
            >
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />
          </div>

          {/* Email button */}
          <button
            onClick={handleEmail}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[13px] transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(226,217,243,0.75)",
              fontFamily: "var(--font-body)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.border = "1px solid rgba(0,229,255,0.35)";
              (e.currentTarget as HTMLElement).style.color = "#00e5ff";
              (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.color = "rgba(226,217,243,0.75)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            Continue with Email
          </button>

          {/* Terms */}
          <p
            className="text-center text-[10px] leading-relaxed max-w-[300px]"
            style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.4)" }}
          >
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 transition-colors hover:text-[#00e5ff]"
              onClick={closeLoginModal}
            >
              Terms
            </Link>
            {" "}and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 transition-colors hover:text-[#00e5ff]"
              onClick={closeLoginModal}
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

