import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCompletedUploads, removeUpload } from "@/store/slices/uploadSlice";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Upload, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatFileSize } from "@/utils/formatters";

export function UploadProgress() {
  const uploads = useAppSelector((s) => s.upload.uploads);
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);

  if (uploads.length === 0) return null;

  const activeUploads = uploads.filter((u) => u.status === "uploading" || u.status === "pending");
  const completedCount = uploads.filter((u) => u.status === "done").length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-float z-50"
        data-testid="upload-progress-panel"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-medium">
            {activeUploads.length > 0
              ? `Uploading ${activeUploads.length} file${activeUploads.length > 1 ? "s" : ""}`
              : `${completedCount} upload${completedCount > 1 ? "s" : ""} complete`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => dispatch(clearCompletedUploads())}
              data-testid="button-clear-uploads"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-2 px-3 py-2 border-b last:border-0">
                    <div className="flex-shrink-0">
                      {upload.status === "done" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : upload.status === "error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Upload className="h-4 w-4 text-primary animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{upload.filename}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={upload.progress} className="h-1 flex-1" />
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatFileSize(upload.size)}</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => dispatch(removeUpload(upload.id))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
