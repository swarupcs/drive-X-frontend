import { apiClient } from './api.client';
import type { FileItem, ShareLink } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ShareWithUsersPayload {
  emails: string[];
  permission: 'viewer' | 'commenter' | 'editor';
}

export interface GenerateShareLinkPayload {
  permission: 'view' | 'edit' | 'restricted';
  expiresAt?: string | null;
}

export const shareService = {
  async shareWithUsers(fileId: string, payload: ShareWithUsersPayload): Promise<FileItem> {
    const res = await apiClient.post<FileItem>(`/files/${fileId}/share`, payload);
    return res.data;
  },

  async removeSharedUser(fileId: string, email: string): Promise<FileItem> {
    const res = await apiClient.delete<FileItem>(`/files/${fileId}/share/${encodeURIComponent(email)}`);
    return res.data;
  },

  async updateSharedUserPermission(
    fileId: string,
    email: string,
    permission: 'viewer' | 'commenter' | 'editor'
  ): Promise<FileItem> {
    const res = await apiClient.patch<FileItem>(`/files/${fileId}/share/${encodeURIComponent(email)}`, {
      permission,
    });
    return res.data;
  },

  async generateShareLink(fileId: string, payload: GenerateShareLinkPayload): Promise<ShareLink> {
    const res = await apiClient.post<ShareLink>(`/files/${fileId}/share-link`, payload);
    return res.data;
  },

  async getFileShareLinks(fileId: string): Promise<ShareLink[]> {
    const res = await apiClient.get<ShareLink[]>(`/files/${fileId}/share-links`);
    return res.data;
  },

  async getPublicShareLink(token: string): Promise<{ link: ShareLink; file: FileItem }> {
    const res = await apiClient.get<{ link: ShareLink; file: FileItem }>(`/share/${token}`);
    return res.data;
  },

  async toggleShareLink(linkId: string): Promise<ShareLink> {
    const res = await apiClient.patch<ShareLink>(`/share/${linkId}/toggle`);
    return res.data;
  },

  async revokeShareLink(linkId: string): Promise<void> {
    await apiClient.delete(`/share/${linkId}`);
  },

  /** Download a publicly shared file. Opens a signed URL returned by the backend. */
  async getPublicDownloadUrl(token: string): Promise<string> {
    const res = await apiClient.get<{ url: string }>(`/share/${token}/download-url`);
    return res.data.url;
  },

  /** Fallback: direct download link for public share. */
  getPublicDownloadFallbackUrl(token: string): string {
    return `${API_URL}/share/${token}/download`;
  },
};
