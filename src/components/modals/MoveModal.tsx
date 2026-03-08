import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/hooks/api/useFolders";
import { Folder, Home } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileItem } from "@/types";

interface MoveModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  onSubmit: (id: string, targetFolderId: string | null) => void;
  isPending?: boolean;
}

export function MoveModal({
  open,
  onClose,
  file,
  onSubmit,
  isPending,
}: MoveModalProps) {
  const { data: folders } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleSubmit = () => {
    if (file) {
      onSubmit(file.id, selectedFolder);
      onClose();
    }
  };

  const folderList = folders?.filter((f) => f.id !== file?.id) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Move "{file?.name}"</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-64 border rounded-lg overflow-hidden">
          <div className="p-1">
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-md transition-colors ${
                selectedFolder === null
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedFolder(null)}
              data-testid="move-target-root"
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              My Drive
            </button>
            {folderList.map((folder) => (
              <button
                key={folder.id}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left rounded-md transition-colors ${
                  selectedFolder === folder.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedFolder(folder.id)}
                data-testid={`move-target-${folder.id}`}
              >
                <Folder className="h-4 w-4 flex-shrink-0 text-amber-500" />
                {folder.name}
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-testid="button-move"
          >
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
