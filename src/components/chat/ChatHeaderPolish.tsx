"use client";

// PREMIUM (Phase 1) · Polished chat header with:
//   - Smooth dropdown openings (fade + scale + slight slide)
//   - Active item with cyan glow and checkmark
//   - Hover lift on tiles
//   - Better focus rings for keyboard nav
//
// This is a representative pattern — adapt it to merge with your
// existing ChatHeader (which has model picker, persona picker,
// conversations menu, marks display, etc.).
//
// The CORE polish patterns to apply:
//   1. Use `nx-hover-lift` on clickable tiles
//   2. Wrap dropdowns in <DropdownPanel> below for the smooth open animation
//   3. Use the active glow pattern shown in ModelPickerExample

import { useEffect, useRef, useState } from "react";

// ── DropdownPanel: reusable smooth-open wrapper ─────────
interface DropdownPanelProps {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

export function DropdownPanel({
  open,
  onClose,
  align = "right",
  className = "",
  children,
}: DropdownPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={`absolute top-full mt-2 z-30 rounded-xl border backdrop-blur-md overflow-hidden ${
        align === "right" ? "right-0" : "left-0"
      } ${className}`}
      style={{
        background: "rgba(12,5,32,0.97)",
        borderColor: "var(--chat-input-border)",
        boxShadow: "0 12px 40px -8px rgba(0,0,0,0.6), 0 0 24px -8px var(--chat-accent-glow, rgba(0,229,255,0.3))",
        animation: "nx-dropdown-in 0.18s cubic-bezier(0.22,0.7,0.32,1)",
        transformOrigin: align === "right" ? "top right" : "top left",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--chat-accent), transparent)",
          opacity: 0.4,
        }}
      />

      {children}

      <style jsx>{`
        @keyframes nx-dropdown-in {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [role="menu"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── DropdownItem: reusable menu row with active-glow + hover ──
interface DropdownItemProps {
  active?: boolean;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function DropdownItem({
  active,
  onClick,
  disabled,
  children,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full px-4 py-3 text-left transition-all border-b last:border-b-0 ${
        active
          ? "bg-cyan-400/8"
          : "hover:bg-cyan-400/5 disabled:opacity-40 disabled:cursor-not-allowed"
      }`}
      style={{
        borderColor: "rgba(124,58,237,0.1)",
        boxShadow: active
          ? "inset 3px 0 0 var(--chat-accent)"
          : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">{children}</div>
        {active && (
          <span
            className="text-[10px] tracking-[1.5px] uppercase flex-shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--chat-accent)",
              textShadow:
                "0 0 8px var(--chat-accent-glow, rgba(0,229,255,0.5))",
            }}
          >
            ◈ ACTIVE
          </span>
        )}
      </div>
    </button>
  );
}

// ── Example: Model Picker using the new patterns ────────
//
// Use this as a reference when patching your existing ModelPicker.
//
// const [open, setOpen] = useState(false);
//
// <div className="relative">
//   <button
//     onClick={() => setOpen(o => !o)}
//     className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-[10px] tracking-[1.5px] nx-hover-lift transition-all"
//     style={{
//       background: "var(--chat-surface)",
//       borderColor: "var(--chat-input-border)",
//       color: "var(--chat-accent)",
//       fontFamily: "var(--font-mono)",
//     }}
//   >
//     ◉ {currentModel.toUpperCase()} ▼
//   </button>
//
//   <DropdownPanel open={open} onClose={() => setOpen(false)} className="w-64">
//     <div className="px-4 py-2.5 text-[9px] tracking-[2px] uppercase border-b" style={{ borderColor: "rgba(124,58,237,0.15)", color: "var(--chat-text-muted)", fontFamily: "var(--font-mono)" }}>
//       ◈ MODEL TIER
//     </div>
//     {(['haiku','sonnet','opus'] as const).map(model => (
//       <DropdownItem key={model} active={currentModel === model} onClick={() => { setModel(model); setOpen(false); }}>
//         <div>
//           <div className="text-[12px] font-bold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)", color: "var(--chat-text)" }}>{MODELS[model].label}</div>
//           <div className="text-[10px] mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--chat-text-muted)" }}>{MODELS[model].description} · {MODELS[model].cost} ⟡</div>
//         </div>
//       </DropdownItem>
//     ))}
//   </DropdownPanel>
// </div>
