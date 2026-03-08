import { useUsers, useAllFiles, useShareLinks } from "@/hooks/api/useAdminData";
import { useActivityLog } from "@/hooks/api/useActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, formatRelativeDate, getFileColor } from "@/utils/formatters";
import { FileIcon } from "@/components/files/FileIcon";
import { Users, Files, HardDrive, Link, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatCard {
  label: string;
  value: string | number;
  icon: typeof Users;
  bgColor: string;
  iconColor: string;
  testId: string;
}

export default function AdminDashboard() {
  const { data: usersResult, isLoading: usersLoading } = useUsers();
  const { data: filesResult, isLoading: filesLoading } = useAllFiles();
  const { data: linksResult } = useShareLinks();
  const { data: activities } = useActivityLog(10);
  const users = usersResult?.data;
  const files = filesResult?.data;
  const links = linksResult?.data;

  const isLoading = usersLoading || filesLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalStorage = users?.reduce((acc, u) => acc + u.storageUsed, 0) || 0;
  const activeLinks = links?.filter((l) => l.active).length || 0;

  const filesByType: Record<string, number> = {};
  files?.forEach((f) => {
    if (f.type !== "folder") {
      filesByType[f.type] = (filesByType[f.type] || 0) + 1;
    }
  });
  const pieData = Object.entries(filesByType).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count,
    color: getFileColor(type as any),
  }));

  const storageByUser =
    users?.map((u) => ({
      name: u.name.split(" ")[0],
      storage:
        Math.round((u.storageUsed / (1024 * 1024 * 1024)) * 100) / 100,
    })) || [];

  const stats: StatCard[] = [
    {
      label: "Total Users",
      value: users?.length || 0,
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600",
      testId: "stat-total-users",
    },
    {
      label: "Total Files",
      value: files?.filter((f) => f.type !== "folder").length || 0,
      icon: Files,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600",
      testId: "stat-total-files",
    },
    {
      label: "Storage Used",
      value: formatFileSize(totalStorage),
      icon: HardDrive,
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      iconColor: "text-orange-600",
      testId: "stat-storage-used",
    },
    {
      label: "Active Links",
      value: activeLinks,
      icon: Link,
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
      iconColor: "text-violet-600",
      testId: "stat-active-links",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <h2 className="text-lg font-semibold" data-testid="text-page-title">
        Admin Dashboard
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-card">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold tracking-tight"
                    data-testid={stat.testId}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Storage by User (GB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageByUser}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="storage"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Files by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activities?.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/50 px-2 -mx-2 transition-colors border-b last:border-0"
              >
                <FileIcon type={act.targetType} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{act.userName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {act.action.replace("_", " ")}{" "}
                    </span>
                    <span className="font-medium">{act.targetName}</span>
                  </p>
                  {act.details && (
                    <p className="text-xs text-muted-foreground">{act.details}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatRelativeDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
