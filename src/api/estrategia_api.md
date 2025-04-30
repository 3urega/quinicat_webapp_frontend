# Estrategia de Implementación de Llamadas API

Este documento describe la estrategia para implementar un sistema robusto de llamadas a la API utilizando Axios, con soporte para llamadas autenticadas y anónimas.

## 1. Estructura de Archivos

```
src/
  ├── api/
  │   ├── axios/
  │   │   ├── authApi.ts
  │   │   ├── anonApi.ts
  │   │   └── interceptors.ts
  │   ├── routes/
  │   │   ├── auth_routes.ts
  │   │   └── usuario_routes.ts
  │   └── types/
  │       └── api.types.ts
```

## 2. Configuración de Axios

### 2.1 Configuración Base

```typescript
// src/api/axios/baseConfig.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const baseConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### 2.2 API Anónima

```typescript
// src/api/axios/anonApi.ts
import axios from 'axios';
import { baseConfig } from './baseConfig';

export const anonApi = axios.create(baseConfig);
```

### 2.3 API Autenticada

```typescript
// src/api/axios/authApi.ts
import axios from 'axios';
import { baseConfig } from './baseConfig';
import { getSession } from 'next-auth/react';

export const authApi = axios.create(baseConfig);

// Interceptor para añadir el token
authApi.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});
```

## 3. Interceptores

### 3.1 Interceptor de Respuesta para Token Expirado

```typescript
// src/api/axios/interceptors.ts
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
```

## 4. Tipos

```typescript
// src/api/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
```

## 5. Rutas por Módulo

### 5.1 Rutas de Autenticación

```typescript
// src/api/routes/auth_routes.ts
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
```

### 5.2 Rutas de Usuario

```typescript
// src/api/routes/usuario_routes.ts
import { authApi } from '../axios/authApi';
import { ApiResponse } from '../types/api.types';

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
```

## 6. Implementación en la Aplicación

### 6.1 Inicialización

```typescript
// src/app/layout.tsx
import { setupInterceptors } from '@/api/axios/interceptors';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializar interceptores
  setupInterceptors();
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 6.2 Uso en Componentes

```typescript
// Ejemplo de uso en un componente
import { usuarioRoutes } from '@/api/routes/usuario_routes';
import { authRoutes } from '@/api/routes/auth_routes';
import { anonApi } from '@/api/axios/anonApi';

// Llamada autenticada
const fetchUserProfile = async () => {
  try {
    const profile = await usuarioRoutes.getProfile();
    // Manejar respuesta
  } catch (error) {
    // Manejar error
  }
};

// Llamada de autenticación
const handleLogin = async (credentials: { email: string; password: string }) => {
  try {
    const result = await authRoutes.login(credentials);
    // Manejar respuesta
  } catch (error) {
    // Manejar error
  }
};

// Llamada anónima
const fetchPublicData = async () => {
  try {
    const response = await anonApi.get('/public/data');
    // Manejar respuesta
  } catch (error) {
    // Manejar error
  }
};
```

## 7. Manejo de Errores

### 7.1 Clase de Error Personalizada

```typescript
// src/api/errors/ApiError.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 7.2 Función de Manejo de Errores

```typescript
// src/api/utils/errorHandler.ts
import { ApiError } from '../errors/ApiError';

export const handleApiError = (error: any) => {
  if (error.response) {
    throw new ApiError(
      error.response.data.message || 'Error en la petición',
      error.response.status,
      error.response.data.code
    );
  }
  throw new ApiError('Error de conexión', 500);
};
```

## 8. Consideraciones de Seguridad

1. **Tokens JWT**:
   - Almacenamiento seguro en cookies HTTP-only
   - Refresco automático antes de la expiración
   - Invalidación en logout

2. **CSRF Protection**:
   - Implementar tokens CSRF para peticiones POST/PUT/DELETE
   - Validación en el backend

3. **Rate Limiting**:
   - Implementar límites de peticiones por usuario/IP
   - Manejo de errores 429

## 9. Pruebas

### 9.1 Tests Unitarios

```typescript
// src/api/__tests__/authService.test.ts
import { authService } from '../services/authService';
import { authApi } from '../axios/authApi';

jest.mock('../axios/authApi');

describe('AuthService', () => {
  it('should handle login successfully', async () => {
    const mockResponse = { data: { token: 'test-token' } };
    (authApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual(mockResponse.data);
  });
});
```

## 10. Documentación

1. **Documentación de Endpoints**:
   - Mantener un registro de todos los endpoints disponibles
   - Documentar parámetros y respuestas esperadas

2. **Ejemplos de Uso**:
   - Proporcionar ejemplos de implementación
   - Documentar casos de error comunes

## 11. Mantenimiento

1. **Monitoreo**:
   - Implementar logging de errores
   - Monitorear tiempos de respuesta
   - Alertas para errores frecuentes

2. **Actualizaciones**:
   - Mantener dependencias actualizadas
   - Revisar y actualizar interceptores periódicamente
   - Actualizar documentación con cambios 