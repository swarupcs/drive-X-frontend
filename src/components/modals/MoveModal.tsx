import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/hooks/api/useFolders";
import { Folder, FolderOpen, Home, ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { buildFolderTree } from "@/utils/fileHelpers";
import type { FolderTreeNode } from "@/utils/fileHelpers";
import type { FileItem } from "@/types";

// Collect all descendant IDs (including root) for a subtree
function collectDescendants(nodes: FolderTreeNode[]): Set<string> {
  const ids = new Set<string>();
  function walk(ns: FolderTreeNode[]) {
    ns.forEach((n) => { ids.add(n.id); walk(n.children); });
  }
  walk(nodes);
  return ids;
}

function findNode(nodes: FolderTreeNode[], id: string): FolderTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

interface TreeItemProps {
  node: FolderTreeNode;
  depth: number;
  selected: string | null;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  disabled: Set<string>;
}

function TreeItem({ node, depth, selected, onSelect, expanded, onToggle, disabled }: TreeItemProps) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const isDisabled = disabled.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <button
        className={cn(
          "w-full flex items-center gap-1.5 py-2 pr-3 text-sm text-left rounded-md transition-colors",
          isDisabled
            ? "opacity-40 cursor-not-allowed"
            : isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => !isDisabled && onSelect(node.id)}
        disabled={isDisabled}
        data-testid={`move-target-${node.id}`}
      >
        {/* Expand toggle */}
        <span
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
          onClick={(e) => {
            if (!hasChildren) return;
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {hasChildren
            ? isExpanded
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            : null}
        </span>

        {isExpanded
          ? <FolderOpen className="h-4 w-4 flex-shrink-0 text-amber-500" />
          : <Folder className="h-4 w-4 flex-shrink-0 text-amber-500" />}

        <span className="truncate">{node.name}</span>
      </button>

      {isExpanded && node.children.map((child) => (
        <TreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
          expanded={expanded}
          onToggle={onToggle}
          disabled={disabled}
        />
      ))}
    </>
  );
}

interface MoveModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  onSubmit: (id: string, targetFolderId: string | null) => void;
  isPending?: boolean;
}

export function MoveModal({ open, onClose, file, onSubmit, isPending }: MoveModalProps) {
  const { data: folders } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildFolderTree(folders || []), [folders]);

  // When moving a folder, disable it and all its descendants to prevent circular moves
  const disabledIds = useMemo<Set<string>>(() => {
    if (!file || file.type !== "folder") return new Set();
    const node = findNode(tree, file.id);
    return node ? collectDescendants([node]) : new Set([file.id]);
  }, [tree, file]);

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit(file.id, selectedFolder);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
            Move "{file?.name}"
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-60 border rounded-lg bg-muted/20">
          <div className="p-1">
            {/* Root / My Drive */}
            <button
              className={cn(
                "w-full flex items-center gap-1.5 px-3 py-2 text-sm text-left rounded-md transition-colors",
                selectedFolder === null
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              )}
              onClick={() => setSelectedFolder(null)}
              data-testid="move-target-root"
            >
              <span className="w-4" />
              <Home className="h-4 w-4 flex-shrink-0 text-primary" />
              My Drive
            </button>

            {tree.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                No folders yet
              </p>
            ) : (
              tree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  selected={selectedFolder}
                  onSelect={setSelectedFolder}
                  expanded={expanded}
                  onToggle={handleToggle}
                  disabled={disabledIds}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-move">
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
