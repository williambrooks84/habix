
import { NextResponse } from 'next/server';
import { getCompletedDaysForHabit } from '@/app/lib/habits';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get('habitId');
  if (!habitId) {
    return NextResponse.json({ error: 'Missing habitId' }, { status: 400 });
  }

  try {
    const data = await getCompletedDaysForHabit(Number(habitId));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}
