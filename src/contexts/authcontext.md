# Sistema de Autenticación

Este documento explica el sistema de autenticación implementado en la aplicación, que utiliza Firebase Authentication para gestionar los usuarios y sus sesiones.

## Estructura

El sistema de autenticación está compuesto por:

1. **AuthContext**: Contexto de React que maneja el estado de autenticación
2. **Middleware**: Verifica las rutas protegidas en el servidor
3. **Firebase Admin**: Verifica los tokens en el servidor

## Flujo de Autenticación

### 1. Inicio de Sesión

Cuando un usuario inicia sesión (ya sea con Google o email/contraseña):

1. Se autentica con Firebase
2. Se obtiene el token JWT del usuario
3. Se guarda el token en una cookie llamada `auth-token`
4. La cookie tiene una duración de 1 hora (mismo tiempo que el token de Firebase)

### 2. Gestión del Token

El token se gestiona de la siguiente manera:

- **Almacenamiento**: Se guarda en una cookie segura con `sameSite: 'strict'`
- **Refresco**: Se refresca automáticamente cada 55 minutos
- **Seguridad**: En producción, la cookie se marca como `secure`
- **Acceso**: Se puede obtener el token actual mediante `getToken()`

### 3. Protección de Rutas

Las rutas protegidas (prefijo `/dashboard`) se verifican de dos maneras:

1. **Cliente**: El `AuthContext` proporciona el estado de autenticación
2. **Servidor**: El middleware verifica el token con Firebase Admin

### 4. Modo Desarrollo

En modo desarrollo (`NODE_ENV === 'development'`):
- Se permite el acceso sin token
- Se mantiene la funcionalidad de login/logout
- Se simula la autenticación para facilitar el desarrollo

## Uso del AuthContext

### Hook useAuth

```typescript
const { 
  user,           // Usuario actual de Firebase
  loading,        // Estado de carga
  signInWithGoogle,  // Login con Google
  signInWithEmail,   // Login con email
  signOut,           // Cerrar sesión
  getToken          // Obtener token actual
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

// Componente que necesita el token
async function ApiCall() {
  const { getToken } = useAuth();
  const token = await getToken();
  
  // Usar token para llamadas API
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

## Configuración Requerida

Para que el sistema funcione, necesitas:

1. **Firebase Admin**:
   - Generar una clave de servicio en la consola de Firebase
   - Guardar el JSON como variable de entorno `FIREBASE_ADMIN_CREDENTIALS`

2. **Variables de Entorno**:
   ```env
   FIREBASE_ADMIN_CREDENTIALS={"type": "service_account", ...}
   ```

3. **Dependencias**:
   ```bash
   npm install firebase-admin
   ```

## Seguridad

El sistema implementa varias medidas de seguridad:

1. **Tokens JWT**: Uso de tokens firmados por Firebase
2. **Cookies Seguras**: Configuración de seguridad en las cookies
3. **Verificación en Servidor**: Validación del token en cada petición
4. **Refresco Automático**: Renovación periódica de tokens
5. **SameSite Strict**: Prevención de ataques CSRF

## Manejo de Errores

El sistema maneja los siguientes casos de error:

1. **Token Inválido**: Redirección al login
2. **Token Expirado**: Refresco automático
3. **Error de Autenticación**: Mensajes de error al usuario
4. **Error de Servidor**: Logging y manejo de errores

## Mejoras Futuras

Posibles mejoras para el sistema:

1. Implementar refresh tokens para sesiones más largas
2. Añadir autenticación con más proveedores
3. Implementar 2FA (Autenticación de dos factores)
4. Añadir rate limiting para intentos de login
5. Implementar recuperación de contraseña 