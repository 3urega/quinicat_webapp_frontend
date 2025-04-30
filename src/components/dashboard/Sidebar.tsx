'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Iconos en SVG para el Sidebar
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
  </svg>
);

const QuinielaIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
  </svg>
);

const ResultadosIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
  </svg>
);

const PerfilIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
  </svg>
);

// Opciones del menú
const menuItems = [
  { icon: DashboardIcon, name: 'Dashboard', path: '/dashboard' },
  { icon: QuinielaIcon, name: 'Apuestas', path: '/dashboard/apuestas' },
  { icon: ResultadosIcon, name: 'Resultados', path: '/dashboard/resultados' },
  { icon: PerfilIcon, name: 'Mi Perfil', path: '/dashboard/perfil' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const router = useRouter();
  
  // Verificar si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Manejar cierre de sesión en modo desarrollo
  const handleSignOut = async () => {
    if (isDevelopment && !user) {
      // Si estamos en modo desarrollo y no hay usuario, simplemente eliminamos la cookie
      Cookies.remove('auth-session');
      router.push('/login');
    } else {
      // Si hay usuario o estamos en producción, usamos el signOut normal
      await signOut();
    }
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} h-screen bg-white dark:bg-gray-900 transition-all duration-300 fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 z-40`}>
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Logo y botón de colapsar */}
          <div className="flex items-center justify-between mb-6 pl-2">
            {!collapsed && (
              <span className="text-xl font-bold text-red-600 dark:text-red-500">QuiniCat</span>
            )}
            <button 
              onClick={toggleSidebar} 
              className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 p-1"
            >
              {collapsed ? (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {isDevelopment && !user && !collapsed && (
            <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded-md">
              Modo Desarrollo Activo
            </div>
          )}

          {/* Menú de navegación */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center py-2 px-2 rounded-lg ${
                    pathname === item.path 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón para cerrar sesión */}
        <div>
          <button
            onClick={handleSignOut}
            className="flex items-center py-2 px-2 w-full rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {!collapsed && <span className="ml-3">Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
} 