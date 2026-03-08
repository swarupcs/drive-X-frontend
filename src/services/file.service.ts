import { apiClient } from './api.client';
import type { FileItem, FileLabel, StorageBreakdown } from '@/types';

export interface FileQueryParams {
  parentId?: string | null;
  search?: string;
  filterType?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface StorageInfo {
  used: number;
  quota: number;
  available: number;
  breakdown: StorageBreakdown[];
}

export const fileService = {
  async getFiles(params?: FileQueryParams): Promise<FileItem[]> {
    const query: Record<string, string> = {};
    if (params?.parentId !== undefined && params.parentId !== null) {
      query.parentId = params.parentId;
    }
    if (params?.search) query.search = params.search;
    if (params?.filterType) query.filterType = params.filterType;
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.sortOrder) query.sortOrder = params.sortOrder;
    const res = await apiClient.get<FileItem[]>('/files', { params: query });
    return res.data;
  },

  async getFileById(id: string): Promise<FileItem> {
    const res = await apiClient.get<FileItem>(`/files/${id}`);
    return res.data;
  },

  async getRecentFiles(): Promise<FileItem[]> {
    const res = await apiClient.get<FileItem[]>('/files/recent');
    return res.data;
  },

  async getStarredFiles(): Promise<FileItem[]> {
    const res = await apiClient.get<FileItem[]>('/files/starred');
    return res.data;
  },

  async getTrashedFiles(): Promise<FileItem[]> {
    const res = await apiClient.get<FileItem[]>('/files/trash');
    return res.data;
  },

  async getSharedFiles(): Promise<FileItem[]> {
    const res = await apiClient.get<FileItem[]>('/files/shared');
    return res.data;
  },

  async getSuggestedFiles(): Promise<FileItem[]> {
    // Use recent files as suggestions
    const res = await apiClient.get<FileItem[]>('/files/recent');
    return res.data.slice(0, 10);
  },

  async getFolderTree(): Promise<FileItem[]> {
    const res = await apiClient.get<FileItem[]>('/files/tree');
    return res.data;
  },

  async getStorageInfo(): Promise<StorageInfo> {
    const res = await apiClient.get<{
      used: number;
      quota: number;
      available: number;
      breakdown: Record<string, number>;
    }>('/files/storage');
    const raw = res.data;
    const COLORS: Record<string, string> = {
      documents: '#3B82F6',
      images: '#10B981',
      videos: '#8B5CF6',
      audio: '#F59E0B',
      archives: '#6B7280',
      other: '#EF4444',
    };
    const breakdown: StorageBreakdown[] = Object.entries(raw.breakdown || {}).map(([key, size]) => ({
      type: key.charAt(0).toUpperCase() + key.slice(1),
      size: size as number,
      count: 0,
      color: COLORS[key] ?? '#6B7280',
    }));
    return { used: raw.used, quota: raw.quota, available: raw.available ?? raw.quota - raw.used, breakdown };
  },

  async createFolder(name: string, parentId?: string | null): Promise<FileItem> {
    const res = await apiClient.post<FileItem>('/files/folders', { name, parentId: parentId || null });
    return res.data;
  },

  async uploadFile(
    file: File,
    parentId: string | null,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    const res = await apiClient.uploadFile<FileItem>('/files/upload', formData, onProgress, signal);
    return res.data;
  },

  async uploadMultipleFiles(
    files: File[],
    parentId: string | null,
    onProgress?: (progress: number) => void
  ): Promise<FileItem[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (parentId) formData.append('parentId', parentId);
    const res = await apiClient.uploadFile<FileItem[]>('/files/upload-multiple', formData, onProgress);
    return res.data;
  },

  async getPresignedUploadUrl(filename: string, mimeType: string, size: number) {
    const res = await apiClient.post<{ uploadUrl: string; key: string; expiresIn: number }>('/files/upload-url', { filename, mimeType, size });
    return res.data;
  },

  async renameFile(id: string, name: string): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/rename`, { name });
    return res.data;
  },

  async moveFile(id: string, targetFolderId: string | null): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/move`, { targetFolderId });
    return res.data;
  },

  async copyFile(id: string, targetFolderId?: string | null): Promise<FileItem> {
    const res = await apiClient.post<FileItem>(`/files/${id}/copy`, { targetFolderId: targetFolderId || null });
    return res.data;
  },

  async trashFile(id: string): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/trash`);
    return res.data;
  },

  async restoreFile(id: string): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/restore`);
    return res.data;
  },

  async deleteFilePermanently(id: string): Promise<void> {
    await apiClient.delete(`/files/${id}`);
  },

  async starFile(id: string, starred: boolean): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/star`, { starred });
    return res.data;
  },

  async labelFile(id: string, label: FileLabel | null): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${id}/label`, { label });
    return res.data;
  },

  async getDownloadUrl(id: string): Promise<string> {
    const res = await apiClient.get<{ url: string }>(`/files/${id}/download`);
    return res.data.url;
  },
};
