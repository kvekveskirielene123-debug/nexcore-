"use client";

import { Suspense, useState, useEffect, useRef } from "react";
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

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = sanitizeNext(searchParams.get("next"));
  const confirmEmail = searchParams.get("confirm_email") === "1";
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Terms & age agreement
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAge, setAgreedToAge] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) {
        router.replace(nextParam);
        return;
      }
      setCheckingAuth(false);
    })();
  }, [supabase, router, nextParam]);

  // If terms content fits without scrolling, unlock immediately
  useEffect(() => {
    const el = termsRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 2) {
      setTermsScrolled(true);
    }
  }, [checkingAuth]);

  const handleTermsScroll = () => {
    const el = termsRef.current;
    if (!el || termsScrolled) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setTermsScrolled(true);
    }
  };

  const canSubmit = termsScrolled && agreedToTerms && agreedToAge && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

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

    const res = await fetch("/api/auth/set-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not save username. Please try again.");
      setLoading(false);
      return;
    }

    // Grant bonuses now that profile is confirmed set up
    await fetch("/api/marks/on-auth", { method: "POST" }).catch(() => {});

    router.push(nextParam);
    router.refresh();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#05020d] flex items-center justify-center">
        <DnaLogo size={48} />
      </div>
    );
  }

  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-5">
          <DnaLogo size={36} className="mx-auto" />
          <h1 className="text-[22px] font-black tracking-[4px] text-white uppercase" style={{ fontFamily: "var(--font-display)" }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="text-[14px] text-[#a78bfa] italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            We sent you a confirmation link. Click it to activate your account — then come back and you&apos;ll be taken straight to choosing your handle.
          </p>
          <p className="text-[10px] tracking-[2px] text-purple-500/30 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            NEXCOR · 324B21
          </p>
        </div>
      </div>
    );
  }

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
            IDENTITY ASSIGNMENT · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          <h2
            className="text-white text-center mb-1 tracking-[3px] text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CHOOSE YOUR HANDLE
          </h2>
          <p
            className="text-center text-sm text-[#7a6a9a] mb-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Almost there. One last step.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Terms & Age Gate ─────────────────────────────────────── */}
            <div className="space-y-3">
              <p
                className="text-[9px] tracking-[2px] text-[#7a6a9a] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Before you continue
              </p>

              {/* Scrollable terms summary */}
              <div className="relative">
                <div
                  ref={termsRef}
                  onScroll={handleTermsScroll}
                  className="max-h-[160px] overflow-y-auto rounded-lg border border-purple-700/25 bg-[#08041a] px-4 py-3 space-y-3 scroll-smooth"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#3a2a5a #08041a" }}
                >
                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Age Requirement
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    Nexcor is strictly for users <strong className="text-[#c0b8d8]">18 years of age or older</strong>. By continuing you confirm you meet this requirement. Accounts found to belong to minors will be deleted immediately.
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
                    Nexcor characters are <strong className="text-[#c0b8d8]">not real people</strong>. They cannot feel or form genuine attachments. Responses are generated by statistical models. Do not use them for medical, legal, financial, or crisis support.
                  </p>

                  <p className="text-[10px] font-semibold tracking-[1.5px] text-[#a78bfa] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Marks &amp; Pricing
                  </p>
                  <p className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    All messages cost Marks. There are no free messages for non-subscribers. Current costs: Haiku 3 Marks · Sonnet 10 Marks · Opus 25 Marks. Subscribers receive Haiku free and discounted rates on other models. Marks have no cash value and are non-refundable.
                  </p>

                  <p className="text-[11px] text-[#5a4a7a] leading-relaxed pt-1 border-t border-purple-900/30" style={{ fontFamily: "var(--font-body)" }}>
                    Full{" "}
                    <Link href="/terms" target="_blank" className="text-[#00e5ff]/70 hover:text-[#00e5ff] underline transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#00e5ff]/70 hover:text-[#00e5ff] underline transition-colors">Privacy Policy</Link>
                    {" "}apply to your use of Nexcor.
                  </p>
                </div>

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

                {termsScrolled && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center pointer-events-none">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Checkbox: Terms agreement */}
              <label className={`flex items-start gap-3 cursor-pointer group ${!termsScrolled ? "opacity-40 cursor-not-allowed" : ""}`}>
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    disabled={!termsScrolled}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${agreedToTerms ? "bg-cyan-400/20 border-cyan-400/60" : "bg-[#08041a] border-purple-700/40 group-hover:border-purple-500/60"}`}>
                    {agreedToTerms && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#7a6a9a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors underline">Privacy Policy</Link>
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
                  <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${agreedToAge ? "bg-cyan-400/20 border-cyan-400/60" : "bg-[#08041a] border-purple-700/40 group-hover:border-purple-500/60"}`}>
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

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-700/20 to-transparent" />

            {/* Username input */}
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
                disabled={!canSubmit && !username}
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200 disabled:opacity-40"
              />
              <p className="text-[10px] text-[#3a2a5a] mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
                3–30 chars · lowercase letters, numbers, underscores
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || !username.trim()}
              className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 mt-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "ASSIGNING..." : "CONFIRM IDENTITY →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingUsernamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05020d]" />}>
      <OnboardingForm />
    </Suspense>
  );
}
