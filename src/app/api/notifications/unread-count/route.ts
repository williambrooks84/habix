import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { countUnread } from '@/app/lib/notifications'

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const userId = Number((token as any).sub || (token as any).userId || (token as any).user?.id)
    
    const count = await countUnread(userId)
    
    return NextResponse.json({ count })
  } catch (err) {
    console.error('GET /api/notifications/unread-count error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
