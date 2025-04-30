'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DevLoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Verificar si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Si no estamos en desarrollo, no mostrar el botón
  if (!isDevelopment) {
    return null;
  }
  
  const handleDevLogin = () => {
    setLoading(true);
    
    // Simular login estableciendo una cookie de sesión
    Cookies.set('auth-session', 'true', { expires: 1, sameSite: 'strict' });
    
    // Simular un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      setLoading(false);
      // Redirigir al dashboard
      router.push('/dashboard');
    }, 800);
  };
  
  return (
    <div className="mt-6 relative">
      {/* Etiqueta de desarrollo */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 px-2 py-1 bg-yellow-300 text-yellow-800 text-xs font-bold uppercase rounded-full">
        Solo dev
      </div>
      
      <button
        onClick={handleDevLogin}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 border border-yellow-400 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 focus:outline-none transition-colors duration-200"
      >
        {loading ? (
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600 mr-2"></span>
        ) : (
          <svg 
            className="h-6 w-6 mr-2 text-yellow-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 8l4 4m0 0l-4 4m4-4H3" 
            />
          </svg>
        )}
        {loading ? 'Accediendo...' : 'Acceso para desarrollo'}
      </button>
      
      <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        Este botón solo aparece en modo desarrollo y permite saltar la autenticación
      </p>
    </div>
  );
} 