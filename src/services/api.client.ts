import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Normalize MongoDB _id fields to id
const normalizeId = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(normalizeId);
  }
  if (data && typeof data === 'object') {
    const obj = { ...(data as Record<string, unknown>) };
    if (obj._id && !obj.id) {
      obj.id = obj._id;
    }
    for (const key of Object.keys(obj)) {
      obj[key] = normalizeId(obj[key]);
    }
    return obj;
  }
  return data;
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor - attach token
    this.client.interceptors.request.use((config) => {
      const stored = localStorage.getItem('drivex-auth');
      if (stored) {
        try {
          const { token } = JSON.parse(stored);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore
        }
      }
      return config;
    });

    // Response interceptor - normalize IDs, handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (response.data && response.data.data !== undefined) {
          response.data.data = normalizeId(response.data.data) as typeof response.data.data;
        }
        return response;
      },
      (error: AxiosError<{ message: string; errors?: Array<{ field: string; message: string }> }>) => {
        if (error.response?.status === 401) {
          // Token expired - clear auth
          localStorage.removeItem('drivex-auth');
          window.location.href = '/login';
        }
        const data = error.response?.data;
        // Surface individual validation field errors if present
        let message = data?.message || error.message || 'An error occurred';
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const fieldMessages = data.errors.map((e) => e.message).join(', ');
          message = fieldMessages;
        }
        return Promise.reject(new Error(message));
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // For multipart/form-data uploads
  async uploadFile<T>(url: string, formData: FormData, onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
      signal,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
