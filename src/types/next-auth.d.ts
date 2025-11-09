import 'next-auth';
import { UserRole } from './roles';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    symfonyToken?: string;
  }

  interface Session {
    user: User & {
      role?: UserRole;
      symfonyToken?: string;
    };
  }
} 