"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

const RESERVED_USERNAMES = [
  "admin", "nexcor", "sistra", "bigg", "api", "auth",
  "login", "signup", "support", "about", "explore", "create",
  "chat", "profile", "settings", "onboarding", "324b21",
];

function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/explore";
  return next;
}

function validateUsername(u: string): string | null {
  if (u.length < 3) return "Username must be at least 3 characters";
  if (u.length > 30) return "Username must be 30 characters or less";
  if (!/^[a-z0-9_]+$/.test(u)) return "Only lowercase letters, numbers, and underscores";
  if (RESERVED_USERNAMES.includes(u)) return "That username is reserved";
  return null;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = sanitizeNext(searchParams.get("next"));
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Age & terms agreement state
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAge, setAgreedToAge] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // If terms content somehow fits without scrolling, unlock immediately
  useEffect(() => {
    const el = termsRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 2) {
      setTermsScrolled(true);
    }
  }, []);

  const handleTermsScroll = () => {
    const el = termsRef.current;
    if (!el || termsScrolled) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setTermsScrolled(true);
    }
  };

  // Both signup paths require all agreements
  const canSubmit = termsScrolled && agreedToTerms && agreedToAge && !loading;

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }

    // Check username uniqueness before signup
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setError("That username is taken");
      setLoading(false);
      return;
    }

    // Sign up (auto-logs in since email confirm is OFF)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Set username on the auto-created profile
    if (data.user) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", data.user.id);

      if (updateError) {
        console.error("profile update error:", updateError);
      }
    }

    // Award signup + daily bonuses before navigating.
    await fetch("/api/marks/on-auth", { method: "POST" }).catch(() => {});

    router.push(nextParam);
    router.refresh();
  };

  const handleGoogle = async () => {
    if (!canSubmit) return;
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/auth/callback?next=${encodeURIComponent(nextParam)}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
            NEW ENTITY REGISTRATION · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          <h2
            className="text-white text-center mb-1 tracking-[3px] text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BEGIN
          </h2>
          <p
            className="text-center text-sm text-[#7a6a9a] mb-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            75 marks free on signup. No credit card required.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={!canSubmit}
            className="w-full py-3 rounded-lg text-[11px] tracking-[2px] text-[#a78bfa] border border-purple-700/30 bg-purple-900/10 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all duration-200 flex items-center justify-center gap-3 mb-6 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            SIGN UP WITH GOOGLE
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-700/25" />
            <span
              className="text-[9px] tracking-[2px] text-[#3a2a5a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              OR EMAIL
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-700/25" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label
                className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                placeholder="your_handle"
                minLength={3}
                maxLength={30}
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
              />
              <p className="text-[10px] text-[#3a2a5a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
                3–30 chars · lowercase letters, numbers, underscores
              </p>
            </div>

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
              <label
                className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="min 8 characters"
                minLength={8}
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
              />
            </div>

            {/* ── Age & Terms Gate ── */}
            <div className="pt-2 space-y-3">
              <p
                className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Read &amp; agree to continue
              </p>

              {/* Scrollable terms summary */}
              <div className="relative">
                <div
                  ref={termsRef}
                  onScroll={handleTermsScroll}
                  className="max-h-[168px] overflow-y-auto rounded-lg border border-purple-700/25 bg-[#08041a] px-4 py-3 space-y-3 scroll-smooth"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#3a2a5a #08041a" }}
                >
                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Age Requirement
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    Nexcor is strictly for users <strong className="text-[#c0b8d8]">18 years of age or older</strong>. By creating an account you confirm you meet this requirement. Accounts found to belong to minors will be deleted immediately and may be reported.
                  </p>

                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Content Rules
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    You may <strong className="text-[#c0b8d8]">never</strong> create characters or content depicting minors in sexual contexts. This is a hard line with zero exceptions — violations result in immediate permanent termination and may be reported to law enforcement. You also agree not to create content designed to harass, threaten, or incite violence against real people.
                  </p>

                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    AI Disclaimer
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    Nexcor characters are <strong className="text-[#c0b8d8]">not real people</strong>. They cannot feel, love, or form genuine attachments. Responses are generated by statistical models and can be wrong or misleading. Do not use them for medical, legal, financial, or crisis support.
                  </p>

                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Marks &amp; Pricing
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    All messages cost Marks (our in-app currency). There are no free messages for non-subscribers. Current costs: Haiku 3 Marks · Sonnet 10 Marks · Opus 25 Marks per message. Subscribers receive Haiku free and discounted rates on other models. Marks have no cash value and are non-refundable once spent.
                  </p>

                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Your Data
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    We store your account info, characters, and conversations in Supabase. Your messages are sent to Anthropic's API to generate replies — Anthropic does not train on API data. Payments are processed by Stripe; we never see your card details. We do not sell your data. You can delete your account and all associated data at any time in Settings.
                  </p>

                  <p className="text-[11px] text-[#5a4a7a] leading-relaxed pt-1 border-t border-purple-900/30" style={{ fontFamily: "var(--font-body)" }}>
                    Full{" "}
                    <Link href="/terms" target="_blank" className="text-[#00e5ff]/70 hover:text-[#00e5ff] underline transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#00e5ff]/70 hover:text-[#00e5ff] underline transition-colors">Privacy Policy</Link>
                    {" "}are available at any time. These terms are governed by the laws of Georgia (country).
                  </p>
                </div>

                {/* Scroll-to-read indicator — fades out once scrolled */}
                {!termsScrolled && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#08041a] to-transparent rounded-b-lg pointer-events-none flex items-end justify-center pb-2">
                    <span
                      className="text-[8px] tracking-[2px] text-[#00e5ff]/50 animate-pulse"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ↓ SCROLL TO READ ALL
                    </span>
                  </div>
                )}

                {/* Unlocked indicator */}
                {termsScrolled && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center pointer-events-none">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Checkbox: Terms agreement */}
              <label
                className={`flex items-start gap-3 cursor-pointer group ${!termsScrolled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    disabled={!termsScrolled}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                      agreedToTerms
                        ? "bg-cyan-400/20 border-cyan-400/60"
                        : "bg-[#08041a] border-purple-700/40 group-hover:border-purple-500/60"
                    }`}
                  >
                    {agreedToTerms && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Checkbox: Age confirmation */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToAge}
                    onChange={(e) => setAgreedToAge(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                      agreedToAge
                        ? "bg-cyan-400/20 border-cyan-400/60"
                        : "bg-[#08041a] border-purple-700/40 group-hover:border-purple-500/60"
                    }`}
                  >
                    {agreedToAge && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  I confirm I am <strong className="text-[#c0b8d8]">18 years of age or older</strong>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 mt-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "INITIALIZING..." : "CREATE ENTITY →"}
            </button>
          </form>

          <p
            className="text-center text-xs text-[#3a2a5a] mt-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Already have an account?{" "}
            <Link
              href={`/login${nextParam !== "/explore" ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
              className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05020d]" />}>
      <SignupForm />
    </Suspense>
  );
}
