export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  storageUsed: number;
  storageQuota: number;
  status: "active" | "suspended";
  createdAt: string;
}

export type FileType =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "jpg"
  | "png"
  | "gif"
  | "mp4"
  | "mp3"
  | "zip"
  | "txt"
  | "csv"
  | "svg"
  | "json"
  | "html"
  | "folder";

export type FileLabel = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  parentId: string | null;
  ownerId: string;
  ownerName: string;
  starred: boolean;
  shared: boolean;
  sharedWith: SharedUser[];
  createdAt: string;
  updatedAt: string;
  accessedAt: string;
  trashedAt: string | null;
  mimeType: string;
  thumbnail?: string;
  label?: FileLabel | null;
}

export interface SharedUser {
  userId: string;
  email: string;
  name: string;
  permission: "viewer" | "commenter" | "editor";
}

export interface ShareLink {
  id: string;
  fileId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  createdBy: string;
  creatorName: string;
  creatorEmail: string;
  permission: "view" | "edit" | "restricted";
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  accessCount: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: "upload" | "download" | "share" | "rename" | "move" | "delete" | "restore" | "create_folder" | "star" | "unstar" | "trash";
  targetName: string;
  targetType: FileType;
  timestamp: string;
  details?: string;
}

export interface StorageInfo {
  used: number;
  quota: number;
  breakdown: StorageBreakdown[];
}

export interface StorageBreakdown {
  type: string;
  size: number;
  count: number;
  color: string;
}

export interface UploadItem {
  id: string;
  filename: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error" | "cancelled";
  folderId: string | null;
  errorMessage?: string;
}

export interface Comment {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export type ViewMode = "grid" | "list";
export type SortField = "name" | "updatedAt" | "size" | "type";
export type SortOrder = "asc" | "desc";
export type FilterType = "all" | "documents" | "images" | "videos" | "audio" | "archives" | "other";
