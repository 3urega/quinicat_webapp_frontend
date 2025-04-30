'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Redirigirá gracias al useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-green-700 text-white">
              <h3 className="text-lg leading-6 font-medium">Perfil de Usuario</h3>
              <p className="mt-1 max-w-2xl text-sm">Información personal y preferencias</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center">
                  <div className="mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'Usuario'}
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.displayName || 'Usuario'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      Usuario desde: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Fecha desconocida'}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferencias</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Equipo favorito</h5>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No has seleccionado ningún equipo favorito
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Notificaciones</h5>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Las notificaciones están desactivadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 