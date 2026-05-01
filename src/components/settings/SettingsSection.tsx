"use client";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2
          className="text-[10px] tracking-[3px] uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            color: "rgba(0,229,255,0.45)",
          }}
        >
          ◈ {title}
        </h2>
        {description && (
          <p
            className="text-[11px] text-[#7a6a9a] italic mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-purple-700/15 bg-[#0c0520]/60 overflow-hidden relative">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />
        {children}
      </div>
    </section>
  );
}
