import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public paths
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // API routes that don't require authentication
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/device-sync') ||  // Allow device sync without auth
      pathname.startsWith('/api/focus/complete') || // Allow focus completion
      pathname.startsWith('/api/device/ping') ||    // Allow device ping
      pathname.startsWith('/api/tasks/')) {         // Allow task operations (will validate device ID in route)
    
    // For task operations, we'll validate the device ID in the route handler
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  return NextResponse.next()
}

