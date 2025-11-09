import axios from 'axios';
import { baseConfig } from './baseConfig';
import { getSession, signOut } from 'next-auth/react';

type AxiosConfig = {
  headers?: Record<string, string>;
  url?: string;
  method?: string;
  data?: unknown;
  params?: unknown;
  [key: string]: unknown;
};

type AxiosRetryConfig = AxiosConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  symfonyToken: string;
  expiresAt?: string;
  role?: string;
};

const authApi = axios.create(baseConfig);

const updateNextAuthSession = async (payload: {
  symfonyToken: string;
  symfonyTokenExpiresAt?: string;
  role?: string;
}) => {
  try {
    await fetch('/api/auth/session?update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symfonyToken: payload.symfonyToken,
        symfonyTokenExpiresAt: payload.symfonyTokenExpiresAt,
        role: payload.role,
      }),
    });
  } catch (error) {
    console.error('[authApi] Error actualizando la sesión de NextAuth:', error);
  }
};

const getSymfonyApiUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_SYMFONY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';
  return envUrl.replace(/\/$/, '');
};

authApi.interceptors.request.use(async (config: any) => {
  const session = await getSession();
  if (session?.user?.symfonyToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${session.user.symfonyToken}`,
    };
  }

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config as AxiosRetryConfig;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const session = await getSession();
      const symfonyToken = session?.user?.symfonyToken;
      if (!symfonyToken) {
        await signOut({ callbackUrl: '/login' });
        return Promise.reject(error);
      }

      const refreshUrl = `${getSymfonyApiUrl()}/auth/refresh`;

      try {
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${symfonyToken}`,
          },
        });

        if (!refreshResponse.ok) {
          throw new Error('No se pudo refrescar el token.');
        }

        const data = (await refreshResponse.json()) as RefreshResponse;
        await updateNextAuthSession({
          symfonyToken: data.symfonyToken,
          symfonyTokenExpiresAt: data.expiresAt,
          role: data.role,
        });

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.symfonyToken}`,
        };

        return authApi.request(originalRequest as any);
      } catch (refreshError) {
        console.error('[authApi] Error al refrescar el token de Symfony:', refreshError);
        await signOut({ callbackUrl: '/login' });
      }
    }

    return Promise.reject(error);
  }
);

export { authApi };