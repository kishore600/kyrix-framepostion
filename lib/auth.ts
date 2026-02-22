// lib/auth.ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Fix these async functions
export async function getSessionToken() {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function removeSessionToken() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

export async function getCurrentUser() {
  const token = await getSessionToken()
  if (!token) return null
  return verifyJWT(token)
}

export function requireAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  const user = verifyJWT(token)
  return user
}