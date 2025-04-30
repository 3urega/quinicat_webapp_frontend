import { getToken } from '@/contexts/AuthContext';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Interfaz para las opciones de la petición
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

// Clase para manejar errores de la API
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Función para realizar peticiones a la API
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    requiresAuth = true,
    headers = {},
    ...restOptions
  } = options;

  // Configurar headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Añadir token de autenticación si es necesario
  if (requiresAuth) {
    const token = await getToken();
    if (!token) {
      throw new ApiError(401, 'No autorizado: Token no disponible');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Construir URL completa
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    });

    // Parsear respuesta
    const data = await response.json();

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || 'Error en la petición',
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error en la conexión con el servidor');
  }
}

// Funciones específicas para diferentes endpoints

// Apuestas
export const apuestasApi = {
  // Obtener todas las apuestas
  getAll: () => apiRequest<Apuesta[]>('/apuestas'),
  
  // Obtener una apuesta por ID
  getById: (id: string) => apiRequest<Apuesta>(`/apuestas/${id}`),
  
  // Crear una nueva apuesta
  create: (data: CreateApuestaDto) => 
    apiRequest<Apuesta>('/apuestas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Actualizar una apuesta
  update: (id: string, data: UpdateApuestaDto) =>
    apiRequest<Apuesta>(`/apuestas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Eliminar una apuesta
  delete: (id: string) =>
    apiRequest<void>(`/apuestas/${id}`, {
      method: 'DELETE',
    }),
};

// Usuarios
export const usuariosApi = {
  // Obtener perfil del usuario actual
  getProfile: () => apiRequest<UserProfile>('/users/profile'),
  
  // Actualizar perfil
  updateProfile: (data: UpdateProfileDto) =>
    apiRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Tipos de datos
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