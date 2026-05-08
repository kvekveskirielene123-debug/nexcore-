export default function PersonasLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 gap-3">
        <div className="w-8 h-8 rounded-full" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="w-32 h-6 rounded" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="w-56 h-3 rounded" style={{ background: "rgba(167,139,250,0.07)" }} />
      </div>
      {/* Persona cards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl mb-4 p-4 flex items-center gap-4" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
          <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ background: "rgba(124,58,237,0.1)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded" style={{ background: "rgba(226,217,243,0.08)" }} />
            <div className="h-2.5 w-44 rounded" style={{ background: "rgba(167,139,250,0.06)" }} />
            <div className="flex gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-5 w-12 rounded-full" style={{ background: "rgba(0,229,255,0.05)" }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
