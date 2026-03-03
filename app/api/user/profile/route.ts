import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get full user profile with aggregated data
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        personalityMode: true,
        growthIndex: true,
        streakCount: true,
        totalFocusMinutes: true,
        deviceId: true,
        devicePairedAt: true,
        focusLength: true,
        breakDuration: true,
        autoRepeatCycles: true,
        streakTracking: true,
        autoStartBreaks: true,
        createdAt: true
      }
    })

    // Get today's task stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTasks = await prisma.task.count({
      where: {
        userId: user.id,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const completedToday = await prisma.task.count({
      where: {
        userId: user.id,
        dueDate: {
          gte: today,
          lt: tomorrow
        },
        completed: true
      }
    })

    return NextResponse.json({
      ...profile,
      todayStats: {
        total: todayTasks,
        completed: completedToday
      }
    })
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}