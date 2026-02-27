// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth'

export function proxy(request: NextRequest) {

  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  const isApiAuth = pathname.startsWith('/api/auth')

  // ✅ ADD THIS
  const isDeviceSyncApi = pathname.startsWith('/api/device-sync')

  // Allow auth APIs
  if (isApiAuth) {
    return NextResponse.next()
  }

  // ✅ Allow device sync publicly
  if (isDeviceSyncApi) {
    return NextResponse.next()
  }

  const user = token ? verifyJWT(token) : null

  if (!user && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}