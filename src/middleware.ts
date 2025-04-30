import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';

// Inicializar Firebase Admin si no está inicializado
if (!getApps().length) {
  initializeApp({
    // Aquí deberías usar las credenciales de servicio de Firebase Admin
    credential: process.env.FIREBASE_ADMIN_CREDENTIALS ? 
      JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS) : 
      undefined
  });
}

// Este middleware se ejecuta en cada solicitud
export async function middleware(request: NextRequest) {
  // Verificamos si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Obtenemos el token de la cookie
  const token = request.cookies.get('auth-token')?.value;
  
  // Verificamos si el usuario está intentando acceder a una ruta protegida
  const isAccessingProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Si está intentando acceder a una ruta protegida
  if (isAccessingProtectedRoute) {
    // En modo desarrollo, permitimos el acceso sin token
    if (isDevelopment) {
      return NextResponse.next();
    }
    
    // Si no hay token, redirigimos al login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // Verificamos el token con Firebase Admin
      await getAuth().verifyIdToken(token);
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido, redirigimos al login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Si el usuario ya está autenticado e intenta acceder a /login,
  // lo redirigimos al dashboard
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Especificamos en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 