// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')
  
  // Allow API auth routes
  if (isApiAuth) {
    return NextResponse.next()
  }
  
  // Check if user is authenticated
  const user = token ? verifyJWT(token) : null
  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isAuthPage && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if authenticated and trying to access auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}