import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FileIcon, getFileBgGradient } from "./FileIcon";
import { Zap, ChevronDown, ChevronRight } from "lucide-react";
import { formatFileSize, formatRelativeDate } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FileItem } from "@/types";

interface QuickAccessRowProps {
  files: FileItem[] | undefined;
  isLoading: boolean;
  onPreview: (file: FileItem) => void;
}

const STORAGE_KEY = "drivex-quick-access-collapsed";

export function QuickAccessRow({ files, isLoading, onPreview }: QuickAccessRowProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  if (!isLoading && (!files || files.length === 0)) return null;

  return (
    <div className="px-4 pt-3 pb-1" data-testid="section-quick-access">
      <button
        className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 cursor-pointer select-none hover:text-muted-foreground transition-colors"
        onClick={() => setCollapsed(!collapsed)}
        data-testid="button-toggle-quick-access"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <Zap className="h-3 w-3" />
        <span>Suggested</span>
      </button>

      {!collapsed && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" data-testid="list-quick-access">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48 rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-3 w-24 rounded mb-1.5" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))
            : files?.map((file) => {
                const gradient = getFileBgGradient(file.type);
                return (
                  <div
                    key={file.id}
                    className={cn(
                      "flex-shrink-0 w-48 flex items-center gap-3 rounded-lg border bg-card p-3",
                      "shadow-card hover:shadow-card-hover cursor-pointer",
                      "transition-all duration-200 hover:-translate-y-0.5"
                    )}
                    onClick={() => {
                      if (file.type === "folder") {
                        setLocation(`/drive/folder/${file.id}`);
                      } else {
                        onPreview(file);
                      }
                    }}
                    data-testid={`quick-access-item-${file.id}`}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      gradient
                    )}>
                      <FileIcon type={file.type} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium line-clamp-2 leading-tight"
                        title={file.name}
                        data-testid={`text-quick-filename-${file.id}`}
                      >
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {file.type === "folder" ? formatRelativeDate(file.updatedAt) : formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}
