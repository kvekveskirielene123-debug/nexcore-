"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  mobileOpen: boolean;
  toggleExpanded: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: true,
  mobileOpen: false,
  toggleExpanded: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isExpanded, mobileOpen, toggleExpanded, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
