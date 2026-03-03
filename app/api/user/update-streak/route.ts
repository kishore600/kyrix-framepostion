import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { updateStreak, calculateGrowthIndex } from '@/lib/growth-engine'
import { startOfDay, subDays, isSameDay } from 'date-fns'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's completed tasks
    const today = startOfDay(new Date())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const completedToday = await prisma.task.count({
      where: {
        userId: user.id,
        completed: true,
        completedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Only update streak if at least one task was completed today
    if (completedToday > 0) {
      // Update streak
      const streakData:any = await updateStreak(user.id)
      
      // Recalculate growth index
      const growthIndex = await calculateGrowthIndex(user.id)

      // Check if streak increased
      const previousStreak = user.streakCount
      const streakIncreased = streakData?.streakCount > previousStreak

      return NextResponse.json({
        ...streakData,
        growthIndex,
        streakIncreased,
        completedToday
      })
    }

    return NextResponse.json({
      streakCount: user.streakCount,
      stabilityScore: user.stabilityScore,
      growthIndex: user.growthIndex,
      streakIncreased: false,
      completedToday
    })

  } catch (error) {
    console.error('Update streak error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}