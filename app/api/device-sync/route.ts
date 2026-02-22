/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/device-sync/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, isToday, isWithinInterval, subDays } from 'date-fns'

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

    // Find device
    const device = await prisma.device.findUnique({
      where: { deviceCode: deviceId },
      include: { user: true }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Get user's tasks based on device mode
    const tasks = await prisma.task.findMany({
      where: {
        userId: device.userId,
        completed: false
      }
    })

    // Filter tasks based on mode
    let filteredTasks = []
    const now = new Date()

    if (device.mode === 'TODAY') {
      filteredTasks = tasks
        .filter((task:any) => isToday(task.date))
        .map((task:any) => ({
          time: task.time || '00:00',
          title: task.title
        }))
        .sort((a:any, b:any) => a.time.localeCompare(b.time))
    } else {
      // Week view - next 7 days
      const weekFromNow = subDays(now, -7)
      filteredTasks = tasks
        .filter((task: any) => 
          isWithinInterval(task.date, { start: now, end: weekFromNow })
        )
        .map((task:any) => ({
          date: format(task.date, 'yyyy-MM-dd'),
          time: task.time || '00:00',
          title: task.title
        }))
    }

    // Update last sync
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}