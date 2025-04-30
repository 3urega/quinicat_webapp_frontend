import Image from 'next/image';
import Link from 'next/link';
import ImageCarouselNew from './ImageCarouselNew';

export default function Hero() {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Carrusel de imágenes de fondo */}
      <ImageCarouselNew />
      
      {/* Patrón de balones de fútbol (ahora como capa adicional sobre las imágenes) */}
      <div 
        className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"
        aria-hidden="true"
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">El fútbol local</span>
              <span className="block text-[#FFD600]">más cerca que nunca</span>
            </h1>
            <p className="mt-6 text-base text-gray-300 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
              Sigue todos los resultados, clasificaciones y equipos de tu competición local favorita. 
              Apoya a los equipos de tu ciudad y no te pierdas ni un partido.
            </p>
            <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#4CAF50] hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                >
                  Ver resultados
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#4CAF50] bg-[#FFD600] hover:bg-[#e6c200] md:py-4 md:text-lg md:px-10"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-4 border-[#FFD600]">
                <span className="sr-only">Ver el video de introducción</span>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    className="w-full h-full" 
                    src="https://www.youtube.com/embed/d0eUMnJ5nO8" 
                    title="Video de fútbol local"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 