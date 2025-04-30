import { authApi } from '../axios/authApi';
import { ApiResponse } from '../types/api.types';

export const authRoutes = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await authApi.post<ApiResponse<{ token: string }>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  logout: async () => {
    await authApi.post('/auth/logout');
  },

  refreshToken: async () => {
    const response = await authApi.post<ApiResponse<{ token: string }>>(
      '/auth/refresh'
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await authApi.post<ApiResponse<void>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await authApi.post<ApiResponse<void>>(
      '/auth/reset-password',
      { token, newPassword }
    );
    return response.data;
  }
}; 