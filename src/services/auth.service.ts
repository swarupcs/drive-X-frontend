import { apiClient } from './api.client';
import type { User } from '@/types';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return {
      user: res.data.user,
      token: res.data.accessToken,
    };
  },

  async register(payload: RegisterPayload): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return {
      user: res.data.user,
      token: res.data.accessToken,
    };
  },

  async getMe(): Promise<Omit<User, 'password'>> {
    const res = await apiClient.get<Omit<User, 'password'>>('/auth/me');
    return res.data;
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<Omit<User, 'password'>> {
    const res = await apiClient.patch<Omit<User, 'password'>>('/auth/me', data);
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
