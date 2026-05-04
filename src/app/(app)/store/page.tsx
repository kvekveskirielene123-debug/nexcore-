"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MARK_PACKS, MODELS } from "@/lib/ai/modelConfig";
import { MarkPackCard } from "@/components/store/MarkPackCard";
import { PurchaseSuccessModal } from "@/components/store/PurchaseSuccessModal";
import { ConfirmPurchaseModal } from "@/components/store/ConfirmPurchaseModal";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { MarkPack } from "@/lib/ai/modelConfig";

function BalanceOrb({ balance }: { balance: number | null }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-full mb-3"
        style={{
          width: 120,
          height: 120,
          background: "radial-gradient(circle at 35% 35%, rgba(0,229,255,0.12), rgba(8,4,26,0.9))",
          border: "1px solid rgba(0,229,255,0.3)",
          boxShadow: "0 0 60px rgba(0,229,255,0.15), inset 0 0 30px rgba(0,229,255,0.05)",
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            border: "1px solid rgba(0,229,255,0.12)",
            animationDuration: "3s",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 8,
            border: "1px solid rgba(0,229,255,0.08)",
            borderRadius: "50%",
          }}
        />

        {balance === null ? (
          <div
            className="w-8 h-8 rounded-full animate-pulse"
            style={{ background: "rgba(0,229,255,0.2)" }}
          />
        ) : (
          <div className="text-center">
            <div
              className="text-[28px] font-black leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "#00e5ff",
                textShadow: "0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4)",
              }}
            >
              {balance >= 10000 ? `${(balance / 1000).toFixed(1)}k` : balance.toLocaleString()}
            </div>
            <div
              className="text-[9px] tracking-[2px] mt-0.5"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
            >
              ⟡ MARKS
            </div>
          </div>
        )}
      </div>

      <div
        className="text-[9px] tracking-[2px] uppercase"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
      >
        YOUR CURRENT BALANCE
      </div>
      {balance !== null && (
        <div
          className="text-[10px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}
        >
          ≈ ${(balance * 0.004).toFixed(2)} USD value
        </div>
      )}
    </div>
  );
}

function ModelCostRow({
  label, std, sub, color,
}: { label: string; std: number; sub: number; color: string }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 5px ${color}` }}
        />
        <span
          className="text-[11px] tracking-[2px]"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(226,217,243,0.7)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span
          className="text-[11px] tabular-nums"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.7)" }}
        >
          {std === 0 ? "FREE" : `${std} ⟡`}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
        >
          {sub === 0 ? "FREE" : `${sub} ⟡`}
        </span>
      </div>
    </div>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  const [balance, setBalance] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(status === "success");
  const [confirmPack, setConfirmPack] = useState<MarkPack | null>(null);

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
      <main className="min-h-screen bg-[#05020d] pt-24 pb-32">

        {/* ── Ambient background ── */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(124,58,237,0.04) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">

          {/* ── Page header ── */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.4))" }} />
              <span
                className="text-[9px] tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
              >
                ◈ MARK EXCHANGE · 324B21
              </span>
              <span className="w-12 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.4))" }} />
            </div>

            <h1
              className="text-[38px] md:text-[56px] font-black tracking-[6px] text-white uppercase mb-3"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 50px rgba(0,229,255,0.2), 0 0 100px rgba(0,229,255,0.08)",
              }}
            >
              MARK STORE
            </h1>

            <p
              className="text-[14px] text-[#7a6a9a] italic max-w-md mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Marks power your conversations. Buy once, spend whenever.
            </p>

            {/* Balance orb */}
            <div className="mt-10">
              <BalanceOrb balance={balance} />
            </div>
          </div>

          {/* ── Pack grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {MARK_PACKS.map((pack) => (
              <MarkPackCard key={pack.id} pack={pack} onBuy={() => setConfirmPack(pack)} />
            ))}
          </div>

          {/* ── Model cost reference ── */}
          <div
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              border: "1px solid rgba(124,58,237,0.2)",
              background: "rgba(12,5,32,0.7)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            <div className="px-6 py-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] tracking-[3px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                >
                  ◈ COST PER MESSAGE
                </span>
                <div className="flex items-center gap-6">
                  <span
                    className="text-[9px] tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
                  >
                    FREE
                  </span>
                  <span
                    className="text-[9px] tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
                  >
                    ◈ BRILLIANT
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-2">
              {Object.values(MODELS).map((m) => (
                <ModelCostRow
                  key={m.key}
                  label={m.label}
                  std={m.costStandard}
                  sub={m.costSubscriber}
                  color={m.accentColor}
                />
              ))}
            </div>

            <div className="px-6 py-3 border-t border-white/[0.04]">
              <p
                className="text-[10px] text-[#5a4a7a] italic text-center"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Brilliant subscribers save up to 24% on every message.{" "}
                <a href="/subscribe" className="text-[#a78bfa] hover:text-cyan-400 transition-colors underline">
                  Upgrade →
                </a>
              </p>
            </div>
          </div>

          {/* ── Free marks section ── */}
          <div
            className="rounded-2xl p-6 mb-10"
            style={{
              border: "1px solid rgba(124,58,237,0.15)",
              background: "rgba(12,5,32,0.5)",
            }}
          >
            <div
              className="text-[9px] tracking-[3px] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            >
              ◈ EARN FREE MARKS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "◇",
                  label: "DAILY BONUS",
                  desc: "Claim 50 free marks every 24 hours from your settings.",
                  action: "CLAIM IN SETTINGS →",
                  href: "/settings",
                  color: "167,139,250",
                },
                {
                  icon: "▶",
                  label: "WATCH AN AD",
                  desc: "Earn 50 marks per ad. Up to 5 times every 30 minutes.",
                  action: "WATCH NOW →",
                  href: "/settings",
                  color: "124,58,237",
                },
              ].map(({ icon, label, desc, action, href, color }) => (
                <a
                  key={label}
                  href={href}
                  className="flex gap-3 p-4 rounded-xl transition-all hover:border-purple-500/30"
                  style={{
                    border: "1px solid rgba(124,58,237,0.15)",
                    background: "rgba(8,4,26,0.5)",
                  }}
                >
                  <span
                    className="text-xl flex-shrink-0 mt-0.5"
                    style={{ color: `rgba(${color},0.7)` }}
                  >
                    {icon}
                  </span>
                  <div>
                    <div
                      className="text-[10px] tracking-[2px] uppercase mb-1"
                      style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.8)` }}
                    >
                      {label}
                    </div>
                    <p
                      className="text-[11px] text-[#7a6a9a] italic mb-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {desc}
                    </p>
                    <span
                      className="text-[9px] tracking-[1.5px]"
                      style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.6)` }}
                    >
                      {action}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p
            className="text-[9px] tracking-[2px] text-[#5a4a7a] text-center uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            PAYMENTS SECURED BY STRIPE · NEOLUTION SCIENCE DIVISION · 324B21
          </p>
        </div>
      </main>

      <PurchaseSuccessModal open={showSuccess} onClose={closeSuccess} />
      <ConfirmPurchaseModal pack={confirmPack} onClose={() => setConfirmPack(null)} />
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
