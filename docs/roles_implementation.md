# Implementación de Roles: Next.js + Symfony

Este documento explica cómo implementar un sistema de roles en la aplicación, donde:
- El backend (Symfony) gestiona los roles y los devuelve en el endpoint `/me`
- El frontend (Next.js) utiliza esta información para controlar el acceso a diferentes partes de la aplicación

## 1. Implementación del Guard para /dashboard

### Middleware de Autenticación
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/roles';

export async function middleware(request: Request) {
  const token = await getToken({ req: request });
  const isAdmin = token?.user?.role === UserRole.ADMIN;
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Layout del Dashboard
```typescript
// src/app/dashboard/layout.tsx
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard 
      allowedRoles={[UserRole.ADMIN]} 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>No tienes permisos para acceder a esta sección</p>
        </div>
      }
    >
      <div className="dashboard-layout">
        {children}
      </div>
    </RoleGuard>
  );
}
```

### Página de Error Personalizada
```typescript
// src/app/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error.message.includes('No autorizado')) {
      router.push('/');
    }
  }, [error, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Error de Acceso</h2>
        <p className="mb-4">No tienes permisos para acceder a esta sección</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
```

## 1. Estructura de Roles

### Roles Disponibles
```typescript
// src/types/roles.ts
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
  // Agrega más roles según sea necesario
}

export type Role = keyof typeof UserRole;
```

## 2. Configuración del Backend (Symfony)

### Entidad User
```php
// src/Entity/User.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User
{
    // ... existing properties ...

    #[ORM\Column(type: 'string', length: 20)]
    private string $role = 'ROLE_USER';

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): self
    {
        $this->role = $role;
        return $this;
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }
}
```

### Controlador de Usuario
```php
// src/Controller/UserController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            // ... otros datos del usuario
        ]);
    }
}
```

## 3. Configuración del Frontend (Next.js)

### Tipos Extendidos
```typescript
// src/types/next-auth.d.ts
import 'next-auth';
import { UserRole } from './roles';

declare module 'next-auth' {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: User & {
      role?: UserRole;
    };
  }
}
```

### Contexto de Roles
```typescript
// src/contexts/RoleContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/roles';

interface RoleContextType {
  role: UserRole | null;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  isAdmin: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const role = session?.user?.role || null;
  const isAdmin = role === UserRole.ADMIN;

  return (
    <RoleContext.Provider value={{ role, isAdmin }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
```

### Componente de Guardia de Roles
```typescript
// src/components/auth/RoleGuard.tsx
import { ReactNode } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types/roles';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role } = useRole();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## 4. Uso en la Aplicación

### Layout Principal
```typescript
// src/app/layout.tsx
import { RoleProvider } from '@/contexts/RoleContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}
```

### Navegación Condicional
```typescript
// src/components/layout/Navigation.tsx
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types/roles';

export function Navigation() {
  const { role } = useRole();

  return (
    <nav>
      <Link href="/">Inicio</Link>
      <Link href="/profile">Perfil</Link>
      {role === UserRole.ADMIN && (
        <Link href="/dashboard">Dashboard</Link>
      )}
    </nav>
  );
}
```

### Protección de Rutas
```typescript
// src/app/dashboard/layout.tsx
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="dashboard-layout">
        {children}
      </div>
    </RoleGuard>
  );
}
```

## 5. Flujo de Autenticación con Roles

1. **Inicio de Sesión**:
   - Usuario inicia sesión con Google
   - Backend verifica y crea/actualiza el usuario
   - Se asigna el rol correspondiente

2. **Obtención de Datos**:
   - Frontend llama a `/me` después del login
   - Backend devuelve los datos del usuario incluyendo el rol
   - El rol se almacena en la sesión de NextAuth.js

3. **Control de Acceso**:
   - Los componentes usan `useRole` para verificar permisos
   - `RoleGuard` protege rutas y componentes
   - La navegación se adapta según el rol

## 6. Consideraciones de Seguridad

1. **Backend**:
   - Validar roles en cada endpoint protegido
   - Implementar middleware de autorización
   - Registrar intentos de acceso no autorizado

2. **Frontend**:
   - No confiar solo en el control de acceso del frontend
   - Validar respuestas del backend
   - Manejar errores de autorización

3. **Sesión**:
   - Mantener la sesión sincronizada con el backend
   - Refrescar datos del usuario periódicamente
   - Manejar cambios de rol en tiempo real

## 7. Mejoras Futuras

1. **Roles**:
   - Implementar roles jerárquicos
   - Añadir permisos granulares
   - Crear sistema de grupos

2. **Seguridad**:
   - Implementar auditoría de roles
   - Añadir validación de IP
   - Implementar rate limiting por rol

3. **Usabilidad**:
   - Añadir interfaz de gestión de roles
   - Implementar notificaciones de cambios
   - Crear sistema de solicitudes de rol 