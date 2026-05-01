"use client";

import Link from "next/link";
import { useState } from "react";
import type { Persona } from "@/lib/personas/types";
import { PERSONA_TONES } from "@/lib/personas/types";

interface PersonaCardProps {
  persona: Persona;
  onDeleted: (id: string) => void;
}

export function PersonaCard({ persona, onDeleted }: PersonaCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tone = PERSONA_TONES.find((t) => t.value === persona.tone);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete.");
        setDeleting(false);
        return;
      }
      onDeleted(persona.id);
    } catch (err: any) {
      setError(err.message ?? "Network error.");
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-xl border border-purple-700/20 bg-[#0c0520]/70 overflow-hidden relative group hover:border-cyan-400/30 transition-all">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

      <div className="p-5 flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {persona.avatar_url ? (
            <div
              className="w-16 h-16 rounded-full overflow-hidden border border-cyan-400/30"
              style={{ background: "rgba(10,4,24,0.6)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={persona.avatar_url}
                alt={persona.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full border border-purple-700/30 flex items-center justify-center"
              style={{ background: "rgba(10,4,24,0.6)" }}
            >
              <span
                className="text-cyan-400 text-xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {(persona.name[0] ?? "?").toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3
              className="text-[18px] tracking-[2px] text-white truncate"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              {persona.name}
            </h3>
            <span
              className="text-[10px] tracking-[1.5px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              · {persona.age}
            </span>
          </div>

          <p
            className="text-[11px] tracking-[1.5px] text-[#a78bfa] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {persona.gender_pronouns}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {tone && (
              <span
                className="px-2 py-0.5 rounded-md border border-cyan-400/30 bg-cyan-400/8 text-[9px] tracking-[1.5px] text-cyan-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◈ {tone.label}
              </span>
            )}
            {persona.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md border border-purple-700/25 text-[9px] tracking-[1px] text-[#a78bfa]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {tag}
              </span>
            ))}
            {persona.tags.length > 4 && (
              <span className="text-[9px] text-[#7a6a9a]">+{persona.tags.length - 4}</span>
            )}
          </div>

          {persona.bio && (
            <p
              className="text-[12px] text-[#c0b8d8] italic mt-3 leading-relaxed line-clamp-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {persona.bio}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-purple-700/15 bg-[#08041a]/40">
        <Link
          href={`/personas/${persona.id}/edit`}
          className="px-3 py-1.5 rounded-md border border-purple-700/25 text-[10px] tracking-[1.5px] text-[#a78bfa] hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          EDIT
        </Link>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="px-3 py-1.5 rounded-md border border-purple-700/20 text-[10px] tracking-[1.5px] text-[#7a6a9a] hover:border-red-500/40 hover:text-red-400 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            DELETE
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] tracking-[1.5px] text-red-400"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              SURE?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1 rounded-md bg-red-500/85 text-white text-[10px] tracking-[1.5px] font-bold disabled:opacity-50 hover:bg-red-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {deleting ? "..." : "YES"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-2.5 py-1 rounded-md border border-purple-700/30 text-[10px] tracking-[1.5px] text-[#a78bfa] disabled:opacity-50 hover:border-purple-500/60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              NO
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="px-5 py-2 border-t border-red-500/20 bg-red-500/8 text-red-300 text-[11px]">
          {error}
        </div>
      )}
    </article>
  );
}
