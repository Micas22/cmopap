import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production";
  return new TextEncoder().encode(secret);
};

// Pages that require perms >= 1 (i.e. approved users only)
const PROTECTED_DASH_PATHS = [
  '/dashboard',
  '/dashanimais',
  '/dashcolonias',
  '/dashdocumentos',
  '/dashocorrencias',
  '/dashstocks',
  '/dashutilizadores',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect /api/admin routes ─────────────────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    const reqMethod = request.method;

    // Public whitelist — no JWT needed for these safe, read-only or public-submit routes
    const isPublicRoute =
      (pathname === '/api/admin/animals'    && reqMethod === 'GET')  ||  // home page animal list
      (pathname === '/api/admin/colonias'   && reqMethod === 'GET')  ||  // ShelterMap
      (pathname === '/api/admin/ocorrencias' && reqMethod === 'POST');    // public report submission

    if (isPublicRoute) {
      return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, getJwtSecretKey());
      return NextResponse.next();
    } catch (err) {
      console.error("JWT Verification failed:", err);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
  }

  // ── Protect dashboard pages from perms-0 users ────────────────────────────
  const isDashRoute = PROTECTED_DASH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isDashRoute) {
    const token = request.cookies.get('auth_token')?.value;

    // No token → send to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
      const perms = (payload as any).perms;

      // perms 0 → no dashboard access, redirect to home
      if (perms === 0) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid / expired token → send to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Run middleware on API admin routes AND all dash pages
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/dashanimais/:path*',
    '/dashcolonias/:path*',
    '/dashdocumentos/:path*',
    '/dashocorrencias/:path*',
    '/dashstocks/:path*',
    '/dashutilizadores/:path*',
    // exact matches for the top-level dash routes
    '/dashboard',
    '/dashanimais',
    '/dashcolonias',
    '/dashdocumentos',
    '/dashocorrencias',
    '/dashstocks',
    '/dashutilizadores',
  ],
};
