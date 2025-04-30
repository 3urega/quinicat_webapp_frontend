'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Verificar si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Redirigir al login si no hay usuario autenticado (solo en producción)
  useEffect(() => {
    if (!loading && !user && !isDevelopment) {
      router.push('/login');
    }
  }, [loading, user, router, isDevelopment]);

  // Mientras carga, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Si no hay usuario (en producción), no renderizar nada mientras redirige
  if (!user && !loading && !isDevelopment) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Etiqueta de desarrollo */}
      {isDevelopment && !user && (
        <div className="fixed top-0 right-0 m-4 px-3 py-1 bg-yellow-300 text-yellow-800 text-xs font-bold uppercase rounded-full z-50">
          Modo Desarrollo
        </div>
      )}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="ml-16 md:ml-64 w-full">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 px-6 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          
          {/* Perfil del usuario */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user?.email || (isDevelopment ? 'Usuario de Desarrollo' : 'Usuario')}
            </span>
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              {user?.email ? user.email.charAt(0).toUpperCase() : (isDevelopment ? 'D' : 'U')}
            </div>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          © {new Date().getFullYear()} QuiniCat. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
} 