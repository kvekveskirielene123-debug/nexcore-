import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export const metadata = {
  title: "Billing · Nexcor",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/billing");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("marks, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("mark_transactions")
      .select("id, amount, reason, balance_after, created_at, payment_session_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <style>{`
        @keyframes blOrbit  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes blOrbitR { from { transform: rotate(45deg);  } to { transform: rotate(-315deg); } }
        @keyframes blNode   { 0%,100% { opacity:.45; } 50% { opacity:1; } }
        @keyframes blBreathe { 0%,100% { transform:scale(1); opacity:.7; } 50% { transform:scale(1.07); opacity:1; } }
        @keyframes blScan   { 0%   { transform:translateY(-100%); opacity:0; }
                              8%   { opacity:.6; }
                              92%  { opacity:.6; }
                              100% { transform:translateY(500%); opacity:0; } }
        .bl-orbit  { animation: blOrbit   32s linear infinite; transform-origin: 60px 60px; }
        .bl-orbitr { animation: blOrbitR  20s linear infinite; transform-origin: 60px 60px; }
        .bl-cwfast { animation: blOrbit   14s linear infinite; transform-origin: 60px 60px; }
        .bl-node   { animation: blNode    2.2s ease-in-out infinite; }
        .bl-breathe{ animation: blBreathe 4s   ease-in-out infinite; }
        .bl-scan   { animation: blScan    5s   ease-in-out infinite; animation-delay: 1.5s; }
      `}</style>

      <main className="min-h-screen bg-[#05020d] pt-8 pb-32 px-4 md:px-8">
        <header className="text-center mb-10 max-w-3xl mx-auto">

          {/* ── Billing logo mark ── */}
          <div className="relative inline-flex items-center justify-center mb-6" style={{ width: 120, height: 120 }}>
            {/* Ambient glow */}
            <div
              className="absolute rounded-full pointer-events-none bl-breathe"
              style={{
                inset: -28,
                background: "radial-gradient(circle, rgba(0,212,255,0.16) 0%, rgba(0,212,255,0.04) 45%, transparent 70%)",
              }}
            />

            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">

              {/* Outer dashed ring + 4 orbital nodes */}
              <g className="bl-orbit">
                <circle cx="60" cy="60" r="54" stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="8 13" />
                <circle cx="60"  cy="6"   r="2.8" fill="#00d4ff" className="bl-node" />
                <circle cx="114" cy="60"  r="2.8" fill="#a78bfa" className="bl-node" style={{ animationDelay: ".55s" }} />
                <circle cx="60"  cy="114" r="2.8" fill="#00d4ff" className="bl-node" style={{ animationDelay: "1.1s" }} />
                <circle cx="6"   cy="60"  r="2.8" fill="#a78bfa" className="bl-node" style={{ animationDelay: "1.65s" }} />
              </g>

              {/* Mid ring (steady) */}
              <circle cx="60" cy="60" r="44" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8" />

              {/* 4 spokes: mid-ring edge → outer-ring */}
              <line x1="60"  y1="16"  x2="60"  y2="44"  stroke="rgba(0,212,255,0.14)" strokeWidth="0.9" />
              <line x1="104" y1="60"  x2="76"  y2="60"  stroke="rgba(0,212,255,0.14)" strokeWidth="0.9" />
              <line x1="60"  y1="104" x2="60"  y2="76"  stroke="rgba(0,212,255,0.14)" strokeWidth="0.9" />
              <line x1="16"  y1="60"  x2="44"  y2="60"  stroke="rgba(0,212,255,0.14)" strokeWidth="0.9" />

              {/* Outer diamond — slow CW */}
              <polygon
                points="60,16 104,60 60,104 16,60"
                fill="none" stroke="rgba(0,212,255,0.22)" strokeWidth="1.2"
                className="bl-orbit"
              />

              {/* Inner diamond — CCW */}
              <polygon
                points="60,33 87,60 60,87 33,60"
                fill="none" stroke="rgba(167,139,250,0.52)" strokeWidth="1.6"
                className="bl-orbitr"
              />

              {/* Innermost fast-spin square (45° offset) */}
              <polygon
                points="60,43 77,60 60,77 43,60"
                fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="1"
                className="bl-cwfast"
              />

              {/* Corner tick marks on inner diamond */}
              <line x1="58" y1="48" x2="62" y2="48" stroke="rgba(167,139,250,0.45)" strokeWidth="1" strokeLinecap="round" />
              <line x1="72" y1="58" x2="72" y2="62" stroke="rgba(167,139,250,0.45)" strokeWidth="1" strokeLinecap="round" />
              <line x1="58" y1="72" x2="62" y2="72" stroke="rgba(167,139,250,0.45)" strokeWidth="1" strokeLinecap="round" />
              <line x1="48" y1="58" x2="48" y2="62" stroke="rgba(167,139,250,0.45)" strokeWidth="1" strokeLinecap="round" />

              {/* Scan line inside logo */}
              <clipPath id="bl-clip">
                <circle cx="60" cy="60" r="40" />
              </clipPath>
              <line
                x1="20" y1="0" x2="100" y2="0"
                stroke="rgba(0,212,255,0.55)" strokeWidth="1.5"
                clipPath="url(#bl-clip)"
                className="bl-scan"
              />

              {/* Center ripple 1 */}
              <circle cx="60" cy="60" fill="none" stroke="rgba(0,212,255,0.55)" strokeWidth="2" r="5">
                <animate attributeName="r"       values="5;24"  dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".55;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
              {/* Center ripple 2 */}
              <circle cx="60" cy="60" fill="none" stroke="rgba(124,58,237,0.35)" strokeWidth="1.2" r="5">
                <animate attributeName="r"       values="5;30"  dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".35;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>

              {/* Center ⟡ mark */}
              <polygon
                points="60,52 68,60 60,68 52,60"
                fill="rgba(0,212,255,0.9)" stroke="white" strokeWidth="0.6"
              />
              {/* Highlight */}
              <circle cx="60" cy="60" r="2.2" fill="white" opacity="0.95" />
            </svg>
          </div>

          <div
            className="text-[10px] tracking-[4px] text-[#00e5ff]/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ◈ FINANCIAL LEDGER · 324B21
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 40px rgba(0,229,255,0.25), 0 0 80px rgba(0,229,255,0.08)",
            }}
          >
            BILLING
          </h1>
          <p
            className="text-[13px] text-[#a78bfa] italic mt-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your Marks balance, transaction history, and payment settings.
          </p>
        </header>

        <BillingClient
          transactions={transactions ?? []}
          marksBalance={profile?.marks ?? 0}
          subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
        />
      </main>
    </>
  );
}
