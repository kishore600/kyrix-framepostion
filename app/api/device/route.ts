import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateDeviceCode } from '@/lib/utils'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If user has no device ID, generate one
    if (!user.deviceId) {
      const newDeviceId = generateDeviceCode()
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          deviceId: newDeviceId,
          devicePairedAt: new Date()
        }
      })
      
      return NextResponse.json({
        deviceId: updatedUser.deviceId,
        pairedAt: updatedUser.devicePairedAt,
        mode: updatedUser.personalityMode
      })
    }

    return NextResponse.json({
      deviceId: user.deviceId,
      pairedAt: user.devicePairedAt,
      mode: user.personalityMode
    })
  } catch (error) {
    console.error('Fetch device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deviceCode } = await request.json()

    // Generate a new device ID (in production, validate deviceCode first)
    const newDeviceId = generateDeviceCode()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        deviceId: newDeviceId,
        devicePairedAt: new Date()
      }
    })

    return NextResponse.json({
      deviceId: updatedUser.deviceId,
      pairedAt: updatedUser.devicePairedAt,
      mode: updatedUser.personalityMode
    })
  } catch (error) {
    console.error('Pair device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}