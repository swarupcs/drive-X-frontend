import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  label: string;
  shortcuts: ShortcutEntry[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    label: "Navigation",
    shortcuts: [
      { keys: ["←", "→"], description: "Previous / next file in preview" },
      { keys: ["Escape"], description: "Close panel or deselect all" },
    ],
  },
  {
    label: "Selection",
    shortcuts: [
      { keys: ["Ctrl", "A"], description: "Select all files" },
      { keys: ["Escape"], description: "Deselect all" },
    ],
  },
  {
    label: "File Actions",
    shortcuts: [
      { keys: ["F2"], description: "Rename selected file" },
      { keys: ["Delete"], description: "Move selected to trash" },
      { keys: ["Ctrl", "I"], description: "Toggle details panel" },
    ],
  },
  {
    label: "View",
    shortcuts: [
      { keys: ["?"], description: "Open keyboard shortcuts" },
    ],
  },
];

function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <kbd className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-md border bg-muted text-xs font-mono font-medium text-muted-foreground">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-keyboard-shortcuts">
        <DialogHeader>
          <DialogTitle data-testid="text-shortcuts-title">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {shortcutCategories.map((category, catIdx) => (
            <div key={category.label}>
              {catIdx > 0 && <Separator className="mb-4" />}
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" data-testid={`text-category-${category.label.toLowerCase()}`}>
                {category.label}
              </h4>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between gap-4">
                    <span className="text-sm" data-testid={`text-shortcut-desc-${catIdx}-${sIdx}`}>{shortcut.description}</span>
                    <KeyCombo keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
