import { useStarredFiles } from "@/hooks/api/useStarredFiles";
import { DriveLayout } from "./DriveLayout";

export default function Starred() {
  const { data: files, isLoading } = useStarredFiles();

  return (
    <DriveLayout
      files={files}
      isLoading={isLoading}
      title="Starred"
      showCreateFolder={false}
      showUpload={false}
      emptyMessage="No starred items"
      emptyDescription="Star files and folders to quickly access them from here. Click the star icon on any file to add it."
    />
  );
}
