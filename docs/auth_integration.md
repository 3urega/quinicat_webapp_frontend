# Integración de Autenticación: Next.js + Symfony

Este documento explica cómo implementar un sistema de autenticación híbrido donde:
- El frontend (Next.js) maneja el login con Google usando NextAuth.js (Vercel)
- El backend (Symfony) verifica el token de Vercel y genera su propio JWT
- Se utilizan dos tokens: uno de Vercel (automático) y otro de Symfony (manual)

## Estructura del Sistema

```
Frontend (Next.js) <---> NextAuth.js <---> Google
      |                        |
      |                        v
      |                 Backend (Symfony)
      |                        |
      |                        v
      +-------------------> Base de Datos
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
GOOGLE_CLIENT_SECRET=tu-client-secret-de-google
SYMFONY_API_URL=http://localhost:8000/api
```

### Configuración de NextAuth
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

export const runtime = 'nodejs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Enviar datos al backend Symfony y obtener JWT
        try {
          const response = await fetch(`${process.env.SYMFONY_API_URL}/auth/verify-vercel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: user.id,
              vercelToken: account.access_token
            })
          });
          
          if (!response.ok) throw new Error('Error al obtener JWT de Symfony');
          
          const { symfonyToken } = await response.json();
          token.symfonyToken = symfonyToken;
        } catch (error) {
          console.error('Error al obtener JWT de Symfony:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.symfonyToken = token.symfonyToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Tipos Extendidos
```typescript
// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    symfonyToken?: string;
  }
  interface Session {
    user: User & {
      symfonyToken?: string;
    };
  }
}
```

### Configuración de Axios
```typescript
// src/api/axios/authApi.ts
import axios from 'axios';
import { baseConfig } from './baseConfig';
import { getSession } from 'next-auth/react';

export const authApi = axios.create(baseConfig);

// Interceptor para añadir el token de Symfony
authApi.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.symfonyToken) {
    config.headers.Authorization = `Bearer ${session.user.symfonyToken}`;
  }
  return config;
});

