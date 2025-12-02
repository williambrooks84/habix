import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { addDays, startOfDay } from "date-fns";

import { getHabitsByUser, countHabitRunsBetween } from "@/app/lib/habits";

const MIN_DAYS = 7;
const MAX_DAYS = 120;
const DEFAULT_DAYS = 30;

function clampDays(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return DEFAULT_DAYS;
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, value));
}

function normalizeConfig(input: any) {
  if (!input) return {};
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return {};
    }
  }
  return input;
}

function weekdayNums(days?: number[]) {
  return (days ?? []).map((d) => Number(d) % 7);
}

function isScheduledOnDate(
  freqType: string | null | undefined,
  config: any,
  date: Date,
  periodStart?: Date | null,
  periodEnd?: Date | null
) {
  const d = startOfDay(date);
  if (periodStart && d < startOfDay(periodStart)) return false;
  if (periodEnd && d > startOfDay(periodEnd)) return false;

  const ft = freqType ?? "daily";

  if (ft === "daily") {
    const interval = Number(config?.interval ?? 1) || 1;
    if (periodStart) {
      const diff = Math.floor(
        (d.getTime() - startOfDay(new Date(periodStart)).getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff >= 0 && diff % interval === 0;
    }
    return true;
  }

  if (ft === "weekly") {
    const day = config?.day;
    if (typeof day !== "number") return false;
    return d.getDay() === (day % 7);
  }

  if (ft === "weekly-multi") {
    const days = weekdayNums(config?.days);
    return days.includes(d.getDay());
  }

  if (ft === "monthly") {
    const dom = Number(config?.dayOfMonth);
    if (!dom) return false;
    return d.getDate() === dom;
  }

  if (ft === "monthly-multi") {
    const dates = (config?.dates ?? [])
      .map((n: any) => Number(n))
      .filter((n: number) => !Number.isNaN(n) && n >= 1 && n <= 31);
    if (!dates.length) return false;
    return dates.includes(d.getDate());
  }

  return false;
}

function occurrencesBetween(
  freqType: string | null | undefined,
  config: any,
  from: Date,
  to: Date,
  periodStart?: Date | null,
  periodEnd?: Date | null
) {
  const out: Date[] = [];
  const start = startOfDay(from);
  const end = startOfDay(to);
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) {
    if (isScheduledOnDate(freqType, config, cur, periodStart, periodEnd)) out.push(new Date(cur));
  }
  return out;
}

function toLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function localDayBounds(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const daysParam = Number(url.searchParams.get("days"));
    const days = clampDays(daysParam);

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: "Authenticated user id not available" }, { status: 401 });

    const endDate = startOfDay(new Date());
    const startDate = startOfDay(addDays(endDate, -(days - 1)));

    const habits = await getHabitsByUser(userId);

    const scheduledByDay = new Map<string, Set<number>>();

    for (const h of habits) {
      try {
        const freqType = h.frequencyType ?? "daily";
        const config = normalizeConfig(h.frequencyConfig) ?? {};
        const periodStart = h.periodStart ? new Date(h.periodStart) : null;
        const periodEnd = h.periodEnd ? new Date(h.periodEnd) : null;

        const occ = occurrencesBetween(freqType, config, startDate, endDate, periodStart, periodEnd);
        for (const d of occ) {
          const ymd = toLocalYmd(d);
          if (!ymd) continue;
          if (!scheduledByDay.has(ymd)) scheduledByDay.set(ymd, new Set());
          scheduledByDay.get(ymd)!.add(h.id);
        }
      } catch (err) {
        console.error("Error computing occurrences for habit", h.id, err);
      }
    }

    if (!habits.length) {
      const emptyRange = Array.from({ length: days }).map((_, idx) => {
        const day = addDays(startDate, idx);
        return {
          date: toLocalYmd(day),
          scheduled: 0,
          completed: 0,
          percentage: 0,
        };
      });
      return NextResponse.json({ days: emptyRange });
    }

    const completionCounts = new Map<string, number>();
    for (const h of habits) {
      try {
        const freqType = h.frequencyType ?? "daily";
        const config = normalizeConfig(h.frequencyConfig) ?? {};
        const periodStart = h.periodStart ? new Date(h.periodStart) : null;
        const periodEnd = h.periodEnd ? new Date(h.periodEnd) : null;

        const occ = occurrencesBetween(freqType, config, startDate, endDate, periodStart, periodEnd);
        for (const d of occ) {
          const ymd = toLocalYmd(d);
          if (!ymd) continue;
          const { start: dayStart, end: dayEnd } = localDayBounds(d);
          const runs = await countHabitRunsBetween(h.id, dayStart, dayEnd).catch(() => 0);
          if (runs > 0) {
            completionCounts.set(ymd, (completionCounts.get(ymd) ?? 0) + 1);
          }
        }
      } catch (err) {
        console.error("Error counting completions for habit", h.id, err);
      }
    }

    const daysData = Array.from({ length: days }).map((_, idx) => {
      const date = addDays(startDate, idx);
      const key = toLocalYmd(date);
      const scheduledCount = scheduledByDay.get(key)?.size ?? 0;
      const completedCount = completionCounts.get(key) ?? 0;
      const percentage = scheduledCount > 0 ? Number(((completedCount / scheduledCount) * 100).toFixed(1)) : 0;
      return {
        date: key,
        scheduled: scheduledCount,
        completed: completedCount,
        percentage,
      };
    });

    return NextResponse.json({ days: daysData });
  } catch (err) {
    console.error("GET /api/habits/progress error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "edge";
