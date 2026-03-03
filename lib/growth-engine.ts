import { prisma } from './prisma'
import { startOfDay, subDays, differenceInDays, format, isSameDay } from 'date-fns'

export async function updateStreak(userId: string) {
  try {
    const today = startOfDay(new Date())
    const yesterday = startOfDay(subDays(today, 1))
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        focusSessions: {
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) return

    const lastFocusDate = user.lastFocusTimestamp 
      ? startOfDay(new Date(user.lastFocusTimestamp))
      : null

    let newStreakCount = user.streakCount
    let newMissedDays = user.missedDays
    let stabilityScore = user.stabilityScore

    if (!lastFocusDate) {
      // First focus session ever
      newStreakCount = 1
      newMissedDays = 0
      stabilityScore = 50 // Starting point
    } else if (isSameDay(lastFocusDate, yesterday)) {
      // Consecutive day - streak continues
      newStreakCount = user.streakCount + 1
      // Stability increases with streak
      stabilityScore = Math.min(100, user.stabilityScore + 5)
    } else if (isSameDay(lastFocusDate, today)) {
      // Already logged today - no change
      stabilityScore = Math.min(100, user.stabilityScore + 2)
    } else {
      // Streak broken
      const daysMissed = differenceInDays(today, lastFocusDate) - 1
      newMissedDays = (user.missedDays || 0) + daysMissed
      newStreakCount = 1 // Reset to 1 for today
      // Stability decreases when streak breaks
      stabilityScore = Math.max(0, user.stabilityScore - (daysMissed * 10))
    }

    // Update user with new streak data
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreakCount,
        missedDays: newMissedDays,
        stabilityScore: Math.round(stabilityScore),
        lastFocusTimestamp: new Date()
      }
    })

    // Recalculate growth index after streak update
    await calculateGrowthIndex(userId)

    return {
      streakCount: newStreakCount,
      missedDays: newMissedDays,
      stabilityScore: Math.round(stabilityScore)
    }
  } catch (error) {
    console.error('Error updating streak:', error)
    throw error
  }
}

export async function calculateGrowthIndex(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        focusSessions: {
          orderBy: { completedAt: 'desc' },
          take: 30 // Last 30 sessions
        },
        tasks: {
          where: { 
            completed: true,
            completedAt: {
              gte: subDays(new Date(), 30) // Last 30 days
            }
          }
        }
      }
    })

    if (!user) return 0

    // Calculate consistency (40% of score)
    // Based on streak and stability
    const streakBonus = Math.min(user.streakCount / 30, 1) * 20 // Max 20% from streak
    const stabilityBonus = (user.stabilityScore / 100) * 20 // Max 20% from stability
    const consistencyScore = streakBonus + stabilityBonus

    // Calculate task completion (30% of score)
    const tasksCompleted = user.tasks.length
    const taskScore = Math.min(tasksCompleted / 20, 1) * 30 // 20 tasks = 30%

    // Calculate focus time (30% of score)
    const totalFocusMinutes = user.totalFocusMinutes || 0
    const focusScore = Math.min(totalFocusMinutes / (30 * 60), 1) * 30 // 30 hours = 30%

    // Calculate growth index (0-100)
    const growthIndex = Math.round(consistencyScore + taskScore + focusScore)

    // Update user's growth index
    await prisma.user.update({
      where: { id: userId },
      data: { growthIndex }
    })

    return growthIndex
  } catch (error) {
    console.error('Error calculating growth index:', error)
    return 0
  }
}

export async function getStreakHistory(userId: string, days: number = 30) {
  try {
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    })

    // Create a map of dates with focus sessions
    const streakMap = new Map()
    focusSessions.forEach(session => {
      const dateStr = format(session.completedAt, 'yyyy-MM-dd')
      streakMap.set(dateStr, true)
    })

    // Generate history array
    const history = []
    let currentDate = startDate
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      history.push({
        date: dateStr,
        active: streakMap.has(dateStr)
      })
      currentDate = subDays(currentDate, -1) // Add one day
    }

    return history
  } catch (error) {
    console.error('Error getting streak history:', error)
    return []
  }
}

export async function checkAndUpdateStreak(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return

    const today = startOfDay(new Date())
    const lastFocus = user.lastFocusTimestamp 
      ? startOfDay(new Date(user.lastFocusTimestamp))
      : null

    // If no activity today and last activity was before today, streak might be at risk
    if (lastFocus && lastFocus < today) {
      const daysSinceLastFocus = differenceInDays(today, lastFocus)
      
      if (daysSinceLastFocus > 1) {
        // Send notification or warning about streak
        console.log(`User ${userId} hasn't focused in ${daysSinceLastFocus} days`)
      }
    }
  } catch (error) {
    console.error('Error checking streak:', error)
  }
}