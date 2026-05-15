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
    <article
      className="rounded-xl overflow-hidden relative transition-all duration-200"
      style={{
        background: "rgba(8,4,24,0.75)",
        border: "1px solid rgba(124,58,237,0.22)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.4)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(167,139,250,0.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.22)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      }}
    >
      {/* Top accent strip */}
      <div className="h-px w-full" style={{ background: "linear-gradient(to right,transparent,rgba(167,139,250,0.5),rgba(0,229,255,0.3),transparent)" }} />

      <div className="p-5 flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {persona.avatar_url ? (
            <div
              className="w-[60px] h-[60px] rounded-full overflow-hidden"
              style={{ border: "2px solid rgba(167,139,250,0.4)", boxShadow: "0 0 16px rgba(167,139,250,0.15)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={persona.avatar_url} alt={persona.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(167,139,250,0.15))",
                border: "2px solid rgba(167,139,250,0.35)",
                boxShadow: "0 0 16px rgba(167,139,250,0.12)",
              }}
            >
              <span
                className="text-[22px] font-black"
                style={{ fontFamily: "var(--font-display)", color: "#a78bfa" }}
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
              className="text-[18px] tracking-[1.5px] text-white truncate"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {persona.name}
            </h3>
            <span
              className="text-[9px] tracking-[1.5px] shrink-0"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.45)" }}
            >
              {persona.age}y
            </span>
          </div>

          <p
            className="text-[10px] tracking-[1.5px] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.65)" }}
          >
            {persona.gender_pronouns}
          </p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {tone && (
              <span
                className="px-2 py-0.5 rounded-md text-[8px] tracking-[1.5px] uppercase"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.22)", color: "rgba(0,229,255,0.8)" }}
              >
                ◈ {tone.label}
              </span>
            )}
            {persona.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[8px] tracking-[1px] uppercase"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.65)" }}
              >
                {tag}
              </span>
            ))}
            {persona.tags.length > 3 && (
              <span className="text-[8px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>+{persona.tags.length - 3}</span>
            )}
          </div>

          {persona.bio && (
            <p
              className="text-[12px] italic mt-2.5 leading-relaxed line-clamp-2"
              style={{ fontFamily: "var(--font-body)", color: "rgba(192,184,216,0.55)" }}
            >
              {persona.bio}
            </p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex items-center justify-end gap-2 px-5 py-2.5 border-t"
        style={{ borderColor: "rgba(124,58,237,0.12)", background: "rgba(5,2,13,0.3)" }}
      >
        <Link
          href={`/personas/${persona.id}/edit`}
          className="px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all duration-150"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(167,139,250,0.07)",
            border: "1px solid rgba(167,139,250,0.2)",
            color: "rgba(167,139,250,0.7)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#00e5ff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.7)"; }}
        >
          EDIT
        </Link>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all duration-150"
            style={{ fontFamily: "var(--font-mono)", background: "transparent", border: "1px solid rgba(124,58,237,0.12)", color: "rgba(122,106,154,0.4)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.7)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.4)"; }}
          >
            DELETE
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] tracking-[1.5px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.8)" }}>SURE?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase font-bold disabled:opacity-50"
              style={{ fontFamily: "var(--font-mono)", background: "rgba(239,68,68,0.85)", color: "white", border: "none" }}
            >
              {deleting ? "..." : "YES"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-2.5 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase disabled:opacity-50 transition-all"
              style={{ fontFamily: "var(--font-mono)", background: "transparent", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.6)" }}
            >
              NO
            </button>
          </div>
        )}
      </div>
      {error && (
        <div
          className="px-5 py-2 border-t text-[11px]"
          style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "rgba(239,68,68,0.8)" }}
        >
          {error}
        </div>
      )}
    </article>
  );
}
