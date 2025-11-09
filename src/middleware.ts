import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
// import { UserRole } from '@/types/roles';

// Este middleware se ejecuta en cada solicitud
export async function middleware(request: NextRequest) {
  // Verificamos si estamos en modo desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Verificamos si el usuario está intentando acceder a una ruta protegida
  const isAccessingProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Si está intentando acceder a una ruta protegida
  if (isAccessingProtectedRoute) {
    // En modo desarrollo, permitimos el acceso sin token
    if (isDevelopment) {
      return NextResponse.next();
    }
    
    // Verificamos el token con NextAuth
    const token = await getToken({ req: request });
    
    // Si no hay token, redirigimos al login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Obtener el rol del usuario desde el endpoint /me
    // try {
    //   const response = await fetch(`${process.env.SYMFONY_API_URL}/me`, {
    //     headers: {
    //       'Authorization': `Bearer ${token.symfonyToken}`
    //     }
    //   });

    //   if (!response.ok) {
    //     return NextResponse.redirect(new URL('/', request.url));
    //   }

    //   const userData = await response.json();
    //   if (userData.role !== UserRole.ADMIN) {
    //     return NextResponse.redirect(new URL('/', request.url));
    //   }
    // } catch (error) {
    //   console.error('Error al obtener datos del usuario:', error);
    //   return NextResponse.redirect(new URL('/', request.url));
    // }
    
    return NextResponse.next();
  }
  
  // Si el usuario ya está autenticado e intenta acceder a /login,
  // lo redirigimos al dashboard
  if (request.nextUrl.pathname === '/login') {
    const token = await getToken({ req: request });
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Especificamos en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 