// Interceptor para manejar tokens expirados
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token de Symfony expirado
      const session = await getSession();
      if (session?.user) {
        try {
          // Intentar refrescar el token
          const response = await fetch(`${process.env.SYMFONY_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.user.symfonyToken}`
            }
          });
          
          if (response.ok) {
            const { symfonyToken } = await response.json();
            // Actualizar la sesión con el nuevo token
            session.user.symfonyToken = symfonyToken;
            // Reintentar la petición original
            error.config.headers.Authorization = `Bearer ${symfonyToken}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
        }
      }
      // Si no se puede refrescar, cerrar sesión
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
    return Promise.reject(error);
  }
);
```

## 3. Configuración del Backend (Symfony)

### Requisitos
```bash
composer require lexik/jwt-authentication-bundle
composer require google/apiclient
```

### Configuración de JWT
```yaml
# config/packages/lexik_jwt_authentication.yaml
lexik_jwt_authentication:
    secret_key: '%env(JWT_SECRET_KEY)%'
    public_key: '%env(JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600
```

### Controlador de Autenticación
```php
<?php
// src/Controller/AuthController.php
namespace App\Controller;

use App\Service\VercelAuthService;
use App\Service\JWTService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    private $vercelAuthService;
    private $jwtService;

    public function __construct(VercelAuthService $vercelAuthService, JWTService $jwtService)
    {
        $this->vercelAuthService = $vercelAuthService;
        $this->jwtService = $jwtService;
    }

    #[Route('/api/auth/verify-vercel', name: 'auth_verify_vercel', methods: ['POST'])]
    public function verifyVercelToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Verificar token de Vercel
        $vercelUser = $this->vercelAuthService->verifyToken($data['vercelToken']);
        if (!$vercelUser) {
            return new JsonResponse(['error' => 'Token de Vercel inválido'], 401);
        }

        // Buscar o crear usuario
        $user = $this->vercelAuthService->findOrCreateUser($vercelUser);

        // Generar JWT de Symfony
        $symfonyToken = $this->jwtService->generateToken($user);

        return new JsonResponse(['symfonyToken' => $symfonyToken]);
    }

    #[Route('/api/auth/refresh', name: 'auth_refresh', methods: ['POST'])]
    public function refreshToken(Request $request): JsonResponse
    {
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization'));
        
        try {
            $user = $this->jwtService->validateToken($token);
            $newToken = $this->jwtService->generateToken($user);
            return new JsonResponse(['symfonyToken' => $newToken]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Token inválido'], 401);
        }
    }
}
```

### Servicio de Vercel Auth
```php
<?php
// src/Service/VercelAuthService.php
namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Google_Client;
use Doctrine\ORM\EntityManagerInterface;

class VercelAuthService
{
    private $client;
    private $userRepository;
    private $entityManager;

    public function __construct(
        string $googleClientId,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->client = new Google_Client(['client_id' => $googleClientId]);
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
    }

    public function verifyToken(string $token): ?array
    {
        try {
            return $this->client->verifyIdToken($token);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function findOrCreateUser(array $vercelUser): User
    {
        $user = $this->userRepository->findOneBy(['email' => $vercelUser['email']]);
        
        if (!$user) {
            $user = new User();
            $user->setEmail($vercelUser['email']);
            $user->setName($vercelUser['name']);
            $user->setImage($vercelUser['picture']);
            $user->setGoogleId($vercelUser['sub']);
            
            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }

        return $user;
    }
}
```

## 4. Flujo de Autenticación

1. **Inicio de Sesión con Vercel**:
   - Usuario hace clic en "Iniciar sesión con Google"
   - NextAuth.js maneja el flujo de OAuth
   - Google devuelve un token
   - NextAuth.js crea una sesión segura

2. **Verificación en Symfony**:
   - Frontend envía el token de Vercel al backend
   - Backend verifica el token con Google
   - Si es válido, busca o crea el usuario
   - Genera un JWT de Symfony

3. **Persistencia**:
   - El token de Vercel se maneja automáticamente por NextAuth.js
   - El token de Symfony se almacena en la sesión de NextAuth.js
   - Se incluye en todas las peticiones al backend
   - Se refresca automáticamente cuando expira

## 5. Consideraciones de Seguridad

1. **Tokens**:
   - Token de Vercel: gestionado automáticamente por NextAuth.js
   - Token de Symfony: almacenado en la sesión de NextAuth.js
   - Ambos tokens tienen tiempo de expiración
   - Se implementa refresh token para Symfony

2. **Cookies**:
   - NextAuth.js configura cookies seguras
   - `httpOnly: true`
   - `secure: true` en producción
   - `sameSite: 'lax'`

3. **CORS**:
   - Configuración específica por entorno
   - Lista blanca de orígenes permitidos
   - Headers necesarios para autenticación

## 6. Manejo de Errores

### Frontend
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

// src/api/utils/errorHandler.ts
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

### Backend
```php
// src/EventSubscriber/ExceptionSubscriber.php
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onKernelException',
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        
        $response = new JsonResponse([
            'error' => $exception->getMessage(),
            'code' => $exception->getCode(),
        ], $this->getStatusCode($exception));
        
        $event->setResponse($response);
    }

    private function getStatusCode(\Throwable $exception): int
    {
        if ($exception instanceof \InvalidArgumentException) {
            return 400;
        }
        if ($exception instanceof \Symfony\Component\Security\Core\Exception\AuthenticationException) {
            return 401;
        }
        return 500;
    }
}
```

## 7. Mejoras Futuras

1. **Autenticación**:
   - Implementar refresh tokens para Symfony
   - Añadir autenticación con más proveedores
   - Implementar 2FA
   - Añadir rate limiting

2. **Seguridad**:
   - Implementar CSRF tokens
   - Añadir validación de IP
   - Implementar logging de seguridad
   - Añadir monitoreo de intentos fallidos

3. **Usabilidad**:
   - Implementar sesiones persistentes
   - Añadir "Recuérdame"
   - Implementar recuperación de contraseña
   - Añadir verificación de email

4. **Rendimiento**:
   - Implementar caché de tokens
   - Añadir índices optimizados
   - Implementar paginación
   - Añadir compresión de respuestas 

## 8. Implementación de Verificación de Email

### 8.1 Configuración del Frontend (Next.js)

#### Variables de Entorno Adicionales
```env
# .env.local
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email
EMAIL_SERVER_PASSWORD=tu-contraseña
EMAIL_FROM=noreply@tu-dominio.com
```

#### Configuración de NextAuth para Email
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import EmailProvider from 'next-auth/providers/email';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // 24 horas
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'email') {
        // Verificar si el email está verificado en Symfony
        try {
          const response = await fetch(`${process.env.SYMFONY_API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          
          if (!response.ok) {
            return false;
          }
          
          const { isVerified } = await response.json();
          return isVerified;
        } catch (error) {
          console.error('Error al verificar email:', error);
          return false;
        }
      }
      return true;
    },
    // ... existing callbacks ...
  },
};
```

#### Plantilla de Email Personalizada
```typescript
// src/emails/verification-request.tsx
import { VerificationRequestEmail } from '@/components/emails/VerificationRequestEmail';

export default function verificationRequestEmail({
  url,
  email,
}: {
  url: string;
  email: string;
}) {
  return <VerificationRequestEmail url={url} email={email} />;
}
```

### 8.2 Configuración del Backend (Symfony)

#### Entidad User
```php
// src/Entity/User.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User
{
    // ... existing properties ...

    #[ORM\Column(type: 'boolean')]
    private bool $isEmailVerified = false;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $emailVerificationToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $emailVerificationTokenExpiresAt = null;

    public function isEmailVerified(): bool
    {
        return $this->isEmailVerified;
    }

    public function setIsEmailVerified(bool $isEmailVerified): self
    {
        $this->isEmailVerified = $isEmailVerified;
        return $this;
    }

    public function getEmailVerificationToken(): ?string
    {
        return $this->emailVerificationToken;
    }

    public function setEmailVerificationToken(?string $token): self
    {
        $this->emailVerificationToken = $token;
        return $this;
    }

    public function getEmailVerificationTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->emailVerificationTokenExpiresAt;
    }

    public function setEmailVerificationTokenExpiresAt(?\DateTimeInterface $expiresAt): self
    {
        $this->emailVerificationTokenExpiresAt = $expiresAt;
        return $this;
    }
}
```

#### Controlador de Verificación de Email
```php
// src/Controller/EmailVerificationController.php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\EmailVerificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class EmailVerificationController extends AbstractController
{
    private $userRepository;
    private $emailVerificationService;

    public function __construct(
        UserRepository $userRepository,
        EmailVerificationService $emailVerificationService
    ) {
        $this->userRepository = $userRepository;
        $this->emailVerificationService = $emailVerificationService;
    }

    #[Route('/api/auth/verify-email', name: 'auth_verify_email', methods: ['POST'])]
    public function verifyEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['error' => 'Email no proporcionado'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        return new JsonResponse([
            'isVerified' => $user->isEmailVerified(),
            'needsVerification' => !$user->isEmailVerified()
        ]);
    }

    #[Route('/api/auth/send-verification-email', name: 'auth_send_verification_email', methods: ['POST'])]
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['error' => 'Email no proporcionado'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        $this->emailVerificationService->sendVerificationEmail($user);

        return new JsonResponse(['message' => 'Email de verificación enviado']);
    }

    #[Route('/api/auth/confirm-email/{token}', name: 'auth_confirm_email', methods: ['GET'])]
    public function confirmEmail(string $token): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['emailVerificationToken' => $token]);
        
        if (!$user) {
            return new JsonResponse(['error' => 'Token inválido'], 400);
        }

        if ($user->getEmailVerificationTokenExpiresAt() < new \DateTime()) {
            return new JsonResponse(['error' => 'Token expirado'], 400);
        }

        $user->setIsEmailVerified(true);
        $user->setEmailVerificationToken(null);
        $user->setEmailVerificationTokenExpiresAt(null);

        $this->userRepository->save($user, true);

        return new JsonResponse(['message' => 'Email verificado correctamente']);
    }
}
```

#### Servicio de Verificación de Email
```php
// src/Service/EmailVerificationService.php
namespace App\Service;

use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class EmailVerificationService
{
    private $mailer;
    private $urlGenerator;

    public function __construct(
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator
    ) {
        $this->mailer = $mailer;
        $this->urlGenerator = $urlGenerator;
    }

    public function sendVerificationEmail(User $user): void
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTime('+24 hours');

        $user->setEmailVerificationToken($token);
        $user->setEmailVerificationTokenExpiresAt($expiresAt);

        $verificationUrl = $this->urlGenerator->generate(
            'auth_confirm_email',
            ['token' => $token],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        $email = (new Email())
            ->from('noreply@tu-dominio.com')
            ->to($user->getEmail())
            ->subject('Verifica tu email')
            ->html(
                sprintf(
                    '<p>Hola %s,</p>
                    <p>Por favor, verifica tu email haciendo clic en el siguiente enlace:</p>
                    <p><a href="%s">%s</a></p>
                    <p>Este enlace expirará en 24 horas.</p>',
                    $user->getName(),
                    $verificationUrl,
                    $verificationUrl
                )
            );

        $this->mailer->send($email);
    }
}
```

### 8.3 Flujo de Verificación de Email

1. **Registro/Login con Email**:
   - Usuario se registra o inicia sesión con email
   - NextAuth.js envía un email de verificación
   - El backend genera un token de verificación

2. **Verificación**:
   - Usuario hace clic en el enlace del email
   - El frontend redirige al endpoint de confirmación
   - El backend verifica el token y marca el email como verificado

3. **Persistencia**:
   - El estado de verificación se almacena en la base de datos
   - Se requiere verificación para ciertas acciones
   - Los tokens expiran después de 24 horas

### 8.4 Consideraciones de Seguridad

1. **Tokens**:
   - Generación segura con `random_bytes`
   - Expiración automática
   - Uso único

2. **Emails**:
   - Envío asíncrono
   - Plantillas personalizadas
   - Protección contra spam

3. **Base de Datos**:
   - Almacenamiento seguro de tokens
   - Limpieza periódica de tokens expirados
   - Índices optimizados

### 8.5 Mejoras Futuras

1. **Verificación**:
   - Implementar reenvío automático de emails
   - Añadir códigos de verificación por SMS
   - Implementar verificación en dos pasos

2. **Seguridad**:
   - Añadir rate limiting para emails
   - Implementar lista negra de dominios
   - Añadir validación de dominios

3. **Usabilidad**:
   - Añadir notificaciones push
   - Implementar recordatorios automáticos
   - Añadir soporte para múltiples emails 

## 9. Implementación de Sesiones Permanentes

### 9.1 Configuración del Frontend (Next.js)

#### Configuración de NextAuth para Sesiones Permanentes
```typescript
// src/app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  session: {
    // Extender la duración de la sesión
    maxAge: 30 * 24 * 60 * 60, // 30 días
    // Permitir sesiones permanentes
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'credentials') {
        // Añadir flag de sesión permanente
        token.isPersistent = account.isPersistent;
      }
      return token;
    },
    async session({ session, token }) {
      session.isPersistent = token.isPersistent;
      return session;
    }
  }
};
```

#### Componente de Login con Opción de Sesión Permanente
```typescript
// src/components/auth/LoginForm.tsx
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isPersistent = e.currentTarget.querySelector('input[name="remember"]')?.checked;
    
    await signIn('credentials', {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
      isPersistent,
      redirect: true,
      callbackUrl: '/dashboard'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <label>
        <input type="checkbox" name="remember" />
        Mantener sesión iniciada
      </label>
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
```

### 9.2 Configuración del Backend (Symfony)

#### Entidad User con Soporte para Sesiones Permanentes
```php
// src/Entity/User.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User
{
    // ... existing properties ...

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $rememberToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $rememberTokenExpiresAt = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserSession::class)]
    private Collection $sessions;

    public function getRememberToken(): ?string
    {
        return $this->rememberToken;
    }

    public function setRememberToken(?string $token): self
    {
        $this->rememberToken = $token;
        return $this;
    }

    public function getRememberTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->rememberTokenExpiresAt;
    }

    public function setRememberTokenExpiresAt(?\DateTimeInterface $expiresAt): self
    {
        $this->rememberTokenExpiresAt = $expiresAt;
        return $this;
    }
}

// src/Entity/UserSession.php
#[ORM\Entity]
class UserSession
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'sessions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $token = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\Column(length: 45)]
    private ?string $ipAddress = null;

    #[ORM\Column(length: 255)]
    private ?string $userAgent = null;
}
```

#### Controlador de Sesiones
```php
// src/Controller/SessionController.php
namespace App\Controller;

use App\Entity\User;
use App\Entity\UserSession;
use App\Repository\UserRepository;
use App\Repository\UserSessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SessionController extends AbstractController
{
    private $userRepository;
    private $sessionRepository;

    public function __construct(
        UserRepository $userRepository,
        UserSessionRepository $sessionRepository
    ) {
        $this->userRepository = $userRepository;
        $this->sessionRepository = $sessionRepository;
    }

    #[Route('/api/auth/remember-me', name: 'auth_remember_me', methods: ['POST'])]
    public function rememberMe(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $isPersistent = $data['isPersistent'] ?? false;

        if (!$email) {
            return new JsonResponse(['error' => 'Email no proporcionado'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        if ($isPersistent) {
            $token = bin2hex(random_bytes(32));
            $expiresAt = new \DateTime('+1 year');
            
            $session = new UserSession();
            $session->setUser($user);
            $session->setToken($token);
            $session->setCreatedAt(new \DateTimeImmutable());
            $session->setExpiresAt($expiresAt);
            $session->setIpAddress($request->getClientIp());
            $session->setUserAgent($request->headers->get('User-Agent'));
            
            $this->sessionRepository->save($session, true);
        }

        return new JsonResponse(['message' => 'Sesión permanente configurada']);
    }

    #[Route('/api/auth/sessions', name: 'auth_sessions', methods: ['GET'])]
    public function getSessions(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $sessions = $this->sessionRepository->findBy(['user' => $user]);

        return new JsonResponse([
            'sessions' => array_map(function (UserSession $session) {
                return [
                    'id' => $session->getId(),
                    'createdAt' => $session->getCreatedAt()->format('c'),
                    'expiresAt' => $session->getExpiresAt()->format('c'),
                    'ipAddress' => $session->getIpAddress(),
                    'userAgent' => $session->getUserAgent(),
                ];
            }, $sessions)
        ]);
    }

    #[Route('/api/auth/sessions/{id}', name: 'auth_revoke_session', methods: ['DELETE'])]
    public function revokeSession(int $id): JsonResponse
    {
        $session = $this->sessionRepository->find($id);
        if (!$session) {
            return new JsonResponse(['error' => 'Sesión no encontrada'], 404);
        }

        if ($session->getUser() !== $this->getUser()) {
            return new JsonResponse(['error' => 'No autorizado'], 403);
        }

        $this->sessionRepository->remove($session, true);

        return new JsonResponse(['message' => 'Sesión revocada']);
    }
}
```

### 9.3 Flujo de Sesiones Permanentes

1. **Inicio de Sesión**:
   - Usuario marca "Mantener sesión iniciada"
   - Se genera un token de sesión permanente
   - Se almacena en la base de datos con información del dispositivo

2. **Persistencia**:
   - El token se almacena en una cookie segura
   - Válido por un año o hasta que el usuario lo revoque
   - Se puede usar para restaurar la sesión

3. **Gestión**:
   - Usuario puede ver sus sesiones activas
   - Puede revocar sesiones individuales
   - Recibe notificaciones de nuevas sesiones

### 9.4 Consideraciones de Seguridad

1. **Tokens**:
   - Generación segura con `random_bytes`
   - Expiración configurable
   - Validación de IP y User-Agent

2. **Cookies**:
   - Almacenamiento seguro
   - Configuración de SameSite
   - Protección CSRF

3. **Base de Datos**:
   - Almacenamiento de información de sesión
   - Limpieza periódica de sesiones expiradas
   - Índices optimizados

### 9.5 Mejoras Futuras

1. **Seguridad**:
   - Implementar autenticación de dos factores
   - Añadir detección de actividad sospechosa
   - Implementar notificaciones push

2. **Usabilidad**:
   - Añadir nombres descriptivos a las sesiones
   - Implementar sincronización entre dispositivos
   - Añadir recordatorios de seguridad

3. **Rendimiento**:
   - Implementar caché de sesiones
   - Optimizar consultas de base de datos
   - Añadir compresión de datos

## 10. Consideraciones Finales

1. **Integración**:
   - Asegúrate de que todas las partes del sistema estén correctamente integradas
   - Realiza pruebas exhaustivas para asegurar que la autenticación funciona correctamente

2. **Seguridad**:
   - Mantén actualizado el software y las bibliotecas utilizadas
   - Implementa políticas de seguridad adecuadas
   - Realiza auditorías periódicas del sistema

3. **Mantenimiento**:
   - Realiza mantenimiento regular del sistema
   - Implementa actualizaciones y mejoras periódicamente
   - Mantén la documentación actualizada

4. **Escalabilidad**:
   - Diseña el sistema para manejar un alto número de usuarios y sesiones
   - Implementa técnicas de escalado adecuadas
   - Realiza pruebas de rendimiento y optimiza el sistema según sea necesario

5. **Legalidad**:
   - Asegúrate de cumplir con las leyes y regulaciones aplicables
   - Implementa políticas de privacidad y consentimiento del usuario
   - Realiza auditorías regulares del cumplimiento de la ley 