import { apiClient } from './api.client';
import type { Activity } from '@/types';

export const activityService = {
  async getActivities(limit = 50, action?: string): Promise<Activity[]> {
    const params: Record<string, unknown> = { limit };
    if (action) params.action = action;
    const res = await apiClient.get<Activity[]>('/activities', { params });
    // Normalize timestamps
    return res.data.map((a) => ({
      ...a,
      timestamp: a.timestamp || (a as unknown as { createdAt: string }).createdAt,
    }));
  },
};
