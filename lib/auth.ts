import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string, deviceId?: string) {
  return jwt.sign({ userId, deviceId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; deviceId?: string }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')?.value
  
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })
  
  return user
}

export async function getUserFromPayload(userId?: string) {
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user
}