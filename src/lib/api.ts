import { getSession } from 'next-auth/react';

const DEFAULT_API_URL = 'http://localhost:3000/api';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SYMFONY_API_URL ||
  DEFAULT_API_URL;

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function resolveAuthToken(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.symfonyToken ?? null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await resolveAuthToken();
    if (!token) {
      throw new ApiError(401, 'No autorizado: token no disponible');
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(
      url,
      Object.assign({}, restOptions, {
        headers: requestHeaders,
      })
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data?.message || 'Error en la petición', data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, 'Error en la conexión con el servidor');
  }
}

export const apuestasApi = {
  getAll: () => apiRequest<Apuesta[]>('/apuestas'),
  getById: (id: string) => apiRequest<Apuesta>(`/apuestas/${id}`),
  create: (data: CreateApuestaDto) =>
    apiRequest<Apuesta>('/apuestas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateApuestaDto) =>
    apiRequest<Apuesta>(`/apuestas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/apuestas/${id}`, {
      method: 'DELETE',
    }),
};

export const usuariosApi = {
  getProfile: () => apiRequest<UserProfile>('/users/profile'),
  updateProfile: (data: UpdateProfileDto) =>
    apiRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

interface Apuesta {
  id: string;
  fecha: string;
  partidos: Partido[];
  estado: 'pendiente' | 'ganada' | 'perdida';
  monto: number;
  ganancia?: number;
}

interface Partido {
  id: string;
  local: string;
  visitante: string;
  apuesta: '1' | 'X' | '2';
  resultado?: '1' | 'X' | '2';
}

interface CreateApuestaDto {
  partidos: Omit<Partido, 'id'>[];
  monto: number;
}

interface UpdateApuestaDto {
  estado?: 'pendiente' | 'ganada' | 'perdida';
  ganancia?: number;
}

interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  saldo: number;
  apuestasGanadas: number;
  apuestasPerdidas: number;
}

interface UpdateProfileDto {
  nombre?: string;
  saldo?: number;
}
