import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { generateDeviceCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { email, password, personalityMode } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const deviceId = generateDeviceCode()

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        personalityMode,
        deviceId
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      deviceId: user.deviceId
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}