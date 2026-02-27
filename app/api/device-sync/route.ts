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

    const tasks = await prisma.task.findMany({
      where: {
        userId: device.userId,
        completed: false
      }
    })

    let filteredTasks = []
    const now = new Date()

    if (device.mode === 'TODAY') {
      filteredTasks = tasks
        .filter(task => isToday(task.date))
        .map(task => ({
          time: task.time || '00:00',
          title: task.title
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
    } else {
      const weekFromNow = addDays(now, 7)

      filteredTasks = tasks
        .filter(task =>
          isWithinInterval(task.date, { start: now, end: weekFromNow })
        )
        .map(task => ({
          date: format(task.date, 'yyyy-MM-dd'),
          time: task.time || '00:00',
          title: task.title
        }))
    }

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSync: new Date() }
    })

    return NextResponse.json({
      mode: device.mode.toLowerCase(),
      tasks: filteredTasks
    })

  } catch (error) {
    console.error('Device sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}