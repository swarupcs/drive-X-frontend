import { apiClient } from './api.client';
import type { Comment } from '@/types';

export const commentService = {
  async getComments(fileId: string): Promise<Comment[]> {
    const res = await apiClient.get<Comment[]>(`/files/${fileId}/comments`);
    return res.data;
  },

  async addComment(fileId: string, text: string): Promise<Comment> {
    const res = await apiClient.post<Comment>(`/files/${fileId}/comments`, { text });
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
