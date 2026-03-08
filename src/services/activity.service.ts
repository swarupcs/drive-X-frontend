import { apiClient } from './api.client';
import type { Activity } from '@/types';

export const activityService = {
  async getActivities(limit = 50): Promise<Activity[]> {
    const res = await apiClient.get<Activity[]>('/activities', { params: { limit } });
    // Normalize timestamps
    return res.data.map((a) => ({
      ...a,
      timestamp: a.timestamp || (a as unknown as { createdAt: string }).createdAt,
    }));
  },
};
