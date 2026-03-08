import { useState } from "react";
import { useLocation } from "wouter";
import { useAppSelector, useAppDispatch } from "@/store";
import { toggleFileSelection } from "@/store/slices/uiSlice";
import { Star, Share2, FolderOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileIcon, getFileBgGradient } from "./FileIcon";
import { FileContextMenu, LABEL_COLORS } from "./FileContextMenu";
import { cn } from "@/lib/utils";
import { formatFileSize, formatRelativeDate, getDaysUntilDeletion } from "@/utils/formatters";
import type { FileItem, FileLabel } from "@/types";

const labelNames: Record<string, string> = {
  red: "Red", orange: "Orange", yellow: "Yellow",
  green: "Green", blue: "Blue", purple: "Purple",
};

interface FileCardProps {
  file: FileItem;
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
  onClick?: (e: React.MouseEvent) => void;
  onLabel?: (file: FileItem, label: FileLabel | null) => void;
  onRestore?: (file: FileItem) => void;
  isTrashView?: boolean;
}

export function FileCard({
  file, onRename, onMove, onShare, onPreview, onStar, onTrash, onCopy,
  onDownload, onDetails, onDragMove, onClick, onLabel, onRestore, isTrashView,
}: FileCardProps) {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector((s) => s.ui.selectedFiles);
  const isSelected = selectedFiles.includes(file.id);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpen = () => {
    if (file.type === "folder") {
      setLocation(`/drive/folder/${file.id}`);
    } else {
      onPreview(file);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", file.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (file.type === "folder") {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (file.type === "folder" && onDragMove) {
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId && draggedId !== file.id) {
        onDragMove(draggedId, file.id);
      }
    }
  };

  const gradient = getFileBgGradient(file.type);

  const labelColor = file.label
    ? LABEL_COLORS.find((c) => c.value === file.label)
    : null;

  return (
    <FileContextMenu
      file={file}
      onOpen={handleOpen}
      onRename={() => onRename(file)}
      onMove={() => onMove(file)}
      onCopy={() => onCopy(file)}
      onStar={() => onStar(file)}
      onShare={() => onShare(file)}
      onDownload={() => onDownload(file)}
      onTrash={() => onTrash(file)}
      onRestore={onRestore ? () => onRestore(file) : undefined}
      onLabel={onLabel ? (label) => onLabel(file, label) : undefined}
      isTrashView={isTrashView}
    >
      <div
        className={cn(
          "group relative flex flex-col rounded-lg border bg-card cursor-pointer select-none",
          "shadow-card hover:shadow-card-hover",
          "transition-all duration-200 hover:-translate-y-0.5",
          isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20",
          isDragOver && "border-primary border-dashed scale-[1.02] bg-primary/5",
          isDragging && "opacity-50 scale-95",
          !isSelected && !isDragOver && "border-border"
        )}
        onClick={onClick}
        onDoubleClick={handleOpen}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={`file-card-${file.id}`}
      >
        {/* Checkbox */}
        <div
          className={cn(
            "absolute left-2 top-2 z-10 transition-opacity duration-150",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFileSelection(file.id));
          }}
        >
          <Checkbox
            checked={isSelected}
            className="h-4 w-4 bg-background border-border shadow-sm"
            data-testid={`checkbox-${file.id}`}
          />
        </div>

        {/* Star toggle button */}
        <div
          className={cn(
            "absolute right-2 top-2 z-10 transition-opacity duration-150",
            file.starred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onStar(file);
          }}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5 cursor-pointer transition-colors",
              file.starred
                ? "fill-amber-400 text-amber-400 hover:fill-amber-500 hover:text-amber-500"
                : "text-muted-foreground hover:text-amber-400"
            )}
          />
        </div>

        {/* Label dot */}
        {file.label && labelColor && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "absolute right-2 bottom-2 z-10 h-2.5 w-2.5 rounded-full",
                  labelColor.bg
                )}
                data-testid={`label-dot-${file.id}`}
              />
            </TooltipTrigger>
            <TooltipContent>{labelNames[file.label]}</TooltipContent>
          </Tooltip>
        )}

        {/* Thumbnail / Preview area */}
        <div className={cn(
          "relative flex h-24 items-center justify-center rounded-t-lg bg-gradient-to-br",
          gradient
        )}>
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="h-full w-full rounded-t-lg object-cover"
            />
          ) : (
            <FileIcon type={file.type} size="lg" />
          )}
          {file.type === "folder" && isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-primary/10">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col gap-0.5 p-2.5">
          <p
            className="truncate text-sm font-medium leading-snug"
            title={file.name}
            data-testid={`text-filename-${file.id}`}
          >
            {file.name}
          </p>
          <div className="flex items-center justify-between gap-1">
            {isTrashView && file.trashedAt ? (
              (() => {
                const days = getDaysUntilDeletion(file.trashedAt);
                return (
                  <p className={cn("truncate text-[11px]", days <= 7 ? "text-destructive font-medium" : "text-muted-foreground")}>
                    {days === 0 ? "Deletes today" : `${days}d left`}
                  </p>
                );
              })()
            ) : (
              <p className="truncate text-[11px] text-muted-foreground">
                {file.type === "folder" ? formatRelativeDate(file.updatedAt) : formatFileSize(file.size)}
              </p>
            )}
            {file.shared && (
              <Share2 className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
            )}
          </div>
        </div>
      </div>
    </FileContextMenu>
  );
}
