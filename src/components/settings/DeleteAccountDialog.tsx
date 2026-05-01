"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

interface DeleteAccountDialogProps {
  open: boolean;
  username: string;
  /** Live counts shown in the "you will lose" section. */
  stats: {
    characterCount: number;
    conversationCount: number;
    messageCount: number;
    marksBalance: number;
  };
  onClose: () => void;
}

export function DeleteAccountDialog({
  open,
  username,
  stats,
  onClose,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setAcknowledged(false);
      setError(null);
      setDeleting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const matches = confirmText.trim() === username.trim();
  const canDelete = matches && acknowledged && !deleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_username: confirmText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete account.");
        setDeleting(false);
        return;
      }
      // Success — go home with a goodbye flag the homepage can render
      router.push("/?goodbye=1");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Network error.");
      setDeleting(false);
    }
  };

  // ⟡ value approximation
  const usdValue = (stats.marksBalance * 0.004).toFixed(2);

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-0 sm:p-4 pointer-events-none overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-md bg-[#0c0520] sm:rounded-2xl border-y sm:border border-red-500/30 overflow-hidden relative my-0 sm:my-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <div className="p-6 space-y-5">
            <div className="text-center">
              <DnaLogo size={28} className="mx-auto mb-3 opacity-70" />
              <div
                className="text-[9px] tracking-[3px] text-red-400/70 uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ ACCOUNT TERMINATION
              </div>
              <h2
                className="text-[18px] tracking-[2px] text-white uppercase"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Permanently delete your account?
              </h2>
            </div>

            <p
              className="text-[13px] text-[#a78bfa] italic leading-relaxed text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              You are about to permanently delete your Nexcor account. This
              cannot be undone.
            </p>

            {/* "You will lose" summary */}
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
              <div
                className="text-[9px] tracking-[2px] text-red-400/70 uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ THIS WILL REMOVE
              </div>
              <ul
                className="text-[13px] text-[#e2d9f3] space-y-1.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <li className="flex justify-between">
                  <span>Your profile &amp; avatar</span>
                  <span className="text-[#7a6a9a] text-[12px]">always</span>
                </li>
                <li className="flex justify-between">
                  <span>Characters you created</span>
                  <span className="text-cyan-400 font-mono text-[12px]">
                    {stats.characterCount}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Conversations</span>
                  <span className="text-cyan-400 font-mono text-[12px]">
                    {stats.conversationCount}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Messages</span>
                  <span className="text-cyan-400 font-mono text-[12px]">
                    {stats.messageCount.toLocaleString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Marks balance</span>
                  <span className="text-cyan-400 font-mono text-[12px]">
                    {stats.marksBalance.toLocaleString()} ⟡ (≈ ${usdValue})
                  </span>
                </li>
              </ul>
            </div>

            <p
              className="text-[11px] text-[#7a6a9a] italic leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conversations <em>other users</em> had with your public characters
              are preserved (they&apos;ll see &quot;character deleted&quot;).
            </p>

            {/* Confirmation input */}
            <div>
              <label
                className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Type <span className="text-red-400">{username}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={username}
                autoFocus
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-red-500/40 transition-all text-center"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* Acknowledgment checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 accent-red-500"
              />
              <span
                className="text-[12px] text-[#c0b8d8]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                I understand this is permanent and irreversible.
              </span>
            </label>

            {error && (
              <div className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-[12px]">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={!canDelete}
                className="w-full py-3 rounded-lg bg-red-500 text-white font-bold text-[11px] tracking-[3px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {deleting ? "TERMINATING..." : "◈ PERMANENTLY DELETE MY ACCOUNT"}
              </button>
              <button
                onClick={onClose}
                disabled={deleting}
                className="w-full py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL
              </button>
            </div>

            <p
              className="text-[8px] tracking-[3px] text-purple-500/20 text-center uppercase pt-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              SESTRA PROTOCOL · 324B21
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
