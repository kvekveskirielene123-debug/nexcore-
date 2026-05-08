export default function ChatsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 pt-8 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-24 h-20 rounded-xl" style={{ background: "rgba(0,229,255,0.07)" }} />
        <div className="w-36 h-6 rounded" style={{ background: "rgba(0,229,255,0.08)" }} />
        <div className="flex gap-4 mt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-16 h-3 rounded" style={{ background: "rgba(124,58,237,0.1)" }} />
          ))}
        </div>
      </div>
      {/* Search bar */}
      <div className="h-10 rounded-xl mb-6" style={{ background: "rgba(124,58,237,0.07)" }} />
      {/* Conversation rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl mb-2" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.08)" }}>
          <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: "rgba(124,58,237,0.1)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded" style={{ background: "rgba(0,229,255,0.08)" }} />
            <div className="h-2.5 w-44 rounded" style={{ background: "rgba(226,217,243,0.05)" }} />
          </div>
          <div className="w-10 h-2.5 rounded" style={{ background: "rgba(122,106,154,0.1)" }} />
        </div>
      ))}
    </div>
  );
}
