import { useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSelectedFiles, toggleFileSelection } from "@/store/slices/uiSlice";
import { FileCard } from "./FileCard";
import { FileRow } from "./FileRow";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";
import type { FileItem, FileLabel, SortField, SortOrder, FilterType } from "@/types";
import { matchesFilter } from "@/utils/formatters";

interface FileListProps {
  files: FileItem[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onStar: (file: FileItem) => void;
  onTrash: (file: FileItem) => void;
  onCopy: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onDetails?: (file: FileItem) => void;
  onDragMove?: (fileId: string, targetFolderId: string) => void;
  onLabel?: (file: FileItem, label: FileLabel | null) => void;
  onRestore?: (file: FileItem) => void;
  isTrashView?: boolean;
  showSort?: boolean;
}

function sortFiles(files: FileItem[], sortBy: SortField, sortOrder: SortOrder): FileItem[] {
  return [...files].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    let cmp = 0;
    switch (sortBy) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "size":
        cmp = a.size - b.size;
        break;
      case "type":
        cmp = a.type.localeCompare(b.type);
        break;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });
}

export function FileDisplay({
  files,
  isLoading,
  emptyMessage = "No files here",
  emptyDescription = "Upload files or create folders to get started.",
  onRename,
  onMove,
  onShare,
  onPreview,
  onStar,
  onTrash,
  onCopy,
  onDownload,
  onDetails,
  onDragMove,
  onLabel,
  onRestore,
  isTrashView,
  showSort = true,
}: FileListProps) {
  const { viewMode, sortBy, sortOrder, filterType, selectedFiles } = useAppSelector((s) => s.ui);
  const dispatch = useAppDispatch();
  const lastClickedRef = useRef<string | null>(null);

  const handleItemClick = useCallback(
    (file: FileItem, e: React.MouseEvent, sortedList: FileItem[]) => {
      if (e.shiftKey && lastClickedRef.current && sortedList.length > 0) {
        const ids = sortedList.map((f) => f.id);
        const lastIdx = ids.indexOf(lastClickedRef.current);
        const currentIdx = ids.indexOf(file.id);
        if (lastIdx >= 0 && currentIdx >= 0) {
          const start = Math.min(lastIdx, currentIdx);
          const end = Math.max(lastIdx, currentIdx);
          const rangeIds = ids.slice(start, end + 1);
          const merged = new Set([...selectedFiles, ...rangeIds]);
          dispatch(setSelectedFiles([...merged]));
          return;
        }
      }
      if (e.ctrlKey || e.metaKey) {
        dispatch(toggleFileSelection(file.id));
      } else {
        dispatch(setSelectedFiles([file.id]));
      }
      lastClickedRef.current = file.id;
    },
    [dispatch, selectedFiles]
  );

  if (isLoading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4" : "space-y-1 p-4"}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className={viewMode === "grid" ? "h-32 rounded-md" : "h-10 rounded-md"} />
        ))}
      </div>
    );
  }

  let filtered = files || [];
  if (showSort && filterType !== "all") {
    filtered = filtered.filter((f) => f.type === "folder" || matchesFilter(f.type, filterType));
  }

  const sorted = showSort ? sortFiles(filtered, sortBy, sortOrder) : filtered;

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-foreground" data-testid="text-empty-title">{emptyMessage}</h3>
        <p className="max-w-xs text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  const folders = sorted.filter((f) => f.type === "folder");
  const fileItems = sorted.filter((f) => f.type !== "folder");

  const sharedProps = {
    onRename,
    onMove,
    onShare,
    onPreview,
    onStar,
    onTrash,
    onCopy,
    onDownload,
    onDetails,
    onDragMove,
    onLabel,
    onRestore,
    isTrashView,
  };

  if (viewMode === "grid") {
    return (
      <div className="p-4 space-y-4">
        {folders.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2 px-1">Folders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {folders.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  {...sharedProps}
                  onClick={(e) => handleItemClick(f, e, sorted)}
                />
              ))}
            </div>
          </div>
        )}
        {fileItems.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2 px-1">Files</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {fileItems.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  {...sharedProps}
                  onClick={(e) => handleItemClick(f, e, sorted)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-1">
        <div className="w-5" />
        <div className="w-4" />
        <div className="flex-1">Name</div>
        <div className="w-20 text-right hidden sm:block">Owner</div>
        <div className="w-24 text-right hidden md:block">Modified</div>
        <div className="w-16 text-right">Size</div>
      </div>
      {sorted.map((f) => (
        <FileRow
          key={f.id}
          file={f}
          {...sharedProps}
          onClick={(e) => handleItemClick(f, e, sorted)}
        />
      ))}
    </div>
  );
}
