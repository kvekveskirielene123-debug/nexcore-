import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { MobileNav } from "@/components/MobileNav";
import { SessionWatcher } from "@/components/SessionWatcher";
import { PageTransition } from "@/components/PageTransition";
import { PaddleProvider } from "@/components/providers/PaddleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaddleProvider>
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#05020d",
        backgroundImage:
          "radial-gradient(circle, rgba(124,58,237,0.1) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ── Fixed ambient glow orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
        {/* Top-center cyan glow */}
        <div
          className="nx-float-a"
          style={{
            position: "absolute",
            top: -80,
            left: "35%",
            width: 900,
            height: 700,
            background: "radial-gradient(ellipse at center,rgba(0,229,255,0.04) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Bottom-right purple glow */}
        <div
          className="nx-float-b"
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 700,
            height: 700,
            background: "radial-gradient(ellipse at center,rgba(124,58,237,0.045) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Mid-left accent */}
        <div
          className="nx-float-c"
          style={{
            position: "absolute",
            top: "40%",
            left: 80,
            width: 350,
            height: 350,
            background: "radial-gradient(ellipse at center,rgba(167,139,250,0.03) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Desktop sidebar */}
      <AppSidebar />
      {/* Desktop header */}
      <AppHeader />
      {/* Mobile nav */}
      <MobileNav />
      <SessionWatcher />

      {/* Page content */}
      <div className="md:ml-[72px] pt-14 md:pt-14 pb-28 md:pb-8 relative" style={{ zIndex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
    </PaddleProvider>
  );
}
