"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MARK_PACKS } from "@/lib/ai/modelConfig";
import { MarkPackCard } from "@/components/store/MarkPackCard";
import { PurchaseSuccessModal } from "@/components/store/PurchaseSuccessModal";
import { ConfirmPurchaseModal } from "@/components/store/ConfirmPurchaseModal";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { MarkPack } from "@/lib/ai/modelConfig";

function MarkLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Breathing outer ring */}
      <circle cx="32" cy="32" r="30" stroke="rgba(0,229,255,0.25)" strokeWidth="1" className="animate-mark-ring-breathe" />
      <circle cx="32" cy="32" r="22" stroke="rgba(0,229,255,0.12)" strokeWidth="1" />
      {/* Slowly rotating diamond */}
      <g className="animate-mark-diamond-spin" style={{ transformOrigin: "32px 32px" }}>
        <path d="M32 10 L54 32 L32 54 L10 32 Z" stroke="rgba(0,229,255,0.6)" strokeWidth="1.5" fill="rgba(0,229,255,0.06)" />
        <path d="M32 20 L44 32 L32 44 L20 32 Z" stroke="rgba(0,229,255,0.4)" strokeWidth="1" fill="rgba(0,229,255,0.04)" />
      </g>
      {/* Center dot pulses */}
      <circle cx="32" cy="32" r="3" fill="#00e5ff" className="animate-mark-symbol-pulse" />
      {/* Cross hairs */}
      <line x1="32" y1="2" x2="32" y2="14" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="50" x2="32" y2="62" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="32" x2="14" y2="32" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="32" x2="62" y2="32" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BalanceOrb({ balance }: { balance: number | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mark logo ring */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)", animationDuration: "3s" }}
        />
        <MarkLogo size={72} />
      </div>

      {/* Balance number */}
      <div className="text-center animate-fade-up" style={{ animationDelay: "0.25s" }}>
        {balance === null ? (
          <div className="w-24 h-12 rounded-lg animate-pulse mx-auto" style={{ background: "rgba(0,229,255,0.1)" }} />
        ) : (
          <div
            className="text-[52px] font-black leading-none animate-mark-glow-pulse"
            style={{
              fontFamily: "var(--font-display)",
              color: "#00e5ff",
            }}
          >
            {balance >= 10000 ? `${(balance / 1000).toFixed(1)}k` : balance.toLocaleString()}
          </div>
        )}
        <div
          className="text-[11px] tracking-[4px] uppercase mt-2"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
        >
          <span className="animate-mark-symbol-pulse">⟡</span>
          {" MARKS"}
        </div>
        {balance !== null && (
          <div
            className="text-[9px] tracking-[1.5px] mt-1"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.45)" }}
          >
            YOUR CURRENT BALANCE
          </div>
        )}
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
      if (data) setBalance(data.marks ?? 0);
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.4))" }} />
              <span
                className="text-[9px] tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
              >
                ◈ MARK EXCHANGE · 324B21
              </span>
              <span className="w-12 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(0,229,255,0.4))" }} />
            </div>

            {/* Mark logo hero */}
            <div className="flex items-center justify-center gap-4 mb-4 animate-fade-up" style={{ animationDelay: "0s" }}>
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 65%)", transform: "scale(1.6)" }}
                />
                <MarkLogo size={56} />
              </div>
              <h1
                className="text-[42px] md:text-[60px] font-black tracking-[6px] uppercase animate-mark-shine"
                style={{ fontFamily: "var(--font-display)" }}
              >
                MARKS
              </h1>
            </div>

            <p
              className="text-[14px] text-[#7a6a9a] italic max-w-md mx-auto animate-fade-up"
              style={{ fontFamily: "var(--font-body)", animationDelay: "0.12s" }}
            >
              Marks power your conversations. Buy once, spend whenever.
            </p>

            {/* Balance */}
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

          {/* ── Brilliant nudge ── */}
          <a
            href="/subscribe"
            className="group flex items-center justify-between rounded-2xl px-6 py-4 mb-8 transition-all duration-200 hover:border-purple-400/40 hover:scale-[1.005]"
            style={{
              border: "1px solid rgba(167,139,250,0.18)",
              background: "rgba(12,5,32,0.7)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-[18px]"
                style={{ color: "#a78bfa", filter: "drop-shadow(0 0 8px rgba(167,139,250,0.7))" }}
              >
                ◈
              </span>
              <div>
                <div
                  className="text-[10px] tracking-[3px] uppercase font-bold"
                  style={{ fontFamily: "var(--font-mono)", color: "#a78bfa" }}
                >
                  NEXCOR BRILLIANT
                </div>
                <div
                  className="text-[9px] tracking-[1px] mt-0.5"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
                >
                  Haiku free · save up to 24% · 100 daily marks
                </div>
              </div>
            </div>
            <span
              className="text-[9px] tracking-[2px] uppercase group-hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.6)" }}
            >
              SEE PLANS →
            </span>
          </a>

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
                  desc: "Claim 50–100 free marks every 24 hours. Brilliant subscribers get double.",
                  action: "CLAIM IN SETTINGS →",
                  href: "/settings",
                  color: "167,139,250",
                },
                {
                  icon: "▶",
                  label: "WATCH AN AD",
                  desc: "Earn marks by watching short ads. Coming soon.",
                  action: "COMING SOON",
                  href: null,
                  color: "124,58,237",
                },
              ].map(({ icon, label, desc, action, href, color }) => (
                href ? (
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
                ) : (
                <div
                  key={label}
                  className="flex gap-3 p-4 rounded-xl opacity-40 cursor-not-allowed"
                  style={{
                    border: "1px solid rgba(124,58,237,0.1)",
                    background: "rgba(8,4,26,0.3)",
                  }}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5" style={{ color: `rgba(${color},0.5)` }}>{icon}</span>
                  <div>
                    <div className="text-[10px] tracking-[2px] uppercase mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.6)` }}>
                      {label}
                      <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.2)` }}>SOON</span>
                    </div>
                    <p className="text-[11px] text-[#7a6a9a] italic mb-2" style={{ fontFamily: "var(--font-body)" }}>{desc}</p>
                    <span className="text-[9px] tracking-[1.5px]" style={{ fontFamily: "var(--font-mono)", color: `rgba(${color},0.4)` }}>{action}</span>
                  </div>
                </div>
                )
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
