# Integración de Autenticación: Next.js + PHP

Este documento explica cómo implementar un sistema de autenticación donde:
- El frontend (Next.js) maneja el login con Google usando Vercel Auth
- El backend (PHP) verifica los tokens y gestiona los usuarios

## Estructura del Sistema

```
Frontend (Next.js) <---> Vercel Auth <---> Google
      |
      v
Backend (PHP) <---> Base de Datos
```

## 1. Configuración de Google Cloud

1. **Crear un proyecto en Google Cloud Console**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto
   - Habilita la API de Google Identity Services

2. **Configurar las credenciales OAuth**:
   - Ve a "APIs y Servicios" > "Credenciales"
   - Crea un nuevo ID de cliente OAuth
   - Configura las URLs de redirección:
     ```
     http://localhost:3000/api/auth/callback/google  (desarrollo)
     https://tu-dominio.com/api/auth/callback/google (producción)
     ```
   - Guarda el `Client ID` y `Client Secret`

## 2. Configuración del Frontend (Next.js)

### Variables de Entorno
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-seguro
GOOGLE_CLIENT_ID=tu-client-id-de-google
```

### Configuración de NextAuth
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Envío de datos al backend
```typescript
// Ejemplo de función para enviar datos al backend
const sendUserToBackend = async () => {
  const { data: session } = useSession();
  
  if (session?.user) {
    try {
      const response = await fetch('https://tu-backend-php.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }
      
      const user = await response.json();
      // Manejar la respuesta del backend
    } catch (error) {
      console.error('Error:', error);
    }
  }
};
```

## 3. Configuración del Backend (PHP)

### Requisitos
```bash
composer require google/apiclient
```

### Variables de Entorno
```env
# .env
GOOGLE_CLIENT_ID=tu-client-id-de-google
GOOGLE_CLIENT_SECRET=tu-client-secret-de-google
```

### Verificación del Token
```php
<?php
// api/verify_token.php
require_once 'vendor/autoload.php';

function verifyGoogleToken($token) {
    $client = new Google_Client(['client_id' => $_ENV['GOOGLE_CLIENT_ID']]);
    try {
        $payload = $client->verifyIdToken($token);
        return $payload;
    } catch (Exception $e) {
        return null;
    }
}
```

### Endpoint de Usuarios
```php
<?php
// api/users.php
header('Content-Type: application/json');
require_once 'verify_token.php';

// Obtener el token del header
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token no proporcionado']);
    exit;
}

// Verificar el token
$userData = verifyGoogleToken($token);
if (!$userData) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido']);
    exit;
}

// Conectar a la base de datos
$pdo = new PDO('mysql:host=localhost;dbname=tu_db', 'usuario', 'contraseña');

// Verificar si el usuario ya existe
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$userData['email']]);
$existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existingUser) {
    echo json_encode($existingUser);
    exit;
}

// Crear nuevo usuario
$stmt = $pdo->prepare('
    INSERT INTO users (email, name, image, google_id, created_at) 
    VALUES (?, ?, ?, ?, NOW())
');
$stmt->execute([
    $userData['email'],
    $userData['name'],
    $userData['picture'],
    $userData['sub']
]);

$userId = $pdo->lastInsertId();

// Obtener el usuario creado
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$newUser = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($newUser);
```

## 4. Estructura de la Base de Datos

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 5. Flujo de Autenticación

1. **Inicio de Sesión**:
   - Usuario hace clic en "Iniciar sesión con Google"
   - NextAuth.js maneja el flujo de OAuth
   - Google devuelve un token

2. **Verificación en Backend**:
   - Frontend envía el token al backend
   - Backend verifica el token con Google
   - Si es válido, busca o crea el usuario

3. **Persistencia**:
   - El token se almacena en una cookie segura
   - Las sesiones duran 30 días por defecto
   - Se puede refrescar automáticamente

## 6. Consideraciones de Seguridad

1. **Tokens**:
   - Nunca expongas el `GOOGLE_CLIENT_SECRET` en el frontend
   - Usa HTTPS en producción
   - Verifica los tokens en cada petición al backend

2. **Cookies**:
   - NextAuth.js configura cookies seguras automáticamente
   - `httpOnly: true` previene acceso desde JavaScript
   - `secure: true` en producción

3. **Base de Datos**:
   - Usa prepared statements para prevenir SQL injection
   - Almacena solo la información necesaria
   - Mantén los datos sensibles encriptados

## 7. Manejo de Errores

### Frontend
```typescript
try {
  const response = await fetch('/api/users', {
    // ... configuración
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
} catch (error) {
  // Manejar el error
  console.error('Error:', error);
}
```

### Backend
```php
try {
    // ... código de verificación y base de datos
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
```

## 8. Mejoras Futuras

1. Implementar refresh tokens
2. Añadir autenticación con más proveedores
3. Implementar 2FA
4. Añadir rate limiting
5. Implementar recuperación de contraseña
6. Añadir soporte para sesiones persistentes
7. Implementar roles y permisos 