"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${location.origin}/reset-password` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <DnaLogo size={48} className="mx-auto mb-6" />
          <h2
            className="text-white text-2xl tracking-[3px] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TRANSMISSION SENT
          </h2>
          <p
            className="text-[#7a6a9a] text-base leading-relaxed italic mb-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            If an account exists for <span className="text-[#00e5ff]">{email}</span>, a reset
            link is on its way.
            <br />Check your inbox (and spam).
          </p>
          <Link
            href="/login"
            className="inline-block text-[11px] tracking-[3px] text-[#a78bfa] border border-purple-700/30 rounded-lg px-6 py-3 hover:border-purple-500/60 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← BACK TO LOGIN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
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
            PASSWORD RECOVERY · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          <h2
            className="text-white text-center mb-1 tracking-[3px] text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RECOVER
          </h2>
          <p
            className="text-center text-sm text-[#7a6a9a] mb-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Enter your email. We'll send you a reset link.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-50 transition-all duration-200 mt-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>

          <p
            className="text-center text-xs text-[#3a2a5a] mt-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Remembered it?{" "}
            <Link href="/login" className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
