import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip protection for the admin login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if user has session token in localStorage
  // Since we can't access localStorage in middleware, we'll check for the session cookie or header
  const authHeader = request.headers.get('cookie');
  
  // Look for session token in cookies or authorization header
  let sessionToken = null;
  
  // Try to get token from authorization header first (for API calls)
  const authHeaderValue = request.headers.get('authorization');
  if (authHeaderValue && authHeaderValue.startsWith('Bearer ')) {
    sessionToken = authHeaderValue.substring(7).trim();
  }
  
  // If no auth header, try to get from cookies
  if (!sessionToken && authHeader) {
    const cookies = authHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    sessionToken = cookies['session_token'];
  }

  if (!sessionToken) {
    // No token found, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token and get user
    const { user } = await AuthService.verifyIdToken(sessionToken);
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // User is authenticated and is admin, proceed
    return NextResponse.next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude API routes from middleware (they handle their own auth)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};