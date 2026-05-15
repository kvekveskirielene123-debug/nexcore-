"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#05020d", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: "rgba(239,68,68,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
            ◈ SYSTEM ERROR
          </p>
          <h1 style={{ fontFamily: "monospace", fontSize: 24, color: "#fff", marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
            This error has been reported automatically.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 28px",
              borderRadius: 100,
              border: "1px solid rgba(0,229,255,0.35)",
              background: "rgba(0,229,255,0.08)",
              color: "#00e5ff",
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: 3,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
