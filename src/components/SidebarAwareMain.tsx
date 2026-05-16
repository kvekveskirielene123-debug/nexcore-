"use client";

import { useSidebar } from "./providers/SidebarProvider";
import { PageTransition } from "./PageTransition";

export function SidebarAwareMain({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  return (
    <div
      className={`pt-14 pb-28 md:pb-8 relative transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
      }`}
      style={{ zIndex: 1 }}
    >
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
