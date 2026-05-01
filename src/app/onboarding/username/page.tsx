"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DnaLogo } from "@/components/DnaLogo";

const RESERVED_USERNAMES = [
  "admin", "nexcor", "sistra", "kurai", "bigg", "api", "auth",
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
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

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
            This is how others will find you. Choose wisely.
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
                autoFocus
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
              />
              <p
                className="text-[10px] text-[#3a2a5a] mt-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                3–30 chars · lowercase letters, numbers, underscores
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-50 transition-all duration-200 mt-2"
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
