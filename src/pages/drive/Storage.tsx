import { useStorageInfo } from "@/hooks/api/useStorageInfo";
import { formatFileSize } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HardDrive, FileText, Image, Video, Music, Archive, File, AlertTriangle } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TYPE_ICONS: Record<string, typeof FileText> = {
  Documents: FileText,
  Images: Image,
  Videos: Video,
  Audio: Music,
  Archives: Archive,
  Other: File,
};

const TYPE_COLORS: Record<string, string> = {
  Documents: "#3b82f6",
  Images: "#ec4899",
  Videos: "#8b5cf6",
  Audio: "#f59e0b",
  Archives: "#f97316",
  Other: "#6b7280",
};

export default function StoragePage() {
  const { data, isLoading } = useStorageInfo();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const percentage = Math.round((data.used / data.quota) * 100);
  const free = data.quota - data.used;

  const radialData = [
    {
      name: "Used",
      value: percentage,
      fill: percentage > 80 ? "#ef4444" : "hsl(var(--primary))",
    },
  ];

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold" data-testid="text-page-title">
          Storage
        </h2>
      </div>

      {percentage > 80 && (
        <div className="bg-destructive/8 border border-destructive/20 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            You are using <strong>{percentage}%</strong> of your storage. Consider freeing up
            space to avoid disruptions.
          </p>
        </div>
      )}

      {/* Main storage card */}
      <Card className="border-0 shadow-card">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Radial chart */}
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  barSize={14}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={8}
                    angleAxisId={0}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Used"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-4">
              <div>
                <p
                  className="text-3xl font-bold tracking-tight"
                  data-testid="text-storage-used"
                >
                  {formatFileSize(data.used)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {formatFileSize(data.quota)} used ({percentage}%)
                </p>
              </div>

              <Progress
                value={percentage}
                className="h-2"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Used</p>
                  <p className="text-sm font-semibold">{formatFileSize(data.used)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Free</p>
                  <p className="text-sm font-semibold">{formatFileSize(free)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Storage breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.breakdown.map((item) => {
            const Icon = TYPE_ICONS[item.type] || File;
            const color = TYPE_COLORS[item.type] || item.color || "#6b7280";
            const pct =
              data.used > 0 ? Math.round((item.size / data.used) * 100) : 0;
            return (
              <Card key={item.type} className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} file{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
