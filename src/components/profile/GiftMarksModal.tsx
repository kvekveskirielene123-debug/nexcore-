"use client";

import { useState } from "react";

const AMOUNTS = [5, 10, 25, 50, 100];

interface Props {
  toUserId: string;
  toUsername: string;
  senderBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export function GiftMarksModal({ toUserId, toUsername, senderBalance, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<number>(10);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleGift = async () => {
    if (sending || done) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/marks/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, amount: selected }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setDone(true);
      onSuccess(data.new_balance);
      setTimeout(onClose, 2200);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,2,13,0.88)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 settings-card-enter"
        style={{
          background: "rgba(9,4,26,0.97)",
          border: "1px solid rgba(0,229,255,0.2)",
          boxShadow: "0 0 60px rgba(0,229,255,0.08)",
        }}
      >
        {/* Top line */}
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5), transparent)" }} />

        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">⟡</div>
            <div
              className="text-[14px] font-bold tracking-[2px] mb-2"
              style={{ fontFamily: "var(--font-display)", color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.6)" }}
            >
              GIFT SENT
            </div>
            <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(167,139,250,0.7)" }}>
              {selected} ⟡ sent to {toUsername}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <div className="text-[10px] tracking-[3px] uppercase mb-1" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.4)" }}>
                ◈ GIFT MARKS
              </div>
              <div className="text-[16px] font-bold tracking-[2px]" style={{ fontFamily: "var(--font-display)", color: "rgba(226,217,243,0.9)" }}>
                Send to {toUsername}
              </div>
              <div className="text-[11px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}>
                Your balance: {senderBalance.toLocaleString()} ⟡
              </div>
            </div>

            {/* Amount picker */}
            <div className="flex flex-wrap gap-2 mb-5">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelected(a)}
                  disabled={a > senderBalance}
                  className="flex-1 min-w-[56px] py-2 rounded-lg text-[12px] font-bold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: selected === a ? "rgba(0,229,255,0.15)" : "rgba(124,58,237,0.07)",
                    border: `1px solid ${selected === a ? "rgba(0,229,255,0.55)" : "rgba(124,58,237,0.2)"}`,
                    color: selected === a ? "#00e5ff" : "rgba(226,217,243,0.7)",
                    boxShadow: selected === a ? "0 0 12px rgba(0,229,255,0.25)" : undefined,
                  }}
                >
                  {a} ⟡
                </button>
              ))}
            </div>

            {error && (
              <p className="text-[11px] mb-4 text-center" style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.8)" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-[10px] tracking-[2px] font-bold uppercase transition-all duration-150 hover:opacity-80"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "rgba(122,106,154,0.7)",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleGift}
                disabled={sending || selected > senderBalance}
                className="flex-[2] py-2.5 rounded-lg text-[10px] tracking-[2px] font-bold uppercase transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(0,100,255,0.12))",
                  border: "1px solid rgba(0,229,255,0.45)",
                  color: "#00e5ff",
                  boxShadow: "0 0 16px rgba(0,229,255,0.15)",
                }}
              >
                {sending ? "SENDING…" : `SEND ${selected} ⟡`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
