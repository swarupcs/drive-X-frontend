import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { UploadProgress } from "@/components/shared/UploadProgress";
import { useSystemBanner } from "@/hooks/api/useAdminData";
import { Megaphone } from "lucide-react";

function SystemBanner() {
  const { data } = useSystemBanner();
  if (!data?.showBanner || !data.bannerMessage) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm" data-testid="system-banner">
      <Megaphone className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{data.bannerMessage}</span>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "15rem", "--sidebar-width-icon": "3.25rem" } as React.CSSProperties}
    >
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <SystemBanner />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <UploadProgress />
    </SidebarProvider>
  );
}
