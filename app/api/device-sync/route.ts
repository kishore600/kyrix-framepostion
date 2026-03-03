import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { deviceId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Get today's tasks
    const today = new Date()
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        },
        completed: false
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ],
      take: 10 // Limit for ESP32 display
    })

    // Get user settings
    const settings = {
      focusLength: user.focusLength,
      breakDuration: user.breakDuration,
      autoRepeatCycles: user.autoRepeatCycles,
      streakTracking: user.streakTracking,
      autoStartBreaks: user.autoStartBreaks,
      personalityMode: user.personalityMode
    }

    // Get growth state
    const growthState = {
      growthIndex: user.growthIndex,
      streakCount: user.streakCount,
      stabilityScore: user.stabilityScore,
      lastFocusTimestamp: user.lastFocusTimestamp,
      missedDays: user.missedDays
    }

    // Update last sync time
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedEffort: t.estimatedEffort
      })),
      settings,
      growthState,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Device sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}