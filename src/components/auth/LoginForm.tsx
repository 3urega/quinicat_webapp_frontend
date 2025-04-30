'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import DevLoginButton from './DevLoginButton';

export default function LoginForm() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir a la página principal
  if (user && !loading) {
    router.push('/');
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
      // La redirección se maneja automáticamente por el useEffect anterior
    } catch (error) {
      console.error('Error al iniciar sesión con Google', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmail(email, password);
      // La redirección se maneja automáticamente por el useEffect anterior
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('El correo electrónico o la contraseña son incorrectos');
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Iniciar Sesión</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Accede a tu cuenta para ver los resultados
          </p>
        </div>
        
        {/* Formulario de email y contraseña */}
        <form onSubmit={handleEmailLogin} className="mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700 dark:bg-gray-700 dark:text-white"
              placeholder="tu@email.com"
              disabled={emailLoading}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <a href="#" className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
              disabled={emailLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={emailLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
          >
            {emailLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
        
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-400 text-sm">o</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        
        {/* Botón de Google */}
        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading || loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none transition-colors duration-200"
          >
            {authLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></span>
            ) : (
              <svg 
                className="h-6 w-6 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Balón de fútbol - fondo blanco */}
                <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
                
                {/* Patrón clásico de balón de fútbol con hexágonos y pentágonos */}
                {/* Hexágonos blancos (ya están en el fondo) */}
                
                {/* Pentágonos negros - patrón clásico */}
                <path d="M12 3L16 6.5L14.5 12H9.5L8 6.5L12 3Z" fill="#000000" />
                <path d="M8 6.5L4.5 12L8 17.5L9.5 12L8 6.5Z" fill="#000000" />
                <path d="M16 6.5L19.5 12L16 17.5L14.5 12L16 6.5Z" fill="#000000" />
                <path d="M8 17.5L12 21L16 17.5L14.5 12L9.5 12L8 17.5Z" fill="#000000" />
                
                {/* Líneas de costura del balón más visibles */}
                <path d="M12 3L16 6.5M16 6.5L19.5 12M19.5 12L16 17.5M16 17.5L12 21M12 21L8 17.5M8 17.5L4.5 12M4.5 12L8 6.5M8 6.5L12 3M9.5 12L8 6.5M9.5 12L8 17.5M9.5 12L14.5 12M14.5 12L16 6.5M14.5 12L16 17.5" stroke="#333333" strokeWidth="0.7" />
                
                {/* Mapa de Cataluña más reconocible en el centro */}
                <path d="M9.8 9.5L9.5 14.5L11.3 16.2L14.5 16L16.2 14.5L16.5 13L15.8 11L14.7 9.8L13.5 9L11.5 9.2L9.8 9.5Z" fill="rgba(220, 50, 50, 0.2)" stroke="rgba(220, 50, 50, 0.3)" strokeWidth="0.3" />
                
                {/* Detalles característicos del mapa */}
                <path d="M15.5 13.5C15.3 14.2 14.5 14.5 14 14.8" stroke="rgba(220, 50, 50, 0.3)" strokeWidth="0.3" />
                <path d="M11 12.5C11.5 12.8 12.2 12.9 13 12.5" stroke="rgba(220, 50, 50, 0.3)" strokeWidth="0.3" />
              </svg>
            )}
            {authLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
          </button>
        </div>
        
        {/* Botón de acceso para desarrollo */}
        <DevLoginButton />
        
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          Para más opciones, contacta con el administrador
        </p>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          ¿No tienes una cuenta?{' '}
          <a href="/registro" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
            Regístrate aquí
          </a>
        </p>
        
        <p className="text-center text-gray-600 dark:text-gray-400 text-xs">
          Al iniciar sesión, aceptas nuestros <a href="#" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Términos y Condiciones</a>
        </p>
      </div>
    </div>
  );
} 