import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FileItem } from "@/types";

interface RenameModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  onSubmit: (id: string, name: string) => void;
  isPending?: boolean;
}

export function RenameModal({
  open,
  onClose,
  file,
  onSubmit,
  isPending,
}: RenameModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (file) setName(file.name);
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && name.trim()) {
      onSubmit(file.id, name.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="bg-muted border-0 focus-visible:ring-1"
              data-testid="input-rename"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              data-testid="button-rename"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
