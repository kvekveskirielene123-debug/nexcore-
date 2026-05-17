"use client";

import { useState } from "react";
import { PayPalCheckoutModal } from "./PayPalCheckoutModal";

interface PayPalCTAButtonProps {
  tier: string;
  highlight: boolean;
  label?: string;
}

export function PayPalCTAButton({
  tier,
  highlight,
  label = "◈ GET BRILLIANT →",
}: PayPalCTAButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full py-3.5 rounded-xl text-[10px] tracking-[3px] font-bold transition-all duration-200 ${
          highlight
            ? "bg-cyan-400 text-black hover:shadow-[0_0_32px_rgba(0,229,255,0.55)] hover:scale-[1.02] active:scale-95"
            : "border border-purple-500/40 text-[#a78bfa] hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-400/5 active:scale-95"
        }`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </button>

      <PayPalCheckoutModal
        open={open}
        initialTier={tier}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
