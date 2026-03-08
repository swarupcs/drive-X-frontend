import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCompletedUploads, cancelUpload, removeUpload } from "@/store/slices/uploadSlice";
import { useRetryUpload } from "@/hooks/api/useMutations";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
  Upload,
  Clock,
} from "lucide-react";
import { formatFileSize } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import type { UploadItem } from "@/types";

function StatusIcon({ status }: { status: UploadItem["status"] }) {
  if (status === "done") return <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />;
  if (status === "error") return <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />;
  if (status === "uploading") return <Loader2 className="h-3.5 w-3.5 text-primary flex-shrink-0 animate-spin" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />;
}

export function UploadProgress() {
  const uploads = useAppSelector((s) => s.upload.uploads);
  const dispatch = useAppDispatch();
  const retryUpload = useRetryUpload();
  const [collapsed, setCollapsed] = useState(false);

  if (uploads.length === 0) return null;

  const active = uploads.filter((u) => u.status === "uploading" || u.status === "pending");
  const done = uploads.filter((u) => u.status === "done");
  const errors = uploads.filter((u) => u.status === "error");

  const overallProgress =
    uploads.length > 0
      ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
      : 0;

  const headerLabel =
    active.length > 0
      ? `Uploading ${active.length} file${active.length !== 1 ? "s" : ""}…`
      : errors.length > 0
      ? `${done.length} done · ${errors.length} failed`
      : `${done.length} upload${done.length !== 1 ? "s" : ""} complete`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-xl shadow-float z-50 overflow-hidden"
        data-testid="upload-progress-panel"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/40">
          <Upload className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-xs font-medium flex-1 truncate">{headerLabel}</span>
          <div className="flex items-center gap-0.5">
            {done.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={() => dispatch(clearCompletedUploads())}
                data-testid="button-clear-uploads"
              >
                Clear done
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Overall progress (only when actively uploading) */}
        {active.length > 0 && (
          <div className="px-3 py-2 border-b bg-muted/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Overall</span>
              <span className="text-[10px] font-medium tabular-nums">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-1" />
          </div>
        )}

        {/* File list */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 group",
                      upload.status === "error" && "bg-destructive/5"
                    )}
                  >
                    <StatusIcon status={upload.status} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate leading-tight">
                        {upload.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {(upload.status === "uploading" || upload.status === "pending") ? (
                          <>
                            <Progress value={upload.progress} className="h-0.5 flex-1" />
                            <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                              {upload.progress}%
                            </span>
                          </>
                        ) : upload.status === "error" ? (
                          <span className="text-[10px] text-destructive truncate">
                            {upload.errorMessage ?? "Upload failed"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            {formatFileSize(upload.size)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {upload.status === "error" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          title="Retry"
                          onClick={() => retryUpload(upload)}
                        >
                          <RotateCcw className="h-3 w-3 text-primary" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        title={upload.status === "uploading" || upload.status === "pending" ? "Cancel" : "Dismiss"}
                        onClick={() => {
                          if (upload.status === "uploading" || upload.status === "pending") {
                            dispatch(cancelUpload(upload.id));
                          } else {
                            dispatch(removeUpload(upload.id));
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
