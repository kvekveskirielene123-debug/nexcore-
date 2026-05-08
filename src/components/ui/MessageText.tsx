/**
 * Renders roleplay-style message text.
 * *action/narration* → italic, purple-muted
 * "dialogue" → slightly bright
 * Plain text → default color
 */

import React from "react";

interface Props {
  text: string;
  className?: string;
  truncate?: number;
}

export function MessageText({ text, className, truncate }: Props) {
  const display = truncate && text.length > truncate ? text.slice(0, truncate) + "…" : text;

  // Split on *...* blocks (single-line or multi-line asterisk spans)
  const parts = display.split(/(\*[\s\S]+?\*)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em
              key={i}
              style={{
                fontStyle: "italic",
                color: "#b8a8d8",
                opacity: 0.9,
              }}
            >
              {part.slice(1, -1)}
            </em>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
