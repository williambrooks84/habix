// middleware.ts (at project root or src/middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // server-side JWT helper

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect dashboard pages; tweak as needed
  if (pathname.startsWith('/dashboard')) {
    // getToken reads the session/jwt cookie server-side
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
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
  matcher: ['/dashboard/:path*', '/login'],
};