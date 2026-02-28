// app/api/device-sync/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, isToday, isWithinInterval, addDays } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    const device = await prisma.device.findUnique({
      where: { deviceCode: deviceId },
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    const now = new Date()
    const weekFromNow = addDays(now, 7)

    let tasks = await prisma.task.findMany({
      where: {
        userId: device.userId,
        completed: false
      },
      orderBy: { date: 'asc' }
    })

    let filteredTasks = []

    if (device.mode === 'TODAY') {
      filteredTasks = tasks.filter(task => isToday(task.date))
    } else {
      filteredTasks = tasks.filter(task =>
        isWithinInterval(task.date, { start: now, end: weekFromNow })
      )
    }

    const responseTasks = filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      date: format(task.date, 'yyyy-MM-dd'),
      category: task.category,
      priority: task.priority,
      completed: task.completed,
    }))

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSync: new Date() }
    })

    return NextResponse.json({
      mode: device.mode.toLowerCase(),
      tasks: responseTasks
    })

  } catch (error) {
    console.error('Device sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}