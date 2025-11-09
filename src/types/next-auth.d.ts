import 'next-auth';
import 'next-auth/jwt';
import type { UserRole } from './roles';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole | string;
    symfonyToken?: string;
    symfonyTokenExpiresAt?: string;
    vercelIdToken?: string;
  }

  interface Session {
    user: User & {
      role?: UserRole | string;
      symfonyToken?: string;
      symfonyTokenExpiresAt?: string;
      vercelIdToken?: string;
    };
    symfonyToken?: string | null;
    symfonyTokenExpiresAt?: string;
    role?: UserRole | string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: UserRole | string;
    symfonyToken?: string;
    symfonyTokenExpiresAt?: string;
    vercelIdToken?: string;
  }
}