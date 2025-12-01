import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getHabitsByUser, countHabitRunsBetween } from "@/app/lib/habits";
import { startOfDay, endOfMonth, startOfMonth, addDays } from "date-fns";

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
    const dates = (config?.dates ?? []).map((n: any) => Number(n)).filter((n: number) => !isNaN(n) && n >= 1 && n <= 31);
    if (!dates || dates.length === 0) return false;
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

function toLocalYmd(d?: Date | null) {
  if (!d) return null;
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
    const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
    const month = Number(url.searchParams.get("month")) || new Date().getMonth() + 1;

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) return NextResponse.json({ error: "Authenticated user id not available" }, { status: 401 });

    const from = startOfMonth(new Date(year, month - 1, 1));
    const to = endOfMonth(from);

    const habits = await getHabitsByUser(userId);

    const map: Record<string, Array<{ id: number; name: string; done: boolean; category?: string; color?: string | null }>> = {};

    for (const h of habits) {
      try {
        const freqType = h.frequencyType ?? "daily";
        const config = h.frequencyConfig ?? {};
        const occ = occurrencesBetween(freqType, config, from, to, h.periodStart ?? null, h.periodEnd ?? null);

        for (const d of occ) {
          const ymd = toLocalYmd(d);
          if (!ymd) continue;

          // count runs using local day bounds to avoid timezone shifts
          const { start: dayStart, end: dayEnd } = localDayBounds(d);
          const doneCount = await countHabitRunsBetween(h.id, dayStart, dayEnd).catch(() => 0);
          const done = doneCount > 0;

          if (!map[ymd]) map[ymd] = [];
          map[ymd].push({ id: h.id, name: h.name, done, category: (h as any).categoryName ?? null, color: (h as any).color ?? null });
        }
      } catch (err) {
        console.error("Error building calendar for habit", h.id, err);
      }
    }

    return NextResponse.json({ days: map });
  } catch (err) {
    console.error("GET /api/habits/calendar error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "edge";
