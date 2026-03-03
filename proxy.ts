import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Define public routes more cleanly
const PUBLIC_PATHS = ['/', '/login', '/register', '/about', '/pricing', '/contact']
const PUBLIC_API_PATHS = [
  '/api/auth',
  '/api/device-sync', 
  '/api/focus/complete',
  '/api/device/ping',
  '/api/health',
  '/api/public'
]

export function proxy(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Check if it's a public API path
    const isPublicApiPath = PUBLIC_API_PATHS.some(path => 
      pathname.startsWith(path)
    )

    if (isPublicApiPath) {
      return NextResponse.next()
    }

    // Check if it's a public page
    const isPublicPage = PUBLIC_PATHS.some(path => 
      pathname === path || (path !== '/' && pathname.startsWith(path))
    )

    // Handle authenticated users on auth pages
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow access to public pages
    if (isPublicPage) {
      return NextResponse.next()
    }

    // Check authentication for protected routes
    if (!token) {
      return redirectToLogin(request, pathname)
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return clearTokenAndRedirect(request)
    }

    // Optional: Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, redirect to login for safety
    return redirectToLogin(request, request.nextUrl.pathname)
  }
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL('/login', request.url)
  url.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(url)
}

function clearTokenAndRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('token')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - .well-known (for hosting verification, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.well-known).*)',
  ],
}