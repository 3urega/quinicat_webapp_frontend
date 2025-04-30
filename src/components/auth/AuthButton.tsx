'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Si se está cargando, mostrar un indicador
  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  // Si el usuario está autenticado, mostrar su foto de perfil y menú desplegable
  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center focus:outline-none"
        >
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'Usuario'}
              width={40}
              height={40}
              className="rounded-full border-2 border-[#FFD600]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#FFD600] flex items-center justify-center text-[#4CAF50] font-bold">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-[#FFD600]">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.displayName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Mi perfil
            </Link>
            <button
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  // Si el usuario no está autenticado, mostrar el botón de inicio de sesión
  return (
    <Link
      href="/login"
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#4CAF50] bg-[#FFD600] hover:bg-[#e6c200] font-bold"
    >
      Iniciar Sesión
    </Link>
  );
} 