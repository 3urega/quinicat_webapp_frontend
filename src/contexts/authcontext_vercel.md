# Sistema de Autenticación con Vercel Auth

Este documento explica el sistema de autenticación implementado en la aplicación, que utiliza Vercel Auth (NextAuth.js) para gestionar los usuarios y sus sesiones.

## Estructura

El sistema de autenticación está compuesto por:

1. **AuthContext**: Contexto de React que maneja el estado de autenticación
2. **Middleware**: Verifica las rutas protegidas en el servidor
3. **NextAuth.js**: Maneja la autenticación y sesiones
4. **SessionProvider**: Proveedor de sesión que envuelve la aplicación

## Flujo de Autenticación

### 1. Inicio de Sesión

Cuando un usuario inicia sesión (ya sea con Google o email/contraseña):

1. Se autentica con NextAuth.js
2. Se crea una sesión segura
3. Se almacena la sesión en una cookie segura
4. La sesión se mantiene activa según la configuración de NextAuth.js

### 2. Gestión de la Sesión

La sesión se gestiona de la siguiente manera:

- **Almacenamiento**: Se guarda en una cookie segura llamada `next-auth.session-token`
- **Configuración de la Cookie**:
  ```typescript
  {
    httpOnly: true,           // No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'lax',         // Prevención de CSRF
    path: '/',               // Accesible en toda la aplicación
    maxAge: 30 * 24 * 60 * 60 // 30 días de duración
  }
  ```
- **Refresco**: Se refresca automáticamente según la configuración de NextAuth.js
- **Acceso**: Se puede obtener la sesión actual mediante `getSession()` o `useSession()`

### 3. Token JWT

- **Generación**: Se genera automáticamente un token JWT
- **Contenido**: Incluye información del usuario y la sesión
- **Acceso**:
  ```typescript
  // En el cliente
  const { data: session } = useSession();
  const token = session?.accessToken;

  // En el servidor
  import { getServerSession } from 'next-auth';
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;
  ```
- **Seguridad**: El token está firmado con `NEXTAUTH_SECRET`

### 4. Protección de Rutas

Las rutas protegidas se verifican de dos maneras:

1. **Cliente**: 
   ```typescript
   // En componentes
   const { data: session } = useSession({
     required: true,
     onUnauthenticated() {
       redirect('/auth/signin');
     },
   });
   ```

2. **Servidor**:
   ```typescript
   // En API routes
   import { getServerSession } from 'next-auth';
   const session = await getServerSession(authOptions);
   
   if (!session) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

### 5. Modo Desarrollo

En modo desarrollo (`NODE_ENV === 'development'`):
- Se permite el acceso sin sesión
- Se mantiene la funcionalidad de login/logout
- Se simula la autenticación para facilitar el desarrollo

## Uso del AuthContext

### Hook useAuth

```typescript
const { 
  user,           // Usuario actual de NextAuth
  loading,        // Estado de carga
  signInWithGoogle,  // Login con Google
  signInWithEmail,   // Login con email
  signOut,           // Cerrar sesión
  getSession         // Obtener sesión actual
} = useAuth();
```

### Ejemplo de Uso

```typescript
// Componente que necesita autenticación
function ProtectedComponent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <RedirectToLogin />;

  return <div>Contenido protegido</div>;
}

// Componente que necesita la sesión
async function ApiCall() {
  const { getSession } = useAuth();
  const session = await getSession();
  
  // Usar sesión para llamadas API
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`
    }
  });
}
```

## Configuración Requerida

Para que el sistema funcione, necesitas:

1. **NextAuth.js**:
   - Configurar los proveedores de autenticación
   - Definir las variables de entorno necesarias

2. **Variables de Entorno**:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tu-secreto-seguro
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   ```

3. **Dependencias**:
   ```bash
   npm install next-auth
   ```

4. **Configuración del Layout**:
   ```typescript
   // app/layout.tsx
   import { Providers } from './providers';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <Providers>
             {children}
           </Providers>
         </body>
       </html>
     );
   }
   ```

## Seguridad

El sistema implementa varias medidas de seguridad:

1. **Sesiones Seguras**: Uso de sesiones cifradas por NextAuth.js
2. **Cookies Seguras**: Configuración de seguridad en las cookies
3. **Verificación en Servidor**: Validación de la sesión en cada petición
4. **SameSite Lax**: Prevención de ataques CSRF
5. **JWT**: Uso de tokens JWT para sesiones
6. **httpOnly**: Las cookies no son accesibles desde JavaScript
7. **Secure**: En producción, solo se permite HTTPS
8. **CORS**: Protección contra ataques de origen cruzado

## Manejo de Errores

El sistema maneja los siguientes casos de error:

1. **Sesión Inválida**: Redirección al login
2. **Sesión Expirada**: Refresco automático
3. **Error de Autenticación**: Mensajes de error al usuario
4. **Error de Servidor**: Logging y manejo de errores

## Mejoras Futuras

Posibles mejoras para el sistema:

1. Implementar refresh tokens para sesiones más largas
2. Añadir autenticación con más proveedores
3. Implementar 2FA (Autenticación de dos factores)
4. Añadir rate limiting para intentos de login
5. Implementar recuperación de contraseña
6. Añadir soporte para autenticación con redes sociales adicionales
7. Implementar roles y permisos de usuario
8. Añadir soporte para sesiones persistentes
9. Implementar autenticación sin contraseña
10. Añadir soporte para autenticación con dispositivos móviles 