'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  useSession,
  signIn,
  signOut,
  getSession as nextAuthGetSession,
} from 'next-auth/react';
import type { Session } from 'next-auth';

type RefreshSessionPayload = {
  symfonyToken?: string;
  symfonyTokenExpiresAt?: string;
  role?: string;
};

interface AuthContextType {
  user: Session['user'] | null;
  symfonyToken: string | null;
  symfonyTokenExpiresAt: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  refreshSession: (payload: RefreshSessionPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(status === 'loading');
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.symfonyToken) {
      setError(
        'No se pudo obtener el token de autenticación del backend. Intenta cerrar sesión e iniciar de nuevo.'
      );
    } else {
      setError(null);
    }
  }, [session, status]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });
    } catch (err) {
      console.error('Error al iniciar sesión con email:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (payload: RefreshSessionPayload) => {
    await fetch('/api/auth/session?update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      symfonyToken: session?.user?.symfonyToken ?? null,
      symfonyTokenExpiresAt: session?.user?.symfonyTokenExpiresAt ?? null,
      role: session?.user?.role ?? null,
      loading,
      error,
      signInWithGoogle,
      signInWithEmail,
      signOut: handleSignOut,
      getSession: nextAuthGetSession,
      refreshSession,
    }),
    [session, loading, error]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}