import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { subDays, format, differenceInDays } from 'date-fns'
import { getStreakHistory } from '@/lib/growth-engine'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get streak history for last 30 days
    const streakCalendar = await getStreakHistory(user.id, 30)

    // Calculate longest streak
    let longestStreak = 0
    let currentStreak = 0
    
    streakCalendar.forEach(day => {
      if (day.active) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    // Get weekly focus data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      return format(date, 'yyyy-MM-dd')
    }).reverse()

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: subDays(new Date(), 7)
        }
      }
    })

    const weeklyFocus = last7Days.map(date => {
      const daySessions = focusSessions.filter(s => 
        format(new Date(s.completedAt), 'yyyy-MM-dd') === date
      )
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0)
      return {
        date,
        minutes: totalMinutes,
        sessions: daySessions.length
      }
    })

    // Get task completion ratio
    const totalTasks = await prisma.task.count({
      where: { userId: user.id }
    })

    const completedTasks = await prisma.task.count({
      where: {
        userId: user.id,
        completed: true
      }
    })

    const completionRatio = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0

    // Get pressure heat map (tasks per day for last 7 days)
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: subDays(new Date(), 7),
          lte: new Date()
        }
      }
    })

    const pressureMap = last7Days.map(date => {
      const dayTasks = tasks.filter(t => 
        format(new Date(t.dueDate), 'yyyy-MM-dd') === date
      )
      const overloaded = dayTasks.length > 5
      return {
        date,
        count: dayTasks.length,
        overloaded
      }
    })

    // Get growth index history (simulated with slight variations)
    const growthHistory = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      const variation = Math.floor(Math.random() * 5) - 2 // -2 to +2 variation
      const index = Math.min(100, Math.max(0, user.growthIndex + variation))
      return {
        date: format(date, 'yyyy-MM-dd'),
        index
      }
    }).reverse()

    // Calculate streak milestones
    const streakMilestones = [7, 14, 21, 30, 60, 90, 365]
    const nextMilestone = streakMilestones.find(m => m > (user.streakCount || 0))
    const daysToNextMilestone = nextMilestone ? nextMilestone - (user.streakCount || 0) : 0

    return NextResponse.json({
      // Core metrics
      currentStreak: user.streakCount || 0,
      longestStreak,
      growthIndex: user.growthIndex || 0,
      stabilityScore: user.stabilityScore || 0,
      missedDays: user.missedDays || 0,
      
      // Streak details
      streakCalendar,
      nextMilestone,
      daysToNextMilestone,
      
      // Charts data
      weeklyFocus,
      completionRatio,
      pressureMap,
      growthHistory,
      
      // Additional stats
      totalFocusMinutes: user.totalFocusMinutes || 0,
      totalSessions: focusSessions.length,
      averageSessionLength: focusSessions.length > 0 
        ? Math.round(focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length) 
        : 0
    })
  } catch (error) {
    console.error('Fetch growth data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}