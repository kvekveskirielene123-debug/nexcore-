export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 pt-8 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 gap-3">
        <div className="w-20 h-20 rounded-full" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="w-40 h-5 rounded" style={{ background: "rgba(0,229,255,0.07)" }} />
        <div className="w-24 h-3 rounded" style={{ background: "rgba(124,58,237,0.1)" }} />
      </div>
      {/* Section cards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl mb-4 p-4 space-y-3" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
          <div className="w-20 h-3 rounded" style={{ background: "rgba(0,229,255,0.1)" }} />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: "rgba(124,58,237,0.1)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded" style={{ background: "rgba(226,217,243,0.08)" }} />
                <div className="h-2 w-48 rounded" style={{ background: "rgba(226,217,243,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
