import axios from 'axios';
import { baseConfig } from './baseConfig';
import { getSession } from 'next-auth/react';

export const authApi = axios.create(baseConfig);

// Interceptor para añadir el token JWT al backend Symfony
authApi.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.jwt) { // Asumiendo que el JWT está en session.user.jwt
    config.headers.Authorization = `Bearer ${session.user.jwt}`;
  }
  return config;
}); 