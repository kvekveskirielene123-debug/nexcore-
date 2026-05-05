import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05020d]">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Desktop header */}
      <AppHeader />

      {/* Page content — offset right of sidebar on desktop, padded bottom on mobile for dock */}
      <div className="md:ml-[72px] md:pt-14 pb-48 md:pb-8">
        {children}
      </div>
    </div>
  );
}
