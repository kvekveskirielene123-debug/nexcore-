"use client";

import Link from "next/link";

interface RowBaseProps {
  /** The colored icon tile color (background gradient). Hex or rgba. */
  iconColor?: string;
  /** Single-letter or short symbol shown inside the tile. */
  iconSymbol?: React.ReactNode;
  /** SVG icon (overrides iconSymbol). */
  iconSvg?: React.ReactNode;
  /** Main row label. */
  label: string;
  /** Optional subtitle below the label (small, muted). */
  description?: string;
  /** Right-side value (e.g. "Midnight", "English"). Shown in the trailing area. */
  trailing?: React.ReactNode;
  /** Visual chevron at the right edge (for nav-style rows). */
  showChevron?: boolean;
  /** Make the whole row look like a "danger" action (red text). */
  danger?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
}

interface ButtonRowProps extends RowBaseProps {
  onClick: () => void;
  href?: never;
  external?: never;
}

interface LinkRowProps extends RowBaseProps {
  href: string;
  external?: boolean;
  onClick?: never;
}

interface InertRowProps extends RowBaseProps {
  href?: never;
  onClick?: never;
  external?: never;
}

type SettingsRowProps = ButtonRowProps | LinkRowProps | InertRowProps;

export function SettingsRow(props: SettingsRowProps) {
  const {
    iconColor = "rgba(0,229,255,0.15)",
    iconSymbol,
    iconSvg,
    label,
    description,
    trailing,
    showChevron,
    danger,
    disabled,
  } = props;

  const inner = (
    <>
      {/* Icon tile */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
        style={{
          background: iconColor,
          borderColor: danger ? "rgba(239,68,68,0.3)" : "rgba(0,229,255,0.2)",
        }}
      >
        {iconSvg ? (
          iconSvg
        ) : (
          <span
            className="text-[13px] font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: danger ? "#ef4444" : "#00e5ff",
              textShadow: danger
                ? "0 0 6px rgba(239,68,68,0.4)"
                : "0 0 6px rgba(0,229,255,0.4)",
            }}
          >
            {iconSymbol ?? "◈"}
          </span>
        )}
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0 text-left">
        <div
          className={`text-[14px] truncate ${danger ? "text-red-400" : "text-[#e2d9f3]"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </div>
        {description && (
          <div
            className="text-[11px] text-[#7a6a9a] truncate mt-0.5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Trailing content + chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {trailing}
        {showChevron && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={danger ? "#ef4444" : "#7a6a9a"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </>
  );

  const baseClass = `flex items-center gap-3 px-4 py-3.5 transition-colors ${
    disabled
      ? "opacity-50 cursor-not-allowed"
      : danger
      ? "hover:bg-red-500/5 cursor-pointer"
      : "hover:bg-cyan-400/5 cursor-pointer"
  } border-b border-purple-700/10 last:border-0`;

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={props.href} className={baseClass}>
        {inner}
      </Link>
    );
  }

  if ("onClick" in props && props.onClick) {
    return (
      <button
        type="button"
        onClick={disabled ? undefined : props.onClick}
        disabled={disabled}
        className={`w-full ${baseClass}`}
      >
        {inner}
      </button>
    );
  }

  // Inert row (just display)
  return <div className={baseClass.replace(/cursor-pointer/g, "cursor-default")}>{inner}</div>;
}
