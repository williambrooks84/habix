import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { getNotificationsForUser } from '@/app/lib/notifications'

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const userId = Number((token as any).sub || (token as any).userId || (token as any).user?.id)
    
    const notifications = await getNotificationsForUser(userId, { limit: 50 })
    
    return NextResponse.json({ notifications })
  } catch (err) {
    console.error('GET /api/notifications error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
