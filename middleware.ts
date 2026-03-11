import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-edge'

export async function middleware(request: NextRequest) { 
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public paths - allow access without authentication
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    // If user is already authenticated and tries to access login/register, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Allow access to public pages for non-authenticated users
    return NextResponse.next()
  }

  // API routes that don't require authentication
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/device-sync') ||
      pathname.startsWith('/api/focus/complete') ||
      pathname.startsWith('/api/device/ping') ||
    pathname.startsWith('/api/tasks')) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (!token) {
    // Redirect to login if no token
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Verify the token
  const payload = await verifyToken(token)
  if (!payload) {
    // Invalid token - clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  // Authenticated - allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
