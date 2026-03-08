import type { FileItem } from "@/types";

export interface FolderTreeNode {
  id: string;
  name: string;
  children: FolderTreeNode[];
  parentId: string | null;
}

export function buildFolderTree(files: FileItem[], rootId: string | null = null): FolderTreeNode[] {
  const folders = files.filter((f) => f.type === "folder" && !f.trashedAt);
  const result: FolderTreeNode[] = [];

  for (const folder of folders) {
    if (folder.parentId === rootId) {
      result.push({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        children: buildFolderTree(files, folder.id),
      });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function getBreadcrumbPath(files: FileItem[], folderId: string | null): { id: string | null; name: string }[] {
  const path: { id: string | null; name: string }[] = [{ id: null, name: "My Drive" }];
  let currentId = folderId;

  while (currentId) {
    const folder = files.find((f) => f.id === currentId);
    if (!folder) break;
    path.push({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return [path[0], ...path.slice(1).reverse()];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
