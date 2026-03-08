import { apiClient, ApiResponse } from './api.client';
import type { User, FileItem, ShareLink, Activity } from '@/types';

export interface SystemSettings {
  allowPublicSharing: boolean;
  allowRegistration: boolean;
  enableFileVersioning: boolean;
  defaultStorageQuotaGB: number;
  bannerMessage: string;
  showBanner: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  activeLinkCount: number;
  totalStorageUsed: number;
  recentActivity: Activity[];
  userStorageStats: Array<{
    _id: string;
    id: string;
    name: string;
    email: string;
    storageUsed: number;
    storageQuota: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/admin/stats');
    return res.data;
  },

  async getAllUsers(page = 1, limit = 20): Promise<{ data: Omit<User, 'password'>[]; meta: ApiResponse['meta'] }> {
    const res = await apiClient.get<Omit<User, 'password'>[]>('/admin/users', { params: { page, limit } });
    return { data: res.data, meta: res.meta };
  },

  async updateUser(id: string, updates: { name?: string; storageQuota?: number; role?: string }): Promise<Omit<User, 'password'>> {
    const res = await apiClient.patch<Omit<User, 'password'>>(`/admin/users/${id}`, updates);
    return res.data;
  },

  async suspendUser(id: string, suspended: boolean): Promise<Omit<User, 'password'>> {
    const res = await apiClient.patch<Omit<User, 'password'>>(`/admin/users/${id}/suspend`, { suspended });
    return res.data;
  },

  async getAllFiles(page = 1, limit = 50): Promise<{ data: FileItem[]; meta: ApiResponse['meta'] }> {
    const res = await apiClient.get<FileItem[]>('/admin/files', { params: { page, limit } });
    return { data: res.data, meta: res.meta };
  },

  async getAllShareLinks(page = 1, limit = 50): Promise<{ data: ShareLink[]; meta: ApiResponse['meta'] }> {
    const res = await apiClient.get<ShareLink[]>('/admin/share-links', { params: { page, limit } });
    return { data: res.data, meta: res.meta };
  },

  async getStorageOverview() {
    const res = await apiClient.get('/admin/storage');
    return res.data;
  },

  async getSettings(): Promise<SystemSettings> {
    const res = await apiClient.get<SystemSettings>('/admin/settings');
    return res.data;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await apiClient.patch<SystemSettings>('/admin/settings', data);
    return res.data;
  },

  async getBanner(): Promise<{ showBanner: boolean; bannerMessage: string }> {
    const res = await apiClient.get<{ showBanner: boolean; bannerMessage: string }>('/settings/banner');
    return res.data;
  },
};
