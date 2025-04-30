'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './auth/AuthButton';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#4CAF50] to-[#3a9f40] text-white shadow-md border-b-4 border-[#FFD600]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Fútbol Local" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-xl font-bold">QuiniCat</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600">
                Inicio
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600">
                Resultados
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600">
                Clasificación
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600">
                Equipos
              </Link>
              <Link href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600">
                Noticias
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <AuthButton />
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-600 focus:outline-none"
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
      
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#4CAF50]`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
          >
            Inicio
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
          >
            Resultados
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
          >
            Clasificación
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
          >
            Equipos
          </Link>
          <Link 
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
          >
            Noticias
          </Link>
          <div className="px-3 py-2">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
} 