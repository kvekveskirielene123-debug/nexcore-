"use client";

// UPDATED · Adds a required 18+ acknowledgment checkbox before signup.
//
// Drop-in replacement for your existing signup form client component.
// The only change from your original is the `ageConfirmed` state +
// the checkbox JSX + the disabled condition on the submit button.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

interface SignupFormProps {
  redirectTo?: string;
}

export function SignupForm({ redirectTo = "/onboarding/username" }: SignupFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() && password.trim().length >= 8 && ageConfirmed && !loading;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signupErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (signupErr) {
      setError(signupErr.message);
      setLoading(false);
      return;
    }

    // Auto-login (Supabase signs the user in immediately after signUp)
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <DnaLogo size={36} className="mx-auto mb-5 opacity-70" />
          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ NEW DESIGNATION · 324B21
          </div>
          <h1
            className="text-[28px] font-black tracking-[4px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 30px rgba(0,229,255,0.2)",
            }}
          >
            CREATE ACCOUNT
          </h1>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-purple-700/20 bg-[#0c0520]/70 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Email */}
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
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* Password */}
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
                placeholder="min. 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/40 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* 18+ checkbox — THE NEW ADDITION */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="sr-only"
                />
                {/* Custom checkbox styled to match Nexcor aesthetic */}
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    ageConfirmed
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-purple-700/50 bg-transparent group-hover:border-purple-500/70"
                  }`}
                >
                  {ageConfirmed && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path
                        d="M1 4.5L4 7.5L10 1.5"
                        stroke="#05020d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className="text-[12px] text-[#a78bfa] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                I confirm that I am <strong className="text-white">18 years of age or older</strong>.
                Nexcor is an adult platform and access is restricted to users 18+.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-[12px]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-lg bg-cyan-400 text-black font-black text-[11px] tracking-[4px] disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "CREATING..." : "◈ CREATE ACCOUNT →"}
            </button>

            {/* Legal links */}
            <p
              className="text-[10px] text-[#7a6a9a] text-center leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        {/* Already have account */}
        <p
          className="text-[12px] text-[#7a6a9a] text-center mt-6 italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Already designated?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-white transition-colors not-italic"
            style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px" }}
          >
            SIGN IN →
          </Link>
        </p>

        <p
          className="text-[9px] tracking-[3px] text-purple-500/20 text-center mt-6 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SESTRA PROTOCOL · 324B21
        </p>
      </div>
    </div>
  );
}
