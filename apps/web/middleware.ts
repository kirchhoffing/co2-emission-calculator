import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Auth middleware for CO2 Emission Calculator
 * 
 * Protects authenticated routes and redirects unauthenticated users to login
 * Handles role-based access control for admin routes
 */
export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const userRole = token?.role as string;

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/calculator',
    '/reports',
    '/analytics',
    '/import',
    '/profile',
    '/privacy-center'
  ];

  // Define admin-only routes
  const adminRoutes = [
    '/admin'
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Check if current path is admin-only
  const isAdminRoute = adminRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admin users from admin routes to dashboard
  if (isAdminRoute && (!isLoggedIn || userRole !== 'admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  // Redirect authenticated users from login/register to dashboard
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 