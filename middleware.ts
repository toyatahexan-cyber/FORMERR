import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  // Check if the path requires authentication
  const protectedPaths = ['/farmer/dashboard', '/farmer/applications', '/admin'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      if (request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      } else {
        return NextResponse.redirect(new URL('/farmer/login', request.url));
      }
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      if (request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      } else {
        return NextResponse.redirect(new URL('/farmer/login', request.url));
      }
    }

    // Check role-based access
    if (request.nextUrl.pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/farmer') && decoded.role !== 'farmer') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/farmer/:path*', '/admin/:path*']
};