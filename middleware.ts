import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes — require role = "admin"
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only trigger middleware for authenticated users OR admin paths
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Admin routes always need auth check
        if (pathname.startsWith('/admin')) return true;
        // Protected user routes
        if (['/cart', '/checkout', '/orders', '/profile', '/wishlist'].some(p => pathname.startsWith(p))) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/cart',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile',
    '/wishlist',
  ],
};
