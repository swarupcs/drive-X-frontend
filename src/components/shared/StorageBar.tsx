import { Link } from "wouter";
import { useStorageInfo } from "@/hooks/api/useStorageInfo";
import { formatFileSize } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function StorageBar() {
  const { data } = useStorageInfo();

  if (!data) return null;

  const percentage = Math.min(Math.round((data.used / data.quota) * 100), 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="px-2 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Storage
        </span>
        <span className={`text-[11px] font-medium ${isCritical ? "text-destructive" : isWarning ? "text-amber-500" : "text-muted-foreground"}`}>
          {percentage}%
        </span>
      </div>

      {/* Segmented breakdown bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-px" data-testid="progress-storage">
        {data.breakdown.filter(b => b.size > 0).map((item) => {
          const pct = data.used > 0 ? (item.size / data.quota) * 100 : 0;
          return (
            <Tooltip key={item.type}>
              <TooltipTrigger asChild>
                <div
                  className="h-full min-w-[2px] first:rounded-l-full last:rounded-r-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {item.type}: {formatFileSize(item.size)}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {/* remaining free space */}
        <div
          className="h-full flex-1 rounded-r-full bg-transparent"
          style={{ minWidth: 0 }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-muted-foreground" data-testid="text-storage-usage">
          {formatFileSize(data.used)} / {formatFileSize(data.quota)}
        </span>
        <Link href="/drive/storage" className="text-[11px] text-primary hover:underline">
          {formatFileSize(data.quota - data.used)} free
        </Link>
      </div>
    </div>
  );
}
