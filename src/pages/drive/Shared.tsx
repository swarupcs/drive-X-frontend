import { useSharedFiles } from "@/hooks/api/useSharedFiles";
import { DriveLayout } from "./DriveLayout";

export default function Shared() {
  const { data: files, isLoading } = useSharedFiles();

  return (
    <DriveLayout
      files={files}
      isLoading={isLoading}
      title="Shared with Me"
      showCreateFolder={false}
      showUpload={false}
      emptyMessage="Nothing shared with you yet"
      emptyDescription="When someone shares a file or folder with you, it will appear here. You can view and download shared items."
    />
  );
}
