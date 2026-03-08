import { apiClient } from './api.client';
import type { FileItem, ShareLink } from '@/types';

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
};
