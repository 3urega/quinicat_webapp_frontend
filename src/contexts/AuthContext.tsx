'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

// Valor por defecto para el contexto
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  getToken: async () => null,
};

// Crear el contexto
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para guardar el token en una cookie
  const saveToken = async (user: User) => {
    try {
      const token = await user.getIdToken();
      // Guardamos el token en una cookie (1 hora de duración)
      Cookies.set('auth-token', token, { 
        expires: 1/24, // 1 hora
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
    } catch (error) {
      console.error('Error al guardar el token:', error);
    }
  };

  // Función para refrescar el token
  const refreshToken = async (user: User) => {
    try {
      const token = await user.getIdToken(true); // true para forzar la actualización
      await saveToken(user);
      return token;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      return null;
    }
  };

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Guardamos el token inicial
        await saveToken(user);
        
        // Configuramos el refresco automático del token
        const interval = setInterval(async () => {
          await refreshToken(user);
        }, 55 * 60 * 1000); // Refrescar cada 55 minutos
        
        return () => clearInterval(interval);
      } else {
        // Si no hay usuario, eliminamos la cookie
        Cookies.remove('auth-token');
      }
    });

    // Limpiar efecto al desmontar
    return () => unsubscribe();
  }, []);

  // Función para obtener el token actual
  const getToken = async () => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  };

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await saveToken(result.user);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión con email y contraseña
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await saveToken(result.user);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // Eliminamos la cookie
      Cookies.remove('auth-token');
      // Redirigimos al inicio al cerrar sesión
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 