"use client";

import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({
  title = "No subjects match your search",
  message = "Try adjusting filters or clearing your search.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <DnaLogo size={48} className="opacity-30 mb-6" />
      <h3
        className="text-[16px] tracking-[3px] text-[#c0b8d8] mb-2 uppercase"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-[#7a6a9a] italic max-w-sm mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {message}
      </p>
      <p
        className="text-[8px] tracking-[3px] text-purple-500/25 uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        NEOLUTION ARCHIVES · NO MATCH FOUND · 324B21
      </p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-block px-6 py-3 rounded-lg border border-cyan-400/40 text-[11px] tracking-[3px] text-cyan-400 hover:bg-cyan-400/5 transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-6 py-3 rounded-lg border border-cyan-400/40 text-[11px] tracking-[3px] text-cyan-400 hover:bg-cyan-400/5 transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
