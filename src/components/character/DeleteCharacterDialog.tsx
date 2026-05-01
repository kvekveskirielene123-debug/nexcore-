"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DnaLogo } from "@/components/DnaLogo";

interface DeleteCharacterDialogProps {
  open: boolean;
  characterId: string;
  characterName: string;
  onClose: () => void;
}

export function DeleteCharacterDialog({
  open,
  characterId,
  characterName,
  onClose,
}: DeleteCharacterDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmText("");
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

  const matches = confirmText.trim() === characterName.trim();

  const handleDelete = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete. Try again.");
        setDeleting(false);
        return;
      }
      // Success — redirect home
      router.push("/explore");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Network error.");
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0c0520] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <div className="p-6 text-center space-y-5">
            <DnaLogo size={32} className="mx-auto opacity-70" />

            <div>
              <div
                className="text-[9px] tracking-[3px] text-red-400/70 uppercase mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ SUBJECT TERMINATION
              </div>
              <h2
                className="text-[20px] tracking-[2px] text-white uppercase mb-1"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Delete {characterName}?
              </h2>
              <p
                className="text-[13px] text-[#a78bfa] italic leading-relaxed mt-3"
                style={{ fontFamily: "var(--font-body)" }}
              >
                This cannot be undone. {characterName} will be removed from Explore and can no longer be chatted with.
                <br />
                <span className="text-[#7a6a9a] text-[12px]">
                  Existing users&apos; conversations will remain in their chat archives, marked as &quot;character deleted.&quot;
                </span>
              </p>
            </div>

            <div>
              <label
                className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 text-left uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Type <span className="text-red-400">{characterName}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={characterName}
                autoFocus
                className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-3 py-2.5 text-sm text-[#e2d9f3] placeholder-[#3a2a5a] focus:outline-none focus:border-red-500/40 transition-all text-center"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-[12px] text-left">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDelete}
                disabled={!matches || deleting}
                className="w-full py-3 rounded-lg bg-red-500 text-white font-bold text-[11px] tracking-[3px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {deleting ? "TERMINATING..." : "◈ PERMANENTLY DELETE"}
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
          </div>
        </div>
      </div>
    </>
  );
}
