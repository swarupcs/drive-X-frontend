import { useState } from "react";
import { useActivityLog } from "@/hooks/api/useActivityLog";
import { FileIcon } from "@/components/files/FileIcon";
import { formatRelativeDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity,
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
} from "lucide-react";

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

const actionColors: Record<string, string> = {
  upload: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  download: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  share: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  rename: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  move: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  delete: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  restore: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  create_folder: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  star: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  unstar: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  trash: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

type TabKey = "all" | "uploads" | "shares" | "deletions" | "renames";

const TAB_FILTER: Record<TabKey, string[]> = {
  all: [],
  uploads: ["upload"],
  shares: ["share"],
  deletions: ["delete", "trash"],
  renames: ["rename"],
};

function groupByDate(activities: { timestamp: string }[]): Map<string, typeof activities> {
  const groups = new Map<string, typeof activities>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const act of activities) {
    const d = new Date(act.timestamp);
    let key: string;
    if (d.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else if (d >= weekAgo) {
      key = "This week";
    } else {
      key = "Earlier";
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(act);
  }
  return groups;
}

const DATE_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

// Map tab keys to single backend action values (undefined = no filter)
const TAB_ACTION: Record<TabKey, string | undefined> = {
  all: undefined,
  uploads: "upload",
  shares: "share",
  deletions: undefined, // multiple actions — filter client-side
  renames: "rename",
};

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const serverAction = TAB_ACTION[activeTab];
  const { data: activities, isLoading } = useActivityLog(100, serverAction);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-96" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const filterActions = TAB_FILTER[activeTab];
  const filtered =
    filterActions.length === 0
      ? activities || []
      : (activities || []).filter((a: any) => filterActions.includes(a.action));

  const grouped = groupByDate(filtered);
  const orderedKeys = DATE_ORDER.filter((k) => grouped.has(k));

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold" data-testid="text-page-title">
          Activity
        </h2>
        <Badge variant="secondary">{activities?.length || 0} events</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
          <TabsTrigger value="deletions">Deletions</TabsTrigger>
          <TabsTrigger value="renames">Renames</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                Your file activity will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-8 pr-4">
                {orderedKeys.map((date) => {
                  const items = grouped.get(date)!;
                  return (
                    <div key={date}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
                        {date}
                      </h3>
                      <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-1">
                          {items.map((act: any) => {
                            const Icon = actionIcons[act.action] || Activity;
                            const colorClass =
                              actionColors[act.action] ||
                              "bg-muted text-muted-foreground";
                            return (
                              <div
                                key={act.id}
                                className="flex items-start gap-4 pl-2"
                                data-testid={`activity-item-${act.id}`}
                              >
                                {/* Timeline dot / icon */}
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ring-2 ring-background ${colorClass}`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex items-center gap-3 py-1.5 rounded-lg hover:bg-muted/50 px-2 -mx-2 transition-colors">
                                  <FileIcon type={act.targetType} size="sm" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">
                                      <span className="font-medium">{act.userName}</span>{" "}
                                      <span className="text-muted-foreground">
                                        {act.action.replace(/_/g, " ")}
                                      </span>{" "}
                                      <span className="font-medium">{act.targetName}</span>
                                    </p>
                                    {act.details && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {act.details}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
                                    {formatRelativeDate(act.timestamp)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
