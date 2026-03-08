import { useState } from "react";
import { useStarredFiles } from "@/hooks/api/useStarredFiles";
import { useStarItem, useTrashItem, useRenameItem, useMoveItem, useCopyItem } from "@/hooks/api/useMutations";
import { FileDisplay } from "@/components/files/FileList";
import { RenameModal } from "@/components/modals/RenameModal";
import { MoveModal } from "@/components/modals/MoveModal";
import { ShareModal } from "@/components/modals/ShareModal";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { Button } from "@/components/ui/button";
import { Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import { fileService } from "@/services/file.service";
import { useAppDispatch, useAppSelector } from "@/store";
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

export default function Starred() {
  const { data: files, isLoading } = useStarredFiles();
  const starMutation = useStarItem();
  const trashMutation = useTrashItem();
  const renameMutation = useRenameItem();
  const moveMutation = useMoveItem();
  const copyMutation = useCopyItem();
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector((s) => s.ui.selectedFiles);

  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [moveFile, setMoveFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handleStar = (file: FileItem) => {
    starMutation.mutate({ id: file.id, starred: !file.starred });
  };

  const handleTrash = (file: FileItem) => {
    trashMutation.mutate(file.id);
  };

  const handleCopy = (file: FileItem) => {
    copyMutation.mutate({ id: file.id, targetFolderId: null });
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const url = await fileService.getDownloadUrl(file.id);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      toast.success("Download started", { description: `Downloading "${file.name}"...` });
    } catch {
      toast.error("Download failed", { description: `Could not download "${file.name}".` });
    }
  };

  const handleUnstarAll = () => {
    files?.forEach((f) => starMutation.mutate({ id: f.id, starred: false }));
    dispatch(clearSelection());
  };

  const handleBulkUnstar = () => {
    for (const id of selectedFiles) {
      starMutation.mutate({ id, starred: false });
    }
    dispatch(clearSelection());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">
            Starred
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
              onClick={handleBulkUnstar}
              data-testid="button-bulk-unstar"
            >
              <StarOff className="h-3.5 w-3.5 mr-1" />
              Unstar {selectedFiles.length} selected
            </Button>
          )}
          {files && files.length > 0 && selectedFiles.length === 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground" data-testid="button-unstar-all">
                  <StarOff className="h-3.5 w-3.5 mr-1" />
                  Unstar all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unstar all items?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {files.length} items from your Starred list. You can re-star them at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnstarAll}>
                    Unstar all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <FileDisplay
        files={files}
        isLoading={isLoading}
        emptyMessage="No starred items"
        emptyDescription="Star files and folders to quickly access them here. Click the star icon on any file, or press S with a file selected."
        onRename={setRenameFile}
        onMove={setMoveFile}
        onShare={setShareFile}
        onPreview={setPreviewFile}
        onStar={handleStar}
        onTrash={handleTrash}
        onCopy={handleCopy}
        onDownload={handleDownload}
        showSort
      />

      <RenameModal
        open={!!renameFile}
        onClose={() => setRenameFile(null)}
        file={renameFile}
        onSubmit={(id, name) => {
          renameMutation.mutate({ id, name });
          setRenameFile(null);
        }}
        isPending={renameMutation.isPending}
      />

      <MoveModal
        open={!!moveFile}
        onClose={() => setMoveFile(null)}
        file={moveFile}
        onSubmit={(id, targetFolderId) => {
          moveMutation.mutate({ id, targetFolderId });
          setMoveFile(null);
        }}
        isPending={moveMutation.isPending}
      />

      <ShareModal
        open={!!shareFile}
        onClose={() => setShareFile(null)}
        file={shareFile}
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
