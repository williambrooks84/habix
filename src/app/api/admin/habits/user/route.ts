import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requesterId = (token as any).sub || (token as any).userId || (token as any).user?.id
    if (!requesterId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { isUserAdmin, getHabitsByUserId, GetAllHabits } = await import('@/app/lib/admin')
    const admin = await isUserAdmin(Number(requesterId))
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const userIdParam = url.searchParams.get('userId')

    let habits
    if (userIdParam) {
      const parsed = Number(userIdParam)
      if (Number.isNaN(parsed) || parsed <= 0) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
      }

      habits = await getHabitsByUserId(parsed)
    } else {
      // Optional: if no userId is provided, return all habits
      habits = await GetAllHabits()
    }

    return NextResponse.json({ habits })
  } catch (err) {
    console.error('Admin habits by user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
