import { useState } from "react";
import { useLocation } from "wouter";
import { useAppSelector, useAppDispatch } from "@/store";
import { toggleFileSelection } from "@/store/slices/uiSlice";
import { Star, Share2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FileIcon } from "./FileIcon";
import { FileContextMenu, LABEL_COLORS } from "./FileContextMenu";
import { cn } from "@/lib/utils";
import { formatFileSize, formatDate } from "@/utils/formatters";
import type { FileItem, FileLabel } from "@/types";

interface FileRowProps {
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
}

export function FileRow({
  file, onRename, onMove, onShare, onPreview, onStar, onTrash, onCopy,
  onDownload, onDetails, onDragMove, onClick, onLabel,
}: FileRowProps) {
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
      onLabel={onLabel ? (label) => onLabel(file, label) : undefined}
    >
      <div
        className={cn(
          "group flex items-center gap-2 px-4 py-2 cursor-pointer select-none",
          "border-b border-border/40 last:border-0",
          "transition-colors duration-100",
          isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40",
          isDragOver && "bg-primary/10 ring-1 ring-primary ring-inset",
          isDragging && "opacity-50"
        )}
        onClick={onClick}
        onDoubleClick={handleOpen}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={`file-row-${file.id}`}
      >
        {/* Checkbox */}
        <div
          className={cn(
            "flex-shrink-0 transition-opacity duration-150",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFileSelection(file.id));
          }}
        >
          <Checkbox
            checked={isSelected}
            className="h-4 w-4"
            data-testid={`checkbox-row-${file.id}`}
          />
        </div>

        {/* Icon */}
        <div className="flex-shrink-0">
          <FileIcon type={file.type} size="sm" />
        </div>

        {/* Name */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium" data-testid={`text-filename-${file.id}`}>
            {file.name}
          </span>
          {file.label && labelColor && (
            <div
              className={cn("h-2 w-2 flex-shrink-0 rounded-full", labelColor.bg)}
              data-testid={`label-dot-${file.id}`}
            />
          )}
        </div>

        {/* Status icons */}
        <div className="hidden sm:flex items-center gap-1.5 w-12 justify-end flex-shrink-0">
          {file.starred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
          {file.shared && <Share2 className="h-3.5 w-3.5 text-muted-foreground/60" />}
        </div>

        {/* Owner */}
        <span className="text-xs text-muted-foreground w-20 text-right flex-shrink-0 hidden sm:block">
          {file.ownerName}
        </span>

        {/* Modified */}
        <div className="hidden md:block w-32 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{formatDate(file.updatedAt)}</span>
        </div>

        {/* Size */}
        <div className="w-20 flex-shrink-0 text-right">
          <span className="text-xs text-muted-foreground">
            {file.type === "folder" ? "—" : formatFileSize(file.size)}
          </span>
        </div>

        {onDetails && (
          <button
            className={cn(
              "p-1 rounded transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0",
              "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDetails(file);
            }}
            data-testid={`button-details-${file.id}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        )}
      </div>
    </FileContextMenu>
  );
}
