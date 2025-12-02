import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getHabitsByUser, countHabitRunsBetween } from '@/app/lib/habits';
import { startOfMonth, endOfMonth, startOfDay, addDays } from 'date-fns';
import { isScheduledOnDate, occurrencesBetween } from '@/app/lib/recurrence';

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: 'Authenticated user id not available' }, { status: 401 });

    const today = new Date();
    const habits = await getHabitsByUser(userId);

    const list = await Promise.all(habits.map(async (h) => {
      try {
      const freqType = h.frequencyType ?? 'daily';
      const config = h.frequencyConfig ?? {};
      const scheduledToday = isScheduledOnDate(freqType, config, today, h.periodStart ?? null, h.periodEnd ?? null);

      let periodFrom: Date;
      let periodTo: Date;
      if ((freqType as string).startsWith('monthly')) {
        periodFrom = startOfMonth(today);
        periodTo = endOfMonth(today);
      } else {
        const day = today.getDay();
        const diffToMon = (day + 6) % 7;
        periodFrom = startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - diffToMon));
        periodTo = startOfDay(new Date(periodFrom.getFullYear(), periodFrom.getMonth(), periodFrom.getDate()));
        periodTo = addDays(periodTo, 6);
      }

      let target = occurrencesBetween(freqType, config, periodFrom, periodTo, h.periodStart ?? null, h.periodEnd ?? null).length;
      let completed = await countHabitRunsBetween(h.id, periodFrom, periodTo).catch((e) => {
        console.error('countHabitRunsBetween error for habit', h.id, e);
        return 0;
      });
      const doneToday = (await countHabitRunsBetween(h.id, today, today).catch(() => 0)) > 0;
      if (freqType === 'daily') {
        target = 1;
        completed = doneToday ? 1 : 0;
      }

      return {
        id: h.id,
        name: h.name,
        subtitle: (h as any).subtitle ?? null,
        categoryName: (h as any).categoryName ?? null,
        color: (h as any).color ?? null,
        scheduledToday,
        target,
        completed,
        doneToday,
        frequencyType: h.frequencyType,
        frequencyConfig: h.frequencyConfig,
      };
      } catch (err) {
        console.error('Error computing habit progress for id', h.id, err);
        return {
          id: h.id,
          name: h.name,
          subtitle: (h as any).subtitle ?? null,
            scheduledToday: false,
            color: (h as any).color ?? null,
          target: 0,
          completed: 0,
          doneToday: false,
          frequencyType: h.frequencyType,
          frequencyConfig: h.frequencyConfig,
        };
      }
    }));

    return NextResponse.json({ habits: list });
  } catch (err) {
    console.error('GET /api/habits/today error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
