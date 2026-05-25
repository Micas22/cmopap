import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production";
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  // We only want to protect the /api/admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" }, 
        { status: 401 }
      );
    }
    
    try {
      // Verify the token
      await jwtVerify(token, getJwtSecretKey());
      
      // If verification succeeds, continue to the route
      return NextResponse.next();
    } catch (err) {
      console.error("JWT Verification failed:", err);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" }, 
        { status: 401 }
      );
    }
  }
  
  // For all other routes, just continue
  return NextResponse.next();
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: ['/api/admin/:path*'],
};
