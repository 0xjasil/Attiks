import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { exp?: number; role?: string; email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin/login';
  const token = request.cookies.get('attiks_admin_token')?.value;

  let isAuthenticated = false;
  let isAdmin = false;

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      const isExpired = payload.exp ? payload.exp * 1000 < Date.now() : false;
      if (!isExpired) {
        isAuthenticated = true;
        isAdmin = String(payload.role).toUpperCase() === 'ADMIN';
      }
    }
  }

  // If on login page, always allow viewing login form to prevent redirect loops
  if (isLoginPage) {
    return NextResponse.next();
  }

  // If NOT logged in / not admin -> redirect to login with return url
  if (!isAuthenticated || !isAdmin) {
    const loginUrl = new URL('/admin/login', request.url);
    const returnPath = pathname + (search || '');
    loginUrl.searchParams.set('redirect', returnPath);

    const res = NextResponse.redirect(loginUrl);
    if (token) {
      res.cookies.delete('attiks_admin_token');
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
