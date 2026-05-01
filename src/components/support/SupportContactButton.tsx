"use client";

import { useState } from "react";
import { SupportContactDialog } from "./SupportContactDialog";

/**
 * Drop this component into the Settings page (or anywhere else) to give
 * users a "Contact Support" button that opens the support form dialog.
 *
 * Usage in Settings page:
 *   import { SupportContactButton } from "@/components/support/SupportContactButton";
 *   ...
 *   <SupportContactButton />
 */
export function SupportContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center justify-between w-full px-4 py-3 rounded-lg border border-purple-700/20 bg-[#0c0520]/60 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="text-left">
            <div
              className="text-[13px] text-[#e2d9f3] tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contact Support
            </div>
            <div
              className="text-[11px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Bug, payment, feedback — we read every message
            </div>
          </div>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6a9a"
          strokeWidth="2"
          className="group-hover:translate-x-0.5 group-hover:stroke-cyan-400 transition-all"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <SupportContactDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
