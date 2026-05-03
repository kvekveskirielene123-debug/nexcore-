"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else setError("This reset link is invalid or has expired. Request a new one.");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    // Auto-redirect after 2 seconds
    setTimeout(() => router.push("/explore"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <DnaLogo size={48} className="mx-auto mb-6" />
          <h2
            className="text-[#00e5ff] text-2xl tracking-[3px] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            PASSWORD UPDATED
          </h2>
          <p
            className="text-[#7a6a9a] text-base italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Redirecting you to the app...
          </p>
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
            NEW CREDENTIAL SETUP · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          <h2
            className="text-white text-center mb-1 tracking-[3px] text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NEW PASSWORD
          </h2>
          <p
            className="text-center text-sm text-[#7a6a9a] mb-8 italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Choose something you'll remember.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          {ready ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  New Password
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

              <div>
                <label
                  className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="retype password"
                  minLength={8}
                  className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-50 transition-all duration-200 mt-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>
          ) : (
            !error && (
              <p
                className="text-center text-[#7a6a9a] italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Verifying reset link...
              </p>
            )
          )}

          {error && (
            <p
              className="text-center text-xs text-[#3a2a5a] mt-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Link
                href="/forgot-password"
                className="text-[#a78bfa] hover:text-[#00e5ff] transition-colors"
              >
                Request a new reset link
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
