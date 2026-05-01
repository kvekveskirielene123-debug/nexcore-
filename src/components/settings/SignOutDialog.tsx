"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignOutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SignOutDialog({ open, onClose }: SignOutDialogProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!open) return null;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={signingOut ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-purple-700/30 bg-[#0c0520] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="p-6 text-center space-y-4">
            <div
              className="text-[9px] tracking-[3px] text-[#00e5ff]/45 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ SESSION TERMINATION
            </div>
            <h2
              className="text-[20px] tracking-[2px] text-white uppercase"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Sign out of Nexcor?
            </h2>
            <p
              className="text-[13px] text-[#a78bfa] italic leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your characters and conversations stay safe. You can sign back in
              anytime.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={signingOut}
                className="flex-1 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 py-3 rounded-lg bg-red-500/85 text-white font-bold text-[11px] tracking-[3px] hover:bg-red-500 transition-all disabled:opacity-50"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
