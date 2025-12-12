import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { markAsRead } from '@/app/lib/notifications'

export async function PATCH(request: Request, context: any) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const params = await context.params
    const notificationId = Number(params.id)
    
    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }
    
    const success = await markAsRead(notificationId)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/notifications/[id]/read error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
