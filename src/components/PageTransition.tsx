"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

function Animated({ children }: { children: ReactNode }) {
  return <div className="nx-page-in">{children}</div>;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // key change remounts Animated, re-triggering nx-page-in on every route change
  return <Animated key={pathname}>{children}</Animated>;
}
