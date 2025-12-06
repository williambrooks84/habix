import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getUserBadges } from '@/app/lib/badges'

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const tokenUser: any = (token as any).user ?? (token as any)
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null
    if (!userId) return NextResponse.json({ error: 'Authenticated user id not available' }, { status: 401 })

    const rows = await getUserBadges(userId)
    return NextResponse.json({ badges: rows })
  } catch (err) {
    console.error('Failed to fetch user badges', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
