"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CharacterStat {
  id: string;
  name: string;
  avatar_url: string | null;
  visibility: string;
  is_nsfw: boolean;
  chat_count: number;
  new_chats_7d: number;
  avg_rating: number | null;
  total_ratings: number;
  favorite_count: number;
  created_at: string;
}

interface Totals {
  chats: number;
  ratings: number;
  favorites: number;
  mark_spend_30d: number;
}

const mono: React.CSSProperties = { fontFamily: "var(--font-mono, monospace)" };
const body: React.CSSProperties = { fontFamily: "var(--font-body, sans-serif)" };

function StatCard({ label, value, sub, color = "#00e5ff" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 12, border: `1px solid ${color}22`, background: `${color}07`, flex: 1, minWidth: 140 }}>
      <p style={{ ...mono, fontSize: 8, letterSpacing: 3, color: `${color}88`, textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
      <p style={{ ...mono, fontSize: 28, fontWeight: 800, color, marginBottom: 2 }}>{value}</p>
      {sub && <p style={{ ...body, fontSize: 11, color: "rgba(122,106,154,0.5)" }}>{sub}</p>}
    </div>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return <span style={{ ...mono, fontSize: 10, color: "rgba(122,106,154,0.4)" }}>No ratings</span>;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ color: "#fb923c", fontSize: 12 }}>★</span>
      <span style={{ ...mono, fontSize: 12, color: "#fb923c" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export function CreatorAnalyticsClient() {
  const [data,    setData]    = useState<{ characters: CharacterStat[]; totals: Totals } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/analytics")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#05020d", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ ...mono, fontSize: 9, letterSpacing: 4, color: "rgba(0,229,255,0.4)", textTransform: "uppercase", marginBottom: 6 }}>
            ◈ CREATOR DASHBOARD
          </p>
          <h1 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2, textTransform: "uppercase" }}>
            Analytics
          </h1>
          <p style={{ ...body, fontSize: 13, color: "rgba(122,106,154,0.6)", marginTop: 4 }}>
            Performance across all your characters
          </p>
        </div>

        {loading ? (
          <p style={{ ...mono, fontSize: 10, color: "rgba(122,106,154,0.4)", letterSpacing: 3 }}>LOADING…</p>
        ) : !data ? (
          <p style={{ ...body, fontSize: 13, color: "#f87171" }}>Failed to load analytics.</p>
        ) : (
          <>
            {/* ── Totals ── */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard label="Total Chats"    value={data.totals.chats.toLocaleString()}     color="#00e5ff" />
              <StatCard label="Favorites"      value={data.totals.favorites.toLocaleString()}  color="#a78bfa" />
              <StatCard label="Ratings"        value={data.totals.ratings.toLocaleString()}    color="#fb923c" />
              <StatCard label="⟡ Marks Spent (30d)" value={`⟡ ${data.totals.mark_spend_30d.toLocaleString()}`} sub="by users chatting" color="#34d399" />
            </div>

            {/* ── Characters table ── */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)", overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", gap: 0, padding: "10px 20px", background: "rgba(8,4,26,0.9)", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                {["CHARACTER", "CHATS", "+7 DAYS", "RATING", "FAVS", ""].map(h => (
                  <span key={h} style={{ ...mono, fontSize: 8, letterSpacing: 2, color: "rgba(122,106,154,0.5)", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {data.characters.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <p style={{ ...body, fontSize: 13, color: "rgba(122,106,154,0.5)" }}>No characters yet.</p>
                  <Link href="/create" style={{ ...mono, fontSize: 10, letterSpacing: 2, color: "#00e5ff", textDecoration: "none", textTransform: "uppercase" }}>Create one →</Link>
                </div>
              ) : data.characters.map((c, i) => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", gap: 0, padding: "14px 20px", background: i % 2 === 0 ? "rgba(8,4,26,0.6)" : "transparent", borderBottom: "1px solid rgba(124,58,237,0.07)", alignItems: "center" }}>

                  {/* Name + avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {c.avatar_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.avatar_url} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ ...mono, fontSize: 12, color: "#a78bfa" }}>{c.name[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ ...body, fontSize: 13, color: "#e2d9f3", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                      <div style={{ display: "flex", gap: 4 }}>
                        {c.visibility !== "public" && <span style={{ ...mono, fontSize: 7, letterSpacing: 1, color: "rgba(251,146,60,0.7)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 3, padding: "1px 4px", textTransform: "uppercase" }}>{c.visibility}</span>}
                        {c.is_nsfw && <span style={{ ...mono, fontSize: 7, letterSpacing: 1, color: "rgba(239,68,68,0.7)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 3, padding: "1px 4px", textTransform: "uppercase" }}>NSFW</span>}
                      </div>
                    </div>
                  </div>

                  {/* Chats */}
                  <span style={{ ...mono, fontSize: 13, color: "#00e5ff" }}>{(c.chat_count ?? 0).toLocaleString()}</span>

                  {/* New 7d */}
                  <span style={{ ...mono, fontSize: 13, color: c.new_chats_7d > 0 ? "#34d399" : "rgba(122,106,154,0.4)" }}>
                    {c.new_chats_7d > 0 ? `+${c.new_chats_7d}` : "—"}
                  </span>

                  {/* Rating */}
                  <StarRating rating={c.avg_rating} />

                  {/* Favorites */}
                  <span style={{ ...mono, fontSize: 13, color: "#a78bfa" }}>{c.favorite_count}</span>

                  {/* Edit link */}
                  <Link href={`/character/${c.id}/edit`} style={{ ...mono, fontSize: 9, letterSpacing: 2, color: "rgba(0,229,255,0.5)", textDecoration: "none", textTransform: "uppercase" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00e5ff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.5)"; }}
                  >
                    EDIT →
                  </Link>
                </div>
              ))}
            </div>

            <p style={{ ...mono, fontSize: 8, letterSpacing: 2, color: "rgba(122,106,154,0.3)", textTransform: "uppercase", marginTop: 16, textAlign: "center" }}>
              Stats update in real time · ⟡ spend figures are platform-wide approximations
            </p>
          </>
        )}
      </div>
    </main>
  );
}
