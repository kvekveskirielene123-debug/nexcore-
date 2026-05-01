"use client";

import Link from "next/link";

interface CharacterDossierProps {
  subjectId: string;
  creatorUsername: string | null;
  creatorId: string | null;
  isPlatformCreator: boolean;
  genderPronouns: string;
  tier: "standard" | "brilliant";
  isNsfw: boolean;
  chatCount: number;
  createdAt: string;
}

function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffSec = Math.max(1, Math.floor((now - t) / 1000));
  if (diffSec < 60) return "just now";
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function CharacterDossier({
  subjectId,
  creatorUsername,
  creatorId,
  isPlatformCreator,
  genderPronouns,
  tier,
  isNsfw,
  chatCount,
  createdAt,
}: CharacterDossierProps) {
  return (
    <div
      className="rounded-xl border border-purple-700/20 bg-[#0c0520]/60 overflow-hidden"
    >
      {/* Top cyan line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="p-5">
        <div
          className="text-[9px] tracking-[3px] text-[#00e5ff]/40 uppercase mb-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ◈ DOSSIER · 324B21
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-4">
          <DossierField label="Subject ID" value={subjectId} mono />

          <DossierField label="Creator" mono>
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{creatorUsername ?? "—"}</span>
              {isPlatformCreator && (
                <span
                  className="inline-block px-1.5 py-[1px] rounded border border-cyan-400/40 bg-cyan-400/10 text-[7px] tracking-[1.5px] text-cyan-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ◈ NEXCOR
                </span>
              )}
            </span>
          </DossierField>

          <DossierField label="Pronouns" value={genderPronouns} />

          <DossierField label="Tier" mono>
            {tier === "brilliant" ? (
              <span
                className="inline-block text-[10px] tracking-[2px] uppercase px-1.5 py-[1px] rounded border"
                style={{
                  fontFamily: "var(--font-mono)",
                  borderColor: "rgba(250,204,21,0.4)",
                  color: "#fcd34d",
                  background: "rgba(250,204,21,0.08)",
                  textShadow: "0 0 6px rgba(250,204,21,0.4)",
                }}
              >
                ◈ BRILLIANT
              </span>
            ) : (
              <span className="text-[10px] tracking-[2px] uppercase text-[#a78bfa]/70">
                STANDARD
              </span>
            )}
          </DossierField>

          <DossierField
            label="Chats"
            value={chatCount.toLocaleString()}
            mono
          />

          <DossierField label="Created" value={formatRelativeDate(createdAt)} mono />

          {isNsfw && (
            <DossierField label="Rating" mono>
              <span
                className="inline-block px-1.5 py-[1px] rounded border border-amber-500/40 bg-amber-500/10 text-[9px] tracking-[1.5px] text-amber-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                NSFW · 18+
              </span>
            </DossierField>
          )}
        </div>
      </div>
    </div>
  );
}

function DossierField({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div
        className="text-[8px] tracking-[2px] text-[#7a6a9a]/70 uppercase mb-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div
        className={`text-[12px] ${
          mono ? "tracking-[1px]" : ""
        } text-[#e2d9f3] truncate`}
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        }}
      >
        {children ?? value ?? "—"}
      </div>
    </div>
  );
}
