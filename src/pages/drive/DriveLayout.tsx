import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearSelection, setSelectedFiles, setCurrentFolderId } from "@/store/slices/uiSlice";
import { useStarItem, useTrashItem, useRenameItem, useMoveItem, useCopyItem, useUploadFiles, useCreateFolder, useLabelItem, useBulkTrash, useBulkStar } from "@/hooks/api/useMutations";
import { FileDisplay } from "@/components/files/FileList";
import { BulkActions } from "@/components/files/BulkActions";
import { FileDetailsPanel } from "@/components/files/FileDetailsPanel";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { RenameModal } from "@/components/modals/RenameModal";
import { MoveModal } from "@/components/modals/MoveModal";
import { ShareModal } from "@/components/modals/ShareModal";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FilterChips } from "@/components/shared/FilterChips";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload, PanelRightOpen, PanelRightClose } from "lucide-react";
import { toast } from "sonner";
import { fileService } from "@/services/file.service";
import type { FileItem, FileLabel } from "@/types";

interface DriveLayoutProps {
  files: FileItem[] | undefined;
  isLoading: boolean;
  title: string;
  breadcrumbs?: { id: string | null; name: string }[];
  parentId?: string | null;
  showCreateFolder?: boolean;
  showUpload?: boolean;
  showSort?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  quickAccessSlot?: React.ReactNode;
}

