// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { removeSessionToken } from '@/lib/auth'

export async function POST() {
  removeSessionToken()
  return NextResponse.json({ success: true })
}