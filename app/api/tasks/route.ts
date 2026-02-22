// app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching tasks for user:', user.userId)

    const tasks = await prisma.task.findMany({
      where: { userId: user.userId },
      orderBy: { date: 'asc' }
    })

    console.log(`Found ${tasks.length} tasks`)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    console.log('Current user from token:', user)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - No user found' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)

    const { title, date, time, category, priority } = body

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['WORK', 'STUDY', 'PERSONAL', 'OTHER']
    const taskCategory = validCategories.includes(category) ? category : 'OTHER'

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH']
    const taskPriority = validPriorities.includes(priority) ? priority : 'MEDIUM'

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!dbUser) {
      console.error('User not found in database:', user.userId)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    console.log('Found user in database:', dbUser.id)

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        date: new Date(date),
        time: time || null,
        category: taskCategory,
        priority: taskPriority,
        completed: false,
        userId: user.userId
      }
    })

    console.log('Task created successfully:', task)
    return NextResponse.json(task)
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}