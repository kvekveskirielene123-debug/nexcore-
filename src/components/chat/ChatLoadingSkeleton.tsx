"use client";

// PREMIUM (Phase 1) · Loading skeleton for the chat page initial render.
//
// Usage: render this from the chat page server component while the
// real data is loading, OR use it as a loading.tsx file in the chat
// route. It mirrors the chat layout exactly so there's no jolt when
// the real content swaps in.

export function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Header skeleton */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--chat-input-border)" }}
      >
        <div className="nx-skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="nx-skeleton h-3 w-32 rounded" />
          <div className="nx-skeleton h-2 w-20 rounded opacity-70" />
        </div>
        <div className="nx-skeleton w-20 h-8 rounded-md" />
        <div className="nx-skeleton w-8 h-8 rounded-full" />
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-hidden px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* AI message skeleton */}
          <div className="flex gap-3">
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="space-y-2 max-w-[70%]">
              <div className="nx-skeleton h-4 w-64 rounded-2xl" />
              <div className="nx-skeleton h-4 w-48 rounded-2xl" />
            </div>
          </div>

          {/* User message skeleton */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="nx-skeleton h-4 w-40 rounded-2xl" />
          </div>

          {/* AI message skeleton */}
          <div className="flex gap-3">
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="space-y-2 max-w-[70%]">
              <div className="nx-skeleton h-4 w-72 rounded-2xl" />
              <div className="nx-skeleton h-4 w-56 rounded-2xl" />
              <div className="nx-skeleton h-4 w-40 rounded-2xl" />
            </div>
          </div>

          {/* User message skeleton */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="space-y-2 max-w-[60%]">
              <div className="nx-skeleton h-4 w-48 rounded-2xl" />
              <div className="nx-skeleton h-4 w-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl border px-3 py-2.5 flex items-center gap-2"
            style={{
              background: "var(--chat-input-bg)",
              borderColor: "var(--chat-input-border)",
            }}
          >
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="nx-skeleton h-5 flex-1 rounded" />
            <div className="nx-skeleton w-9 h-9 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
