// lib/auth-edge.ts
import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; deviceId?: string }
  } catch {
    return null
  }
}

export async function generateToken(userId: string, deviceId?: string) {
  return await new SignJWT({ userId, deviceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}