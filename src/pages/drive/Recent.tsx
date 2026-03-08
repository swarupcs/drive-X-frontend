import { useRecentFiles } from "@/hooks/api/useRecentFiles";
import { DriveLayout } from "./DriveLayout";

export default function Recent() {
  const { data: files, isLoading } = useRecentFiles();

  return (
    <DriveLayout
      files={files}
      isLoading={isLoading}
      title="Recent"
      showCreateFolder={false}
      showUpload={false}
      emptyMessage="No recent files"
      emptyDescription="Files you've opened or modified recently will appear here for quick access."
    />
  );
}
