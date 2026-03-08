import { useState, useEffect } from "react";
import { useActivityLog } from "@/hooks/api/useActivityLog";
import { formatRelativeDate } from "@/utils/formatters";
import { FileIcon } from "@/components/files/FileIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bell,
  Upload,
  Download,
  Share2,
  Pencil,
  Move,
  Trash2,
  RotateCcw,
  FolderPlus,
  Star,
  StarOff,
  Check,
  Activity,
} from "lucide-react";
import type { Activity as ActivityType } from "@/types";

const actionIcons: Record<string, typeof Upload> = {
  upload: Upload,
  download: Download,
  share: Share2,
  rename: Pencil,
  move: Move,
  delete: Trash2,
  restore: RotateCcw,
  create_folder: FolderPlus,
  star: Star,
  unstar: StarOff,
  trash: Trash2,
};

export function NotificationCenter() {
  const { data: activities } = useActivityLog(20);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("drivex-read-notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [open, setOpen] = useState(false);

  const notifications = activities || [];
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  useEffect(() => {
    localStorage.setItem(
      "drivex-read-notifs",
      JSON.stringify([...readIds])
    );
  }, [readIds]);

  const markAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const markRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={markAllRead}
              data-testid="button-mark-all-read"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center px-4">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = actionIcons[notif.action] || Activity;
                const isRead = readIds.has(notif.id);
                return (
                  <button
                    key={notif.id}
                    className={`w-full flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !isRead ? "bg-primary/[0.03]" : ""
                    }`}
                    onClick={() => markRead(notif.id)}
                    data-testid={`notification-${notif.id}`}
                  >
                    {!isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    )}
                    <div
                      className={`flex-shrink-0 mt-0.5 ${isRead && !isRead ? "" : isRead ? "ml-3" : ""}`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs">
                        <span className={`${!isRead ? "font-semibold" : "font-medium"}`}>
                          {notif.userName}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {notif.action.replace(/_/g, " ")}
                        </span>{" "}
                        <span className="font-medium">{notif.targetName}</span>
                      </p>
                      {notif.details && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {notif.details}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatRelativeDate(notif.timestamp)}
                      </p>
                    </div>
                    <FileIcon type={notif.targetType} size="sm" />
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
