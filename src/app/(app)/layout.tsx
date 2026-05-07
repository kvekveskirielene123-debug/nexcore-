import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { MobileNav } from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05020d]">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Desktop header */}
      <AppHeader />

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Page content — mobile: top bar 56px + bottom nav ~80px; desktop: sidebar 72px + header 56px */}
      <div className="md:ml-[72px] pt-14 md:pt-14 pb-28 md:pb-8">
        {children}
      </div>
    </div>
  );
}
