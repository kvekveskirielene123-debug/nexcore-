"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Persona } from "@/lib/personas/types";

interface PersonaPickerDropdownProps {
  conversationId: string;
  /** Currently active persona on this conversation, or null */
  activePersona: Persona | null;
  /** Called when the user picks a persona (or clears it) */
  onChange: (personaId: string | null) => void;
}

export function PersonaPickerDropdown({
  conversationId,
  activePersona,
  onChange,
}: PersonaPickerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Load personas the first time dropdown opens
  useEffect(() => {
    if (!open || personas !== null) return;
    setLoading(true);
    fetch("/api/personas")
      .then((r) => r.json())
      .then((d) => setPersonas(d.personas ?? []))
      .catch(() => setPersonas([]))
      .finally(() => setLoading(false));
  }, [open, personas]);

  const updatePersona = async (newPersonaId: string | null) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/persona`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_id: newPersonaId }),
      });
      if (res.ok) {
        onChange(newPersonaId);
        setOpen(false);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-[10px] tracking-[1.5px] transition-all ${
          activePersona
            ? "border-cyan-400/40 bg-cyan-400/8 text-cyan-400"
            : "border-purple-700/30 text-[#a78bfa] hover:border-cyan-400/30 hover:text-cyan-400"
        }`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {activePersona?.avatar_url && (
          <span
            className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400/30 flex-shrink-0"
            style={{ background: "rgba(10,4,24,0.6)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePersona.avatar_url}
              alt={activePersona.name}
              className="w-full h-full object-cover"
            />
          </span>
        )}
        <span className="truncate max-w-[120px]">
          {activePersona ? activePersona.name.toUpperCase() : "◈ NO PERSONA"}
        </span>
        <span className="text-[8px]">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 z-30 rounded-xl border border-purple-700/30 bg-[#0c0520]/97 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

          <div
            className="px-4 py-3 border-b border-purple-700/20 text-[9px] tracking-[2px] text-cyan-400/60 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ PERSONA FOR THIS CHAT
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p
                className="text-[11px] text-[#7a6a9a] italic text-center py-4"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Loading...
              </p>
            ) : (
              <>
                {/* "No persona" option */}
                <button
                  onClick={() => updatePersona(null)}
                  disabled={saving}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cyan-400/5 transition-colors border-b border-purple-700/10 ${
                    !activePersona ? "bg-cyan-400/5" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#7a6a9a] text-xs">∅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[12px] text-[#e2d9f3]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      No persona
                    </div>
                    <div
                      className="text-[10px] text-[#7a6a9a] mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      The AI won&apos;t know who you are.
                    </div>
                  </div>
                  {!activePersona && (
                    <span
                      className="text-[8px] tracking-[1.5px] uppercase text-cyan-400 flex-shrink-0"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ◈ ACTIVE
                    </span>
                  )}
                </button>

                {personas && personas.length > 0 ? (
                  personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updatePersona(p.id)}
                      disabled={saving}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cyan-400/5 transition-colors border-b border-purple-700/10 ${
                        activePersona?.id === p.id ? "bg-cyan-400/5" : ""
                      }`}
                    >
                      {p.avatar_url ? (
                        <div
                          className="w-8 h-8 rounded-full border border-cyan-400/30 overflow-hidden flex-shrink-0"
                          style={{ background: "rgba(10,4,24,0.6)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.avatar_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full border border-purple-700/30 flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(10,4,24,0.6)" }}
                        >
                          <span
                            className="text-cyan-400 text-xs font-bold"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {(p.name[0] ?? "?").toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[12px] text-[#e2d9f3] truncate"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {p.name}
                        </div>
                        <div
                          className="text-[10px] text-[#7a6a9a] truncate mt-0.5"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {p.age} · {p.gender_pronouns}
                        </div>
                      </div>
                      {activePersona?.id === p.id && (
                        <span
                          className="text-[8px] tracking-[1.5px] uppercase text-cyan-400 flex-shrink-0"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          ◈ ACTIVE
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p
                    className="text-[11px] text-[#7a6a9a] italic text-center py-4 px-4"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    No personas yet.
                  </p>
                )}
              </>
            )}
          </div>

          <Link
            href="/personas/new"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-[10px] tracking-[2px] text-cyan-400 hover:bg-cyan-400/8 transition-colors border-t border-purple-700/20 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            + CREATE NEW PERSONA
          </Link>
        </div>
      )}
    </div>
  );
}
