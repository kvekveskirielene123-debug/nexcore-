"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MARK_PACKS } from "@/lib/ai/modelConfig";
import { MarkPackCard } from "@/components/store/MarkPackCard";
import { PurchaseSuccessModal } from "@/components/store/PurchaseSuccessModal";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  const [balance, setBalance] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(status === "success");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("marks")
        .eq("id", user.id)
        .single();
      if (data) setBalance(data.marks);
    });
  }, [status]);

  const closeSuccess = () => {
    setShowSuccess(false);
    router.replace("/store");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ MARK EXCHANGE · 324B21
            </div>
            <h1
              className="text-[36px] md:text-[48px] font-black tracking-[5px] text-white uppercase"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 40px rgba(0,229,255,0.25)",
              }}
            >
              MARK STORE
            </h1>
            <p
              className="text-sm text-[#7a6a9a] italic mt-3 max-w-lg mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Purchase Marks to converse with Sonnet and Opus. Haiku is always free.
            </p>

            {balance !== null && (
              <div
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5"
              >
                <span
                  className="text-[10px] tracking-[2px] text-[#7a6a9a] uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  YOUR BALANCE ·
                </span>
                <span
                  className="text-cyan-400 font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {balance.toLocaleString()} ⟡
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MARK_PACKS.map((pack) => (
              <MarkPackCard key={pack.id} pack={pack} />
            ))}
          </div>

          <p
            className="text-[10px] tracking-[2px] text-[#5a4a7a] text-center mt-8 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            PAYMENTS SECURED BY STRIPE · NEOLUTION SCIENCE DIVISION
          </p>
        </div>
      </main>

      <PurchaseSuccessModal open={showSuccess} onClose={closeSuccess} />
    </>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05020d]" />}>
      <StoreContent />
    </Suspense>
  );
}
