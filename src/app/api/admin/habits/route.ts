import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    console.log('Admin users - token:', token);

    if (!token) {
      console.log('Admin users - No token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (token as any).sub || (token as any).userId || (token as any).user?.id;
    console.log('Admin users - userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { isUserAdmin, GetAllHabits } = await import('@/app/lib/admin');
    const admin = await isUserAdmin(Number(userId));
    console.log('Admin users - isAdmin:', admin);

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const habits = await GetAllHabits();
    return NextResponse.json({ habits });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
