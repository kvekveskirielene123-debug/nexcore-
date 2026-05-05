"use client";

import { useState } from "react";
import Link from "next/link";
import { PersonaCard } from "@/components/personas/PersonaCard";
import type { Persona } from "@/lib/personas/types";

interface PersonasClientProps {
  initialPersonas: Persona[];
  isSubscriber: boolean;
}

export function PersonasClient({
  initialPersonas,
  isSubscriber,
}: PersonasClientProps) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);

  const canCreate = isSubscriber || personas.length < 5;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6">
      {/* Create button */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p
            className="text-[11px] tracking-[2px] text-[#7a6a9a] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {personas.length} persona{personas.length === 1 ? "" : "s"}
            {!isSubscriber && (
              <span className="text-cyan-400/70"> · Free tier · {personas.length}/5</span>
            )}
            {isSubscriber && (
              <span className="text-cyan-400/70"> · ◈ BRILLIANT · unlimited</span>
            )}
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/personas/new"
            className="px-5 py-2.5 rounded-lg bg-cyan-400 text-black font-bold text-[10px] tracking-[3px] hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            + CREATE PERSONA
          </Link>
        ) : (
          <Link
            href="/store"
            className="px-5 py-2.5 rounded-lg border border-amber-400/40 text-amber-400 text-[10px] tracking-[3px] font-bold hover:bg-amber-400/8 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ SUBSCRIBE FOR UNLIMITED →
          </Link>
        )}
      </div>

      {/* Empty state */}
      {personas.length === 0 ? (
        <div className="rounded-xl border border-purple-700/20 bg-[#0c0520]/50 p-10 text-center">
          <div
            className="text-[10px] tracking-[3px] text-[#7a6a9a] uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ NO PERSONAS YET
          </div>
          <p
            className="text-sm text-[#a78bfa] italic mb-6 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            A persona tells the AI who <em>you</em> are. Your name, your age, your
            tone, the things that make you uniquely you. Pick one per chat — or
            shape-shift between them.
          </p>
          <Link
            href="/personas/new"
            className="inline-block px-7 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ CREATE YOUR FIRST →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {personas.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              onDeleted={(id) =>
                setPersonas((arr) => arr.filter((x) => x.id !== id))
              }
            />
          ))}
        </div>
      )}

      {!isSubscriber && personas.length >= 5 && (
        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
          <p
            className="text-[12px] text-amber-400 italic mb-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ◈ Want more personas? Subscribers get <strong>unlimited</strong>.
          </p>
          <Link
            href="/store"
            className="inline-block text-[10px] tracking-[2px] text-amber-400 hover:text-amber-300 underline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            VIEW PLANS →
          </Link>
        </div>
      )}
    </div>
  );
}
