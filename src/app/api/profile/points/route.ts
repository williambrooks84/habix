import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getUserPoints } from '@/app/lib/points';

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: 'Authenticated user id not available' }, { status: 401 });

    const points = await getUserPoints(userId);

    return NextResponse.json({ points });
  } catch (err) {
    console.error('Get points error:', err);
    const message = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production' ? { error: 'Internal server error' } : { error: 'Internal server error', details: message };
    return NextResponse.json(body, { status: 500 });
  }
}
