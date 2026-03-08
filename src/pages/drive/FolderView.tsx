import { useFiles } from "@/hooks/api/useFiles";
import { useFolders } from "@/hooks/api/useFolders";
import { DriveLayout } from "./DriveLayout";
import { getBreadcrumbPath } from "@/utils/fileHelpers";

interface FolderViewProps {
  folderId: string;
}

export default function FolderView({ folderId }: FolderViewProps) {
  const { data: files, isLoading } = useFiles(folderId);
  const { data: allFolders } = useFolders();

  const breadcrumbs = allFolders ? getBreadcrumbPath(allFolders, folderId) : [{ id: null, name: "My Drive" }];

  return (
    <DriveLayout
      files={files}
      isLoading={isLoading}
      title="Folder"
      breadcrumbs={breadcrumbs}
      parentId={folderId}
    />
  );
}
