import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    console.log('Admin block - token:', token)

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requesterId = (token as any).sub || (token as any).userId || (token as any).user?.id
    if (!requesterId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { isUserAdmin, DeleteHabit } = await import('@/app/lib/admin')
    const admin = await isUserAdmin(Number(requesterId))
    console.log('Admin block - isAdmin:', admin)

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const targetHabitId = body?.habitId ?? body?.id

    if (!targetHabitId) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    let result = await DeleteHabit(Number(targetHabitId))

    if (!result) {
      return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete habit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
