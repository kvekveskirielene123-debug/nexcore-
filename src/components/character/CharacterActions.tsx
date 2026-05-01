"use client";

import { useState } from "react";
import Link from "next/link";
import { SupportContactDialog } from "@/components/support/SupportContactDialog";

interface CharacterActionsProps {
  characterId: string;
  characterName: string;
  isLoggedIn: boolean;
  isOwner: boolean;
}

export function CharacterActions({
  characterId,
  characterName,
  isLoggedIn,
  isOwner,
}: CharacterActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [favoriteOn, setFavoriteOn] = useState(false);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleFavorite = () => {
    // Package C will wire this to the DB. For now, visual-only toggle.
    setFavoriteOn((v) => !v);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
        {/* Primary: Chat */}
        {isLoggedIn ? (
          <Link
            href={`/chat/${characterId}`}
            className="px-7 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] text-center hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ▶ INITIATE CONTACT
          </Link>
        ) : (
          <Link
            href={`/signup?next=/character/${characterId}`}
            className="px-7 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] text-center hover:shadow-[0_0_36px_rgba(0,229,255,0.5)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ▶ CREATE ACCOUNT TO CHAT
          </Link>
        )}

        {/* Share */}
        <button
          onClick={handleShare}
          aria-label="Share character link"
          className="px-5 py-3 rounded-lg border border-purple-700/30 text-[10px] tracking-[2px] text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 transition-all flex items-center gap-2 justify-center"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          {copied ? "✓ COPIED · 324B21" : "SHARE"}
        </button>

        {/* Favorite (visual stub in Package A, wired in Package C) */}
        {isLoggedIn && (
          <button
            onClick={handleFavorite}
            aria-label="Favorite"
            className={`px-4 py-3 rounded-lg border text-[10px] tracking-[2px] transition-all flex items-center gap-2 justify-center ${
              favoriteOn
                ? "border-cyan-400/50 text-cyan-400 bg-cyan-400/5"
                : "border-purple-700/30 text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
            title="Favorites launching soon"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={favoriteOn ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {favoriteOn ? "SAVED" : "FAVORITE"}
          </button>
        )}

        {/* Edit (only for owner — full flow comes in Package B) */}
        {isOwner && (
          <Link
            href={`/character/${characterId}/edit`}
            className="px-4 py-3 rounded-lg border border-purple-700/30 text-[10px] tracking-[2px] text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 transition-all flex items-center gap-2 justify-center"
            style={{ fontFamily: "var(--font-mono)" }}
            title="Edit character (coming soon)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            EDIT
          </Link>
        )}

        {/* Report */}
        {isLoggedIn && (
          <button
            onClick={() => setReportOpen(true)}
            aria-label="Report character"
            className="px-4 py-3 rounded-lg border border-purple-700/20 text-[10px] tracking-[2px] text-[#7a6a9a] hover:border-red-500/40 hover:text-red-400 transition-all flex items-center gap-2 justify-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            REPORT
          </button>
        )}
      </div>

      {/* Report dialog reuses the Support flow, user can pick "Character Issue" topic */}
      <SupportContactDialog open={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
}
