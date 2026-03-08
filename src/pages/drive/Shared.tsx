import { useState } from "react";
import { useSharedFiles } from "@/hooks/api/useSharedFiles";
import { useStarItem } from "@/hooks/api/useMutations";
import { FileDisplay } from "@/components/files/FileList";
import { ShareModal } from "@/components/modals/ShareModal";
import { PreviewModal } from "@/components/modals/PreviewModal";
import { Users } from "lucide-react";
import { toast } from "sonner";
import type { FileItem } from "@/types";

export default function SharedPage() {
  const { data: files, isLoading } = useSharedFiles();
  const starMutation = useStarItem();
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handleStar = (file: FileItem) => {
    starMutation.mutate({ id: file.id, starred: !file.starred });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold" data-testid="text-page-title">
          Shared with me
        </h2>
        {files && files.length > 0 && (
          <span className="text-sm text-muted-foreground">
            ({files.length} item{files.length !== 1 ? "s" : ""})
          </span>
        )}
      </div>

      <FileDisplay
        files={files}
        isLoading={isLoading}
        emptyMessage="Nothing shared with you yet"
        emptyDescription="Files that others share with you will appear here."
        onRename={() => {}}
        onMove={() => {}}
        onShare={setShareFile}
        onPreview={setPreviewFile}
        onStar={handleStar}
        onTrash={() =>
          toast.error("Cannot trash shared files", {
            description: "You can only trash files you own.",
          })
        }
        onCopy={() => {}}
        onDownload={(file) =>
          toast.success("Download started", {
            description: `Downloading "${file.name}"...`,
          })
        }
        showSort={false}
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
