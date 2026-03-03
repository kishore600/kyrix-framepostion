import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { addDays, addWeeks, addMonths, setDate, getDay } from 'date-fns'

function getNextRecurringDate(task: any, fromDate: Date = new Date()): Date | null {
  const baseDate = new Date(task.dueDate)
  
  switch (task.recurrenceType) {
    case 'DAILY':
      return addDays(fromDate, 1)
    
    case 'WEEKDAYS': {
      let nextDate = addDays(fromDate, 1)
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate = addDays(nextDate, 1)
      }
      return nextDate
    }
    
    case 'WEEKLY': {
      const targetDay = task.recurrenceDayOfWeek
      let nextDate = addDays(fromDate, 1)
      while (getDay(nextDate) !== targetDay) {
        nextDate = addDays(nextDate, 1)
      }
      return nextDate
    }
    
    case 'MONTHLY': {
      const targetDay = Math.min(task.recurrenceDayOfMonth, 28) // Avoid invalid dates
      let nextDate = addMonths(fromDate, 1)
      nextDate = setDate(nextDate, targetDay)
      return nextDate
    }
    
    case 'CUSTOM':
      return addDays(fromDate, task.recurrenceInterval || 1)
    
    default:
      return null
  }
}

// GET handler - Fetch all tasks
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: { 
        userId: user.id 
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Fetch tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST handler - Create a new task
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      category, 
      priority, 
      dueDate, 
      estimatedEffort,
      isRecurring,
      recurrenceType,
      recurrenceInterval,
      recurrenceDayOfWeek,
      recurrenceDayOfMonth,
      recurrenceEndDate,
      recurrenceCount
    } = body

    // Validate required fields
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      )
    }

    // Parse dates properly
    const parsedDueDate = new Date(dueDate)
    if (isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid due date format' },
        { status: 400 }
      )
    }

    // Parse recurrence end date if provided and valid
    let parsedRecurrenceEndDate = null
    if (recurrenceEndDate && recurrenceEndDate.trim() !== '') {
      parsedRecurrenceEndDate = new Date(recurrenceEndDate)
      if (isNaN(parsedRecurrenceEndDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid recurrence end date format' },
          { status: 400 }
        )
      }
    }

    // Create the parent task
    const task = await prisma.task.create({
      data: {
        title,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        dueDate: parsedDueDate,
        estimatedEffort: estimatedEffort ? parseInt(estimatedEffort) : 25,
        isRecurring: isRecurring || false,
        recurrenceType: isRecurring ? recurrenceType : null,
        recurrenceInterval: isRecurring && recurrenceInterval ? parseInt(recurrenceInterval) : null,
        recurrenceDayOfWeek: isRecurring && recurrenceDayOfWeek ? parseInt(recurrenceDayOfWeek) : null,
        recurrenceDayOfMonth: isRecurring && recurrenceDayOfMonth ? parseInt(recurrenceDayOfMonth) : null,
        recurrenceEndDate: parsedRecurrenceEndDate,
        recurrenceCount: isRecurring && recurrenceCount ? parseInt(recurrenceCount) : null,
        userId: user.id
      }
    })

    // If it's recurring and has an end date or count, pre-create instances
    if (isRecurring && (parsedRecurrenceEndDate || recurrenceCount)) {
      const instances = []
      let currentDate = parsedDueDate
      let count = 1
      const maxCount = recurrenceCount ? parseInt(recurrenceCount) : 100
      
      while (count < maxCount) {
        const nextDate = getNextRecurringDate({
          ...task,
          recurrenceType,
          recurrenceInterval: recurrenceInterval ? parseInt(recurrenceInterval) : null,
          recurrenceDayOfWeek: recurrenceDayOfWeek ? parseInt(recurrenceDayOfWeek) : null,
          recurrenceDayOfMonth: recurrenceDayOfMonth ? parseInt(recurrenceDayOfMonth) : null
        }, currentDate)

        if (!nextDate) break
        if (parsedRecurrenceEndDate && nextDate > parsedRecurrenceEndDate) break

        instances.push({
          title,
          category: category || 'OTHER',
          priority: priority || 'MEDIUM',
          dueDate: nextDate,
          estimatedEffort: estimatedEffort ? parseInt(estimatedEffort) : 25,
          isRecurring: true,
          recurrenceType,
          recurrenceInterval: recurrenceInterval ? parseInt(recurrenceInterval) : null,
          recurrenceDayOfWeek: recurrenceDayOfWeek ? parseInt(recurrenceDayOfWeek) : null,
          recurrenceDayOfMonth: recurrenceDayOfMonth ? parseInt(recurrenceDayOfMonth) : null,
          recurrenceEndDate: parsedRecurrenceEndDate,
          recurrenceCount,
          userId: user.id,
          parentTaskId: task.id
        })

        currentDate = nextDate
        count++
      }

      if (instances.length > 0) {
        await prisma.task.createMany({
          data: instances
        })
      }
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}