import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearSelection } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Move, Copy, Star, Download, Trash2, X } from "lucide-react";

interface BulkActionsProps {
  onMove: () => void;
  onCopy: () => void;
  onStar: () => void;
  onTrash: () => void;
  onDownload: () => void;
}

export function BulkActions({ onMove, onCopy, onStar, onTrash, onDownload }: BulkActionsProps) {
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector((s) => s.ui.selectedFiles);
  const count = selectedFiles.length;

  const actions = [
    { icon: Move, label: "Move", onClick: onMove },
    { icon: Copy, label: "Copy", onClick: onCopy },
    { icon: Star, label: "Star", onClick: onStar },
    { icon: Download, label: "Download", onClick: onDownload },
  ];

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          data-testid="bulk-actions-bar"
        >
          <div className="flex items-center gap-1 rounded-xl border border-border bg-popover px-3 py-2 shadow-float">
            <span className="mr-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
              {count} selected
            </span>
            <Separator orientation="vertical" className="h-4 mr-1 opacity-40" />
            {actions.map(({ icon: Icon, label, onClick }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 px-2.5 text-xs"
                    onClick={onClick}
                    data-testid={`bulk-${label.toLowerCase()}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">{label}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onTrash}
                  data-testid="bulk-trash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Trash</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">Trash</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-4 mx-0.5 opacity-40" />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => dispatch(clearSelection())}
              data-testid="button-clear-selection"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
