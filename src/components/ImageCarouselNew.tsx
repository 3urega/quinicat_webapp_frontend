'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Imágenes de fútbol para el carrusel
const images = [
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
];

export default function ImageCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cambiar automáticamente la imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Fondo fútbol ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
            unoptimized
          />
          {/* Capa de difuminado para mejorar la legibilidad del texto, ahora con amarillo abejorro */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4CAF50]/80 via-gray-900/80 to-[#FFD600]/30 backdrop-blur-sm"></div>
        </div>
      ))}
    </div>
  );
} 