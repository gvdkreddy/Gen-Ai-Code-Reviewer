import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      {/* Mobile Navigation */}
      <MobileNav />
      
      <main className="md:pl-64 pt-14 md:pt-0">
        <div className="min-h-screen p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
