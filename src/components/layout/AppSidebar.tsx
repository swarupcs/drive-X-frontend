import { Link, useLocation } from "wouter";
import { useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { useUploadFiles } from "@/hooks/api/useMutations";
import { StorageBar } from "@/components/shared/StorageBar";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import {
  HardDrive, Users, Clock, Star, Trash2,
  LayoutDashboard,
  UserCog, Files, Database, Link as LinkIcon, Settings, LogOut,
  Activity, User, Plus, Upload, FolderPlus, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const driveNavItems = [
  { title: "My Drive", href: "/drive", icon: HardDrive },
  { title: "Shared with Me", href: "/drive/shared", icon: Users },
  { title: "Recent", href: "/drive/recent", icon: Clock },
  { title: "Starred", href: "/drive/starred", icon: Star },
  { title: "Activity", href: "/drive/activity", icon: Activity },
  { title: "Trash", href: "/drive/trash", icon: Trash2 },
];

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: UserCog },
  { title: "Files", href: "/admin/files", icon: Files },
  { title: "Storage", href: "/admin/storage", icon: Database },
  { title: "Shared Links", href: "/admin/shares", icon: LinkIcon },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFolderId = useAppSelector((s) => s.ui.currentFolderId);
  const uploadFiles = useUploadFiles(currentFolderId);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [uploadFiles]
  );

  const handleNewFolder = useCallback(() => {
    window.dispatchEvent(new CustomEvent("drivex:new-folder"));
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isActive = (href: string) => {
    if (href === "/drive") return location === "/drive" || location === "/";
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <HardDrive className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-[15px] font-semibold tracking-tight" data-testid="text-app-name">Drive-X</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-1">
        {/* New / Upload Actions */}
        <div className="mb-2 px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 shadow-sm",
                  isCollapsed && "w-8 px-0 justify-center"
                )}
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>New</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewFolder}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {/* Drive Navigation */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {driveNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={cn(
                      "gap-2.5 rounded-md transition-colors duration-100",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup className="p-0">
              {!isCollapsed && (
                <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Admin
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
                        className={cn(
                          "gap-2.5 rounded-md transition-colors duration-100",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                        data-testid={`nav-admin-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-2 border-t border-sidebar-border">
        {!isCollapsed && <StorageBar />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-2",
              "hover:bg-sidebar-accent transition-colors duration-100 cursor-pointer",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium truncate" data-testid="text-user-name">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
            <DropdownMenuItem asChild>
              <Link href="/drive/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(logout())}
              className="text-destructive focus:text-destructive"
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
