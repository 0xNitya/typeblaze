import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is a premium route
  const isPremiumRoute = path.includes('/premium/');
  
  // Public paths that don't require authentication
  const isPublicPath = 
    path === '/login' || 
    path === '/signup' || 
    path === '/' || 
    path === '/playground' ||
    path === '/about' ||
    path === '/subscription';
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value || '';
  
  // Redirect logic
  if (isPremiumRoute && !token) {
    // If accessing premium route without being logged in, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For subscription page, let it handle premium status check client-side
  // (We already added logic in the subscription page to redirect premium users)

  return NextResponse.next();
}

// Configure the paths that middleware runs on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons).*)',
  ],
}; 