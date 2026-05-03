"use client";

import { useState } from "react";
import Link from "next/link";
import { DnaLogo } from "@/components/DnaLogo";

const SUBJECTS = [
  "General question",
  "Privacy / data request",
  "Payment issue",
  "Report content",
  "Bug report",
  "Other",
];

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#05020d] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-10">
          <DnaLogo size={36} />
          <h1
            className="mt-3 text-[#00e5ff] text-xl tracking-[5px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            NEXCOR
          </h1>
          <p
            className="text-[7px] tracking-[3px] text-purple-500/20 mt-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SUPPORT CHANNEL · 324B21
          </p>
        </div>

        <div className="relative rounded-2xl border border-purple-700/20 bg-[#0c0520]/80 p-8 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-2xl" />

          {status === "sent" ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                className="text-white tracking-[3px] text-lg mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                MESSAGE SENT
              </h2>
              <p className="text-[#7a6a9a] text-sm italic mb-6" style={{ fontFamily: "var(--font-body)" }}>
                We read every message personally and will get back to you soon.
              </p>
              <Link
                href="/"
                className="text-[10px] tracking-[2px] text-[#a78bfa] hover:text-[#00e5ff] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ← RETURN HOME
              </Link>
            </div>
          ) : (
            <>
              <h2
                className="text-white text-center mb-1 tracking-[3px] text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                CONTACT US
              </h2>
              <p
                className="text-center text-sm text-[#7a6a9a] mb-8 italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                We read every message personally.
              </p>

              {status === "error" && (
                <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Your name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Name"
                      className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Your email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@email.com"
                      className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm focus:outline-none focus:border-cyan-400/50 transition-all duration-200 appearance-none"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} className="bg-[#0c0520]">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[9px] tracking-[2px] text-[#7a6a9a] mb-2 uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    maxLength={2000}
                    placeholder="Describe your issue or question..."
                    className="w-full bg-[#08041a] border border-purple-700/25 rounded-lg px-4 py-3 text-[#e2d9f3] text-sm placeholder-[#3a2a5a] focus:outline-none focus:border-cyan-400/50 transition-all duration-200 resize-none"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <p className="text-right text-[9px] text-[#3a2a5a] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                    {message.length}/2000
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-lg font-bold text-[11px] tracking-[3px] text-black bg-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] disabled:opacity-50 transition-all duration-200 mt-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {status === "sending" ? "TRANSMITTING..." : "SEND MESSAGE →"}
                </button>
              </form>

              <p
                className="text-center text-xs text-[#3a2a5a] mt-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Link href="/terms" className="text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors">Terms</Link>
                {" · "}
                <Link href="/privacy" className="text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors">Privacy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
