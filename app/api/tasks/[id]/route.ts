import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { addDays, setHours, setMinutes } from 'date-fns'

function getNextDueDate(rule: any, currentDate: Date) {
  switch (rule.frequency) {
    case 'DAILY':
      return addDays(currentDate, 1)
    case 'WEEKDAYS': {
      const next = addDays(currentDate, 1)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1)
      }
      return next
    }
    case 'WEEKLY': {
      const next = addDays(currentDate, 1)
      while (next.getDay() !== rule.dayOfWeek) {
        next.setDate(next.getDate() + 1)
      }
      return next
    }
    case 'MONTHLY': {
      const next = new Date(currentDate)
      next.setMonth(next.getMonth() + 1)
      next.setDate(rule.dayOfMonth)
      return next
    }
    case 'CUSTOM':
      return addDays(currentDate, rule.interval || 1)
    default:
      return null
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const { id } = await params
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { recurringRule: true }
    })

    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Handle task completion
    if (body.completed === true && task.isRecurring && task.recurringRule) {
      // Create next instance of recurring task
      const nextDueDate = getNextDueDate(task.recurringRule, new Date())
      
      if (nextDueDate) {
        await prisma.task.create({
          data: {
            title: task.title,
            category: task.category,
            priority: task.priority,
            dueDate: nextDueDate,
            estimatedEffort: task.estimatedEffort,
            isRecurring: true,
            userId: user.id,
            recurringRule: {
              create: {
                frequency: task.recurringRule.frequency,
                interval: task.recurringRule.interval,
                dayOfWeek: task.recurringRule.dayOfWeek,
                dayOfMonth: task.recurringRule.dayOfMonth
              }
            }
          }
        })
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        ...(body.completed && { completedAt: new Date() })
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const { id } = await params
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also add GET handler for single task if needed
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { recurringRule: true }
    })

    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Fetch task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}