import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      focusLength: user.focusLength,
      breakDuration: user.breakDuration,
      autoRepeatCycles: user.autoRepeatCycles,
      streakTracking: user.streakTracking,
      autoStartBreaks: user.autoStartBreaks,
      personalityMode: user.personalityMode
    })
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: body
    })

    return NextResponse.json({
      focusLength: updatedUser.focusLength,
      breakDuration: updatedUser.breakDuration,
      autoRepeatCycles: updatedUser.autoRepeatCycles,
      streakTracking: updatedUser.streakTracking,
      autoStartBreaks: updatedUser.autoStartBreaks,
      personalityMode: updatedUser.personalityMode
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}