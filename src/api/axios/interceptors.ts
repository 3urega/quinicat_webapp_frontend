import { authApi } from './authApi';
import { signOut } from 'next-auth/react';

export const setupInterceptors = () => {
  authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expirado
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
      return Promise.reject(error);
    }
  );
}; 