export function DriveLayout({
  files,
  isLoading,
  title,
  breadcrumbs,
  parentId = null,
  showCreateFolder = true,
  showUpload = true,
  showSort = true,
  emptyMessage,
  emptyDescription,
  quickAccessSlot,
}: DriveLayoutProps) {
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector((s) => s.ui.selectedFiles);
  const [, navigate] = useLocation();

  // Keep Redux in sync with the current folder so AppSidebar can upload to the right folder
  useEffect(() => {
    dispatch(setCurrentFolderId(parentId ?? null));
  }, [parentId, dispatch]);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [moveFile, setMoveFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailFile, setDetailFile] = useState<FileItem | null>(null);

  const starMutation = useStarItem();
  const trashMutation = useTrashItem();
  const renameMutation = useRenameItem();
  const moveMutation = useMoveItem();
  const copyMutation = useCopyItem();
  const uploadFiles = useUploadFiles(parentId);
  const createFolderMutation = useCreateFolder(parentId);
  const labelMutation = useLabelItem();

  useEffect(() => {
    if (selectedFiles.length === 1 && files) {
      const f = files.find((f) => f.id === selectedFiles[0]);
      if (f) setDetailFile(f);
    } else if (selectedFiles.length === 0) {
      setDetailFile(null);
    }
  }, [selectedFiles, files]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) uploadFiles(acceptedFiles);
    },
    [uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  // Allow AppSidebar's "New folder" button to open the modal
  useEffect(() => {
    const handler = () => setCreateFolderOpen(true);
    window.addEventListener("drivex:new-folder", handler);
    return () => window.removeEventListener("drivex:new-folder", handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(clearSelection());
        setDetailsOpen(false);
      }
      if (e.key === "Delete" && selectedFiles.length > 0) {
        for (const id of selectedFiles) {
          trashMutation.mutate(id);
        }
        dispatch(clearSelection());
      }
      if (e.key === "a" && (e.ctrlKey || e.metaKey) && files) {
        e.preventDefault();
        dispatch(setSelectedFiles(files.map((f) => f.id)));
      }
      if (e.key === "F2" && selectedFiles.length === 1) {
        const file = files?.find((f) => f.id === selectedFiles[0]);
        if (file) setRenameFile(file);
      }
      if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setDetailsOpen((prev) => !prev);
      }
      // Alt+ArrowUp → navigate to parent folder
      if (e.key === "ArrowUp" && e.altKey && breadcrumbs && breadcrumbs.length >= 2) {
        e.preventDefault();
        const parent = breadcrumbs[breadcrumbs.length - 2];
        navigate(parent.id ? `/drive/folder/${parent.id}` : "/drive");
      }
      // S → toggle star on selected files (skip when focus is in an input/textarea)
      if (
        e.key === "s" &&
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        selectedFiles.length > 0 &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        for (const id of selectedFiles) {
          const file = files?.find((f) => f.id === id);
          if (file) starMutation.mutate({ id, starred: !file.starred });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFiles, files, dispatch, trashMutation, starMutation, breadcrumbs, navigate]);

  const handleStar = (file: FileItem) => {
    starMutation.mutate({ id: file.id, starred: !file.starred });
  };

  const handleTrash = (file: FileItem) => {
    trashMutation.mutate(file.id);
  };

  const handleCopy = (file: FileItem) => {
    copyMutation.mutate({ id: file.id, targetFolderId: parentId });
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

  const handleDragMove = (fileId: string, targetFolderId: string) => {
    moveMutation.mutate({ id: fileId, targetFolderId });
  };

  const handleBulkMove = () => {
    if (selectedFiles.length >= 1) {
      const file = files?.find((f) => f.id === selectedFiles[0]);
      if (file) setMoveFile(file);
    }
  };

  const handleBulkStar = () => {
    for (const id of selectedFiles) {
      starMutation.mutate({ id, starred: true });
    }
    dispatch(clearSelection());
  };

  const handleBulkTrash = () => {
    for (const id of selectedFiles) {
      trashMutation.mutate(id);
    }
    dispatch(clearSelection());
  };

  const handleBulkDownload = async () => {
    const targets = selectedFiles
      .map((id) => files?.find((f) => f.id === id))
      .filter((f): f is FileItem => !!f && f.type !== "folder");
    dispatch(clearSelection());
    for (const file of targets) {
      try {
        const url = await fileService.getDownloadUrl(file.id);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
      } catch {
        toast.error("Download failed", { description: `Could not download "${file.name}".` });
      }
    }
    if (targets.length > 0) {
      toast.success("Downloads started", { description: `Downloading ${targets.length} file${targets.length !== 1 ? "s" : ""}...` });
    }
  };

  const handleBulkCopy = () => {
    for (const id of selectedFiles) {
      copyMutation.mutate({ id, targetFolderId: parentId });
    }
    dispatch(clearSelection());
  };

  const handleLabel = (file: FileItem, label: FileLabel | null) => {
    labelMutation.mutate({ id: file.id, label });
  };

  const handleShowDetails = (file: FileItem) => {
    setDetailFile(file);
    setDetailsOpen(true);
  };

  return (
    <div {...getRootProps()} className="h-full relative flex">
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-lg font-medium text-primary">Drop files here to upload</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
          <div className="min-w-0">
            {breadcrumbs ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : (
              <h2 className="text-lg font-semibold truncate" data-testid="text-page-title">{title}</h2>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
            {showCreateFolder && (
              <Button size="sm" variant="outline" onClick={() => setCreateFolderOpen(true)} data-testid="button-new-folder">
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">New folder</span>
              </Button>
            )}
            {showUpload && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) {
                      uploadFiles(Array.from(target.files));
                    }
                  };
                  input.click();
                }}
                data-testid="button-upload"
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDetailsOpen(!detailsOpen)}
              data-testid="button-toggle-details"
              title="Toggle details panel (Ctrl+I)"
            >
              {detailsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showSort && <FilterChips />}

        {quickAccessSlot}

        <div className="flex-1 overflow-auto">
          <FileDisplay
            files={files}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            emptyDescription={emptyDescription}
            onRename={setRenameFile}
            onMove={setMoveFile}
            onShare={setShareFile}
            onPreview={setPreviewFile}
            onStar={handleStar}
            onTrash={handleTrash}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onDetails={handleShowDetails}
            onDragMove={handleDragMove}
            onLabel={handleLabel}
            showSort={showSort}
          />
        </div>
      </div>

      {detailsOpen && (
        <FileDetailsPanel
          file={detailFile}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      <BulkActions
        onMove={handleBulkMove}
        onCopy={handleBulkCopy}
        onStar={handleBulkStar}
        onTrash={handleBulkTrash}
        onDownload={handleBulkDownload}
      />

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onSubmit={(name) => {
          createFolderMutation.mutate(name);
          setCreateFolderOpen(false);
        }}
        isPending={createFolderMutation.isPending}
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
