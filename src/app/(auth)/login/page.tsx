"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/explore";
  return next;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = sanitizeNext(searchParams.get("next"));
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (resending || !email.trim()) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email: email.trim() });
    setResendSent(true);
    setResending(false);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsConfirm(false);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setNeedsConfirm(true);
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    // Award signup + daily bonuses server-side before navigating.
    await fetch("/api/marks/on-auth", { method: "POST" }).catch(() => {});

    // If the user didn't want to stay logged in, re-set the auth cookies
    // without maxAge so they become session cookies.  The browser deletes
    // session cookies automatically when the window closes — no JS tricks.
    if (!rememberMe) {
      await fetch("/api/auth/set-session-cookies", { method: "POST" }).catch(() => {});
    }

    // Hard navigation so the server re-reads the new session cookies.
    window.location.href = nextParam;
  };

  const handleGoogle = async () => {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/auth/callback?next=${encodeURIComponent(nextParam)}`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <DnaLogo size={36} />
          <h1
            className="mt-3 text-[#00e5ff] text-xl tracking-[5px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR
          </h1>
          <p
            className="text-[7px] tracking-[3px] text-purple-500/20 mt-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SUBJECT VERIFICATION · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          <h2
            className="text-white text-center mb-1 tracking-[3px] text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RETURN
          </h2>
          <p
            className="text-center text-sm text-[#7a6a9a] mb-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your characters are waiting.
          </p>

          {/* Email not confirmed banner */}
          {needsConfirm && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/8 p-4 space-y-2">
              <p className="text-[11px] text-amber-300 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                <strong>Check your inbox.</strong> You need to confirm your email before you can log in. Click the link we sent you when you signed up.
              </p>
              {resendSent ? (
                <p className="text-[10px] text-cyan-400" style={{ fontFamily: "var(--font-mono)" }}>
                  ✓ Confirmation email resent — check your spam folder too.
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[10px] tracking-[1.5px] uppercase text-cyan-400 hover:text-white transition-colors disabled:opacity-50"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {resending ? "Sending..." : "Resend confirmation email →"}
                </button>
              )}
            </div>
          )}

          {/* Generic error */}
          {error && !needsConfirm && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label
                className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-[9px] tracking-[2px] text-[#7a6a9a] uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[9px] tracking-[1px] text-[#00e5ff]/60 hover:text-[#00e5ff] transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  FORGOT?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 pr-11 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded transition-colors duration-150"
                  style={{ color: showPassword ? "rgba(0,229,255,0.7)" : "rgba(122,106,154,0.5)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye-off */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Stay logged in */}
            <label className="flex items-center gap-3 cursor-pointer group mt-1">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${rememberMe ? "bg-cyan-400/20 border-cyan-400/60" : "bg-[#08041a] border-purple-700/40 group-hover:border-purple-500/60"}`}>
                  {rememberMe && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-[#7a6a9a]" style={{ fontFamily: "var(--font-body)" }}>
                Stay logged in after closing the browser
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-50 transition-all duration-200 mt-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-700/25" />
            <span
              className="text-[9px] tracking-[2px] text-[#3a2a5a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              OR
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-700/25" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-lg text-[11px] tracking-[2px] text-[#a78bfa] border border-purple-700/30 bg-purple-900/10 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all duration-200 flex items-center justify-center gap-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          <p
            className="text-center text-xs text-[#3a2a5a] mt-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No account?{" "}
            <Link
              href={`/signup${nextParam !== "/explore" ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
              className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05020d]" />}>
      <LoginForm />
    </Suspense>
  );
}
