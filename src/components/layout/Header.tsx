'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-primary-green to-primary-green text-white shadow-md border-b-4 border-primary-yellow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="QuiniCat" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-xl font-bold">QuiniCat</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-electric-blue">
                Inicio
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:text-electric-blue">
                Resultados
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:text-electric-blue">
                Clasificación
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:text-electric-blue">
                Equipos
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:text-electric-blue">
                Noticias
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <Image
                    src={session.user?.image || '/default-avatar.png'}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-white">{session.user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Perfil
                  </Link>
                  <Link href="/user/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Configuración
                  </Link>
                  <Link href="/api/auth/signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Cerrar sesión
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-green hover:bg-primary-green/80"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-green/80 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-primary-green`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
          >
            Inicio
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
          >
            Resultados
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
          >
            Clasificación
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
          >
            Equipos
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
          >
            Noticias
          </Link>
          {session ? (
            <>
              <Link 
                href="/user/profile"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
              >
                Perfil
              </Link>
              <Link 
                href="/user/settings"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
              >
                Configuración
              </Link>
              <Link 
                href="/api/auth/signout"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
              >
                Cerrar sesión
              </Link>
            </>
          ) : (
            <Link 
              href="/api/auth/signin"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-green/80 hover:text-electric-blue"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 