import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { markHabitComplete, deleteHabitCompletion, getHabitById } from '@/app/lib/habits';
import { awardPointsForCompletion, removePointsForCompletion } from '@/app/lib/points';

export async function POST(request: Request, context: any) {
  const { params } = context as { params?: any };
  const resolvedParams = await params;
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: 'Authenticated user id not available' }, { status: 401 });

    const habitId = Number(resolvedParams.id);
    if (!habitId) return NextResponse.json({ error: 'Missing habit id' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const runDate = body?.runDate ?? null;
    const notes = body?.notes ?? null;

    const habit = await getHabitById(habitId);
    if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const completion = await markHabitComplete(habitId, userId, runDate ?? new Date(), notes);
    
    const pointsResult = await awardPointsForCompletion(userId, habitId, runDate);

    return NextResponse.json({ success: true, completion, pointsAwarded: pointsResult });
  } catch (err) {
    console.error('Complete habit error:', err);
    const message = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production' ? { error: 'Internal server error' } : { error: 'Internal server error', details: message };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { params } = context as { params?: any };
  const resolvedParams = await params;
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: 'Authenticated user id not available' }, { status: 401 });

    const habitId = Number(resolvedParams.id);
    if (!habitId) return NextResponse.json({ error: 'Missing habit id' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const runDate = body?.runDate ?? null;
    if (!runDate) return NextResponse.json({ error: 'Missing runDate' }, { status: 400 });

    const habit = await getHabitById(habitId);
    if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const ok = await deleteHabitCompletion(habitId, runDate);
    
    if (ok) {
      await removePointsForCompletion(userId, habitId, runDate);
    }
    
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('Delete completion error:', err);
    const message = err instanceof Error ? err.message : String(err);
    const body = process.env.NODE_ENV === 'production' ? { error: 'Internal server error' } : { error: 'Internal server error', details: message };
    return NextResponse.json(body, { status: 500 });
  }
}