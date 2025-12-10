// middleware.ts (at project root or src/middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // server-side JWT helper

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth checks for public routes
  if (pathname.startsWith('/api/auth') || pathname === '/login' || pathname === '/signup') {
    return NextResponse.next();
  }

  // Check authentication for all other pages
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // If user is blocked, clear session and redirect to login
  if (token && (token as any).is_blocked === true) {
    console.log('Middleware - Blocked user detected, redirecting to login');
    const response = NextResponse.redirect(new URL('/login?blocked=true', req.nextUrl));
    // Clear the session cookie
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }

  // Only protect dashboard pages; tweak as needed
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // redirect to login with callback
      const signInUrl = new URL('/login', req.nextUrl);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
  }

  // If a logged-in user hits /login, send to dashboard
  if (pathname === '/login') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Optionally export a matcher to limit the middleware to these paths:
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};