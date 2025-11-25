import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getHabitsByUser, countHabitRunsBetween } from '@/app/lib/habits';
import { startOfMonth, endOfMonth, startOfDay, addDays } from 'date-fns';

function weekdayNums(days?: number[]) {
  return (days ?? []).map((d) => Number(d) % 7);
}

function isScheduledOnDate(freqType: string | null | undefined, config: any, date: Date, periodStart?: Date | null, periodEnd?: Date | null) {
  const d = startOfDay(date);
  if (periodStart && d < startOfDay(periodStart)) return false;
  if (periodEnd && d > startOfDay(periodEnd)) return false;

  const ft = freqType ?? 'daily';
  if (ft === 'daily') {
    const interval = Number(config?.interval ?? 1) || 1;
    if (periodStart) {
      const diff = Math.floor((d.getTime() - startOfDay(new Date(periodStart)).getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff % interval === 0;
    }
    return true;
  }

  if (ft === 'weekly') {
    const day = config?.day;
    if (typeof day !== 'number') return false;
    return d.getDay() === (day % 7);
  }

  if (ft === 'weekly-multi') {
    const days = weekdayNums(config?.days);
    return days.includes(d.getDay());
  }

  if (ft === 'monthly') {
    const dom = Number(config?.dayOfMonth);
    if (!dom) return false;
    return d.getDate() === dom;
  }

  return false;
}

function occurrencesBetween(freqType: string | null | undefined, config: any, from: Date, to: Date, periodStart?: Date | null, periodEnd?: Date | null) {
  const out: Date[] = [];
  const start = startOfDay(from);
  const end = startOfDay(to);
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) {
    if (isScheduledOnDate(freqType, config, cur, periodStart, periodEnd)) out.push(new Date(cur));
  }
  return out;
}

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

      // choose period range (compute week start Monday..Sunday manually)
      let periodFrom: Date;
      let periodTo: Date;
      if ((freqType as string).startsWith('monthly')) {
        periodFrom = startOfMonth(today);
        periodTo = endOfMonth(today);
      } else {
        const day = today.getDay(); // 0 (Sun) .. 6
        const diffToMon = (day + 6) % 7; // days since Monday
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

      // For daily habits in the Today widget, show a per-day target (1) and completed as today's completion
      if (freqType === 'daily') {
        target = 1;
        completed = doneToday ? 1 : 0;
      }

      return {
        id: h.id,
        name: h.name,
        subtitle: (h as any).subtitle ?? null,
        categoryName: (h as any).categoryName ?? null,
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
