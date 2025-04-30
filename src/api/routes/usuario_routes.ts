import { authApi } from '../axios/authApi';
import { ApiResponse, UserProfile, UserPreferences } from '../types/api.types';

export const usuarioRoutes = {
  getProfile: async () => {
    const response = await authApi.get<ApiResponse<UserProfile>>('/usuario/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await authApi.put<ApiResponse<UserProfile>>(
      '/usuario/profile',
      data
    );
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await authApi.post<ApiResponse<void>>(
      '/usuario/change-password',
      { currentPassword, newPassword }
    );
    return response.data;
  },

  getPreferences: async () => {
    const response = await authApi.get<ApiResponse<UserPreferences>>(
      '/usuario/preferences'
    );
    return response.data;
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const response = await authApi.put<ApiResponse<UserPreferences>>(
      '/usuario/preferences',
      preferences
    );
    return response.data;
  }
}; 