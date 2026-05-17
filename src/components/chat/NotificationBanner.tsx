"use client";

import { useState } from "react";

interface NotificationBannerProps {
  message: string;
}

export function NotificationBanner({ message }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="mx-3 mt-2 mb-0 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs"
      style={{
        background: "linear-gradient(90deg, rgba(124,58,237,0.1) 0%, rgba(109,40,217,0.06) 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        color: "rgba(192,132,252,0.85)",
        fontFamily: "var(--font-body)",
        animation: "nx-message-in 0.3s ease both",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="flex-1 leading-relaxed">{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-100 active:scale-90"
        style={{ opacity: 0.5 }}
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
