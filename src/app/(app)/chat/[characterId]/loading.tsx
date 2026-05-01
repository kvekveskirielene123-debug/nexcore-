// PREMIUM (Phase 1) · Next.js loading.tsx for the chat route.
//
// This file goes at: src/app/(app)/chat/[characterId]/loading.tsx
//
// Next.js automatically renders this whenever the chat page is loading
// (e.g. when navigating to /chat/abc-123). No manual integration needed —
// just dropping the file in the right place activates it.

import { ChatLoadingSkeleton } from "@/components/chat/ChatLoadingSkeleton";

export default function ChatLoading() {
  return <ChatLoadingSkeleton />;
}
