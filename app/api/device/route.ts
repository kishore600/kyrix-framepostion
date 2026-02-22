/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/device/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user:any = getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const device = await prisma.device.findFirst({
      where: { userId: user.userId }
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error('Get device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user: any = getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { deviceCode } = await request.json()

    // Check if device code is already used
    const existingDevice = await prisma.device.findUnique({
      where: { deviceCode }
    })

    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device code already in use' },
        { status: 400 }
      )
    }

    const device = await prisma.device.create({
      data: {
        deviceCode,
        userId: user.userId
      }
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error('Pair device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}