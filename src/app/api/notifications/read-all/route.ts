import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { markAllRead } from '@/app/lib/notifications'

export async function PATCH(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const userId = Number((token as any).sub || (token as any).userId || (token as any).user?.id)
    
    const success = await markAllRead(userId)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/notifications/read-all error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
