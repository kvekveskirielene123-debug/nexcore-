export default function FavoritesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center mb-12 gap-3">
        <div className="w-8 h-8 rounded-full" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="w-36 h-6 rounded" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="w-24 h-3 rounded" style={{ background: "rgba(122,106,154,0.1)" }} />
      </div>
      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
            <div className="aspect-square" style={{ background: "rgba(124,58,237,0.08)" }} />
            <div className="p-4 space-y-2">
              <div className="h-3.5 w-28 rounded" style={{ background: "rgba(226,217,243,0.08)" }} />
              <div className="h-2.5 w-16 rounded" style={{ background: "rgba(122,106,154,0.08)" }} />
              <div className="h-2.5 w-36 rounded" style={{ background: "rgba(167,139,250,0.06)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
