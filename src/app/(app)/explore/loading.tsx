export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-pulse">
      {/* Sticky bar skeleton */}
      <div className="h-12 rounded-xl mb-8" style={{ background: "rgba(124,58,237,0.08)" }} />
      {/* Featured row skeleton */}
      <div className="h-4 w-32 rounded mb-4" style={{ background: "rgba(0,229,255,0.08)" }} />
      <div className="flex gap-4 mb-10 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-44 h-60 rounded-xl" style={{ background: "rgba(124,58,237,0.07)" }} />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="h-4 w-24 rounded mb-4" style={{ background: "rgba(0,229,255,0.08)" }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl" style={{ background: "rgba(124,58,237,0.07)" }} />
        ))}
      </div>
    </div>
  );
}
