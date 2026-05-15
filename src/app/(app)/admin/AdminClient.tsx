"use client";

import { useState, useEffect, useCallback } from "react";

type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

interface Report {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reporter: { id: string; username: { username: string } | null } | null;
}

const STATUS_TABS: ReportStatus[] = ["pending", "reviewed", "actioned", "dismissed"];

const REASON_LABELS: Record<string, string> = {
  spam:           "Spam",
  nsfw_unlabeled: "NSFW unlabeled",
  harassment:     "Harassment",
  misinformation: "Misinfo",
  illegal:        "Illegal",
  other:          "Other",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending:   "#fb923c",
  reviewed:  "#60c8ff",
  actioned:  "#34d399",
  dismissed: "rgba(122,106,154,0.5)",
};

export function AdminClient() {
  const [tab,       setTab]       = useState<ReportStatus>("pending");
  const [reports,   setReports]   = useState<Report[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banning,   setBanning]   = useState(false);
  const [banMsg,    setBanMsg]    = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${tab}&page=${page}`);
      const data = await res.json();
      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (id: string, status: ReportStatus) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReports(prev => prev.filter(r => r.id !== id));
    setTotal(t => t - 1);
  };

  const banUser = async () => {
    if (!banUserId.trim() || banning) return;
    setBanning(true); setBanMsg(null);
    const res = await fetch(`/api/admin/users/${banUserId.trim()}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: banReason }),
    });
    setBanMsg(res.ok ? "User banned." : "Failed.");
    setBanning(false);
    if (res.ok) { setBanUserId(""); setBanReason(""); }
  };

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono, monospace)" };
  const body: React.CSSProperties = { fontFamily: "var(--font-body, sans-serif)" };

  return (
    <main style={{ minHeight: "100vh", background: "#05020d", padding: "32px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ ...mono, fontSize: 9, letterSpacing: 4, color: "rgba(239,68,68,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
          ◈ NEXCOR ADMIN
        </p>
        <h1 style={{ ...mono, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>Moderation Panel</h1>
      </div>

      {/* ── Ban User ── */}
      <section style={{ marginBottom: 40, padding: "20px 24px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.04)" }}>
        <p style={{ ...mono, fontSize: 9, letterSpacing: 3, color: "rgba(239,68,68,0.5)", textTransform: "uppercase", marginBottom: 12 }}>BAN USER</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={banUserId}
            onChange={e => setBanUserId(e.target.value)}
            placeholder="User UUID"
            style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.2)", background: "#08041a", color: "#e2d9f3", ...body, fontSize: 13, outline: "none" }}
          />
          <input
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            placeholder="Reason (optional)"
            style={{ flex: 2, minWidth: 200, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.2)", background: "#08041a", color: "#e2d9f3", ...body, fontSize: 13, outline: "none" }}
          />
          <button
            onClick={banUser}
            disabled={!banUserId.trim() || banning}
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.75)", color: "#fff", ...mono, fontSize: 10, letterSpacing: 2, cursor: "pointer", fontWeight: 700, textTransform: "uppercase" }}
          >
            {banning ? "Banning…" : "BAN"}
          </button>
        </div>
        {banMsg && <p style={{ ...body, fontSize: 12, color: "#34d399", marginTop: 8 }}>{banMsg}</p>}
      </section>

      {/* ── Reports ── */}
      <section>
        <p style={{ ...mono, fontSize: 9, letterSpacing: 3, color: "rgba(0,229,255,0.4)", textTransform: "uppercase", marginBottom: 16 }}>CONTENT REPORTS</p>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(124,58,237,0.12)", paddingBottom: 0 }}>
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => { setTab(s); setPage(0); }}
              style={{
                padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "1px solid transparent",
                borderBottom: "none", background: tab === s ? "rgba(8,4,26,0.95)" : "transparent",
                color: tab === s ? STATUS_COLORS[s] : "rgba(122,106,154,0.5)",
                ...mono, fontSize: 9, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
                borderColor: tab === s ? `rgba(124,58,237,0.2)` : "transparent",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
          <span style={{ marginLeft: "auto", alignSelf: "center", ...mono, fontSize: 9, color: "rgba(122,106,154,0.4)", textTransform: "uppercase", letterSpacing: 2, paddingBottom: 8 }}>
            {total} report{total !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p style={{ ...mono, fontSize: 10, color: "rgba(122,106,154,0.4)", letterSpacing: 2 }}>LOADING…</p>
        ) : reports.length === 0 ? (
          <p style={{ ...body, fontSize: 13, color: "rgba(122,106,154,0.5)" }}>No {tab} reports.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reports.map(r => (
              <div key={r.id} style={{ padding: "16px 20px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.15)", background: "rgba(8,4,26,0.7)", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: 2, color: "rgba(0,229,255,0.6)", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.05)" }}>{r.content_type}</span>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: 2, color: `${STATUS_COLORS[r.status]}`, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, border: `1px solid ${STATUS_COLORS[r.status]}44`, background: `${STATUS_COLORS[r.status]}11` }}>{REASON_LABELS[r.reason] ?? r.reason}</span>
                  </div>
                  <p style={{ ...mono, fontSize: 11, color: "rgba(226,217,243,0.5)", marginBottom: 4, wordBreak: "break-all" }}>ID: {r.content_id}</p>
                  {r.details && <p style={{ ...body, fontSize: 12, color: "rgba(226,217,243,0.65)", marginBottom: 4 }}>{r.details}</p>}
                  <p style={{ ...mono, fontSize: 9, color: "rgba(122,106,154,0.4)", letterSpacing: 1 }}>
                    {new Date(r.created_at).toLocaleString()}
                    {r.reporter && ` · by ${r.reporter.username?.username ?? r.reporter.id.slice(0, 8)}`}
                  </p>
                </div>
                {tab === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => updateReport(r.id, "actioned")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.7)", color: "#fff", ...mono, fontSize: 9, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>ACTION</button>
                    <button onClick={() => updateReport(r.id, "reviewed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(96,200,255,0.3)", background: "transparent", color: "#60c8ff", ...mono, fontSize: 9, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>REVIEW</button>
                    <button onClick={() => updateReport(r.id, "dismissed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(124,58,237,0.2)", background: "transparent", color: "rgba(167,139,250,0.5)", ...mono, fontSize: 9, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}>DISMISS</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 25 && (
          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.2)", background: "transparent", color: "rgba(167,139,250,0.6)", ...mono, fontSize: 9, cursor: "pointer" }}>← PREV</button>
            <span style={{ ...mono, fontSize: 9, color: "rgba(122,106,154,0.5)", alignSelf: "center", textTransform: "uppercase", letterSpacing: 2 }}>Page {page + 1}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 25 >= total} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.2)", background: "transparent", color: "rgba(167,139,250,0.6)", ...mono, fontSize: 9, cursor: "pointer" }}>NEXT →</button>
          </div>
        )}
      </section>
    </main>
  );
}
