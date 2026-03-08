import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { UploadProgress } from "@/components/shared/UploadProgress";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "15rem", "--sidebar-width-icon": "3.25rem" } as React.CSSProperties}
    >
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <UploadProgress />
    </SidebarProvider>
  );
}
