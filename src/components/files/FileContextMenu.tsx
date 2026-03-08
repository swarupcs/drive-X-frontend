import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@/components/ui/context-menu";
import { FolderOpen, Pencil, Move, Copy, Star, StarOff, Share2, Download, Trash2, Tag, X } from "lucide-react";
import type { FileItem, FileLabel } from "@/types";

const LABEL_COLORS: { value: FileLabel; bg: string; ring: string }[] = [
  { value: "red", bg: "bg-red-500", ring: "ring-red-500" },
  { value: "orange", bg: "bg-orange-500", ring: "ring-orange-500" },
  { value: "yellow", bg: "bg-yellow-500", ring: "ring-yellow-500" },
  { value: "green", bg: "bg-green-500", ring: "ring-green-500" },
  { value: "blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { value: "purple", bg: "bg-purple-500", ring: "ring-purple-500" },
];

interface FileContextMenuProps {
  file: FileItem;
  children: React.ReactNode;
  onOpen?: () => void;
  onRename?: () => void;
  onMove?: () => void;
  onCopy?: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onTrash?: () => void;
  onLabel?: (label: FileLabel | null) => void;
}

export function FileContextMenu({
  file,
  children,
  onOpen,
  onRename,
  onMove,
  onCopy,
  onStar,
  onShare,
  onDownload,
  onTrash,
  onLabel,
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onOpen} data-testid="ctx-open">
          <FolderOpen className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRename} data-testid="ctx-rename">
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={onMove} data-testid="ctx-move">
          <Move className="mr-2 h-4 w-4" />
          Move to
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopy} data-testid="ctx-copy">
          <Copy className="mr-2 h-4 w-4" />
          Make a copy
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onStar} data-testid="ctx-star">
          {file.starred ? (
            <>
              <StarOff className="mr-2 h-4 w-4" />
              Remove from Starred
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Add to Starred
            </>
          )}
        </ContextMenuItem>
        {onLabel && (
          <ContextMenuSub>
            <ContextMenuSubTrigger data-testid="ctx-label">
              <Tag className="mr-2 h-4 w-4" />
              Color Label
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="p-2">
              <div className="flex items-center gap-1.5">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-5 h-5 rounded-full ${color.bg} transition-transform hover:scale-125 ${file.label === color.value ? "ring-2 ring-offset-2 ring-offset-background " + color.ring : ""}`}
                    onClick={() => onLabel(color.value)}
                    data-testid={`ctx-label-${color.value}`}
                  />
                ))}
                {file.label && (
                  <button
                    className="w-5 h-5 rounded-full border border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:scale-125 transition-transform"
                    onClick={() => onLabel(null)}
                    data-testid="ctx-label-clear"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuItem onClick={onShare} data-testid="ctx-share">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </ContextMenuItem>
        {file.type !== "folder" && (
          <ContextMenuItem onClick={onDownload} data-testid="ctx-download">
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onTrash} className="text-destructive" data-testid="ctx-trash">
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { LABEL_COLORS };
