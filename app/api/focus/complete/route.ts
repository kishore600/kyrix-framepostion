import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateStreak, calculateGrowthIndex } from '@/lib/growth-engine'

export async function POST(request: Request) {
  try {
    const { deviceId, duration, taskId } = await request.json()

    const user = await prisma.user.findFirst({
      where: { deviceId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Record focus session
    await prisma.focusSession.create({
      data: {
        userId: user.id,
        duration,
        taskId,
        completedAt: new Date()
      }
    })

    // Update user's total focus minutes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalFocusMinutes: {
          increment: duration
        }
      }
    })

    // Update streak - this will automatically:
    // - Increment streak if consecutive day
    // - Reset streak if day was missed
    // - Update stability score
    const streakData = await updateStreak(user.id)

    // Recalculate growth index
    const growthIndex = await calculateGrowthIndex(user.id)

    return NextResponse.json({ 
      success: true,
      streak: streakData,
      growthIndex 
    })
  } catch (error) {
    console.error('Focus completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}