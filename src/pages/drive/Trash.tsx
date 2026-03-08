import { useTrashFiles } from "@/hooks/api/useTrashFiles";
import { useRestoreItem, useDeleteItem } from "@/hooks/api/useMutations";
import { FileDisplay } from "@/components/files/FileList";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { getDaysUntilDeletion } from "@/utils/formatters";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearSelection } from "@/store/slices/uiSlice";
import type { FileItem } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TrashPage() {
  const { data: files, isLoading } = useTrashFiles();
  const restoreMutation = useRestoreItem();
  const deleteMutation = useDeleteItem();
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const selectedFiles = useAppSelector((s) => s.ui.selectedFiles);
  const dispatch = useAppDispatch();

  const handleRestore = (file: FileItem) => {
    restoreMutation.mutate(file.id);
  };

  const handleDelete = (file: FileItem) => {
    deleteMutation.mutate(file.id);
  };

  const handleBulkRestore = () => {
    for (const id of selectedFiles) {
      restoreMutation.mutate(id);
    }
    dispatch(clearSelection());
  };

  const urgentFiles = files?.filter(
    (f) => f.trashedAt && getDaysUntilDeletion(f.trashedAt) <= 7
  ) ?? [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">
            Trash
          </h2>
          {files && files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({files.length} item{files.length !== 1 ? "s" : ""})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRestore}
              data-testid="button-bulk-restore"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Restore {selectedFiles.length} selected
            </Button>
          )}
          {files && files.length > 0 && selectedFiles.length === 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" data-testid="button-empty-trash">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Empty Trash
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Empty Trash?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {files.length} items in your
                    trash. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      files.forEach((f) => deleteMutation.mutate(f.id));
                    }}
                  >
                    Delete forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Urgency banner — shown when files expire soon */}
      {urgentFiles.length > 0 && (
        <div className="bg-destructive/8 border border-destructive/20 rounded-lg mx-4 mt-4 p-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            {urgentFiles.length === 1
              ? `"${urgentFiles[0].name}" will be permanently deleted within 7 days.`
              : `${urgentFiles.length} items will be permanently deleted within 7 days.`}
          </p>
        </div>
      )}

      {/* General info banner */}
      {files && files.length > 0 && urgentFiles.length === 0 && (
        <div className="bg-muted/50 border border-border rounded-lg mx-4 mt-4 p-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Files in trash are permanently deleted 30 days after being trashed. Right-click to restore or delete forever.
          </p>
        </div>
      )}

      <FileDisplay
        files={files}
        isLoading={isLoading}
        emptyMessage="Trash is empty"
        emptyDescription="Items you delete will appear here for 30 days before permanent deletion."
        onRename={() => {}}
        onMove={() => {}}
        onShare={() => {}}
        onPreview={setPreviewFile}
        onStar={() => {}}
        onTrash={handleDelete}
        onRestore={handleRestore}
        onCopy={() => {}}
        onDownload={() => {}}
        isTrashView
        showSort={false}
      />

      <PreviewModal
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        files={files}
      />
    </div>
  );
}
