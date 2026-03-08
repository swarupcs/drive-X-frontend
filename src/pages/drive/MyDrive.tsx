import { useState } from "react";
import { useFiles, useSuggestedFiles } from "@/hooks/api/useFiles";
import { DriveLayout } from "./DriveLayout";
import { QuickAccessRow } from "@/components/files/QuickAccessRow";
import { PreviewModal } from "@/components/modals/PreviewModal";
import type { FileItem } from "@/types";

export default function MyDrive() {
  const { data: files, isLoading } = useFiles(null);
  const { data: suggested, isLoading: suggestedLoading } = useSuggestedFiles();
  const [quickPreview, setQuickPreview] = useState<FileItem | null>(null);

  return (
    <>
      <DriveLayout
        files={files}
        isLoading={isLoading}
        title="My Drive"
        breadcrumbs={[{ id: null, name: "My Drive" }]}
        parentId={null}
        quickAccessSlot={
          <QuickAccessRow
            files={suggested}
            isLoading={suggestedLoading}
            onPreview={setQuickPreview}
          />
        }
      />
      <PreviewModal
        open={!!quickPreview}
        onClose={() => setQuickPreview(null)}
        file={quickPreview}
        files={suggested}
      />
    </>
  );
}
