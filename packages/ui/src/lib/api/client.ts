import axios from 'axios';
import { useAuthStore } from '../store/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.enovait.example.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const tenant = useAuthStore.getState().tenant;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenant) {
    config.headers['X-Tenant-ID'] = tenant.id;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

// Generic API wrapper
export const api = {
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, { params }).then(r => r.data),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data).then(r => r.data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data).then(r => r.data),
  patch: <T>(url: string, data?: any) => apiClient.patch<T>(url, data).then(r => r.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then(r => r.data),
};
