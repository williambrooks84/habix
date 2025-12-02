import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getHabitsByUser, countHabitRunsBetween } from "@/app/lib/habits";
import { startOfDay, endOfMonth, startOfMonth, addDays } from "date-fns";
import { isScheduledOnDate, occurrencesBetween } from "@/app/lib/recurrence";
import { toLocalYmd, localDayBounds } from "@/app/lib/date-utils";

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

    const map: Record<string, Array<{ id: number; name: string; done: boolean; category?: string | null; color?: string | null }>> = {};

    for (const h of habits) {
      try {
        const freqType = h.frequencyType ?? "daily";
        const config = h.frequencyConfig ?? {};
        const occ = occurrencesBetween(freqType, config, from, to, h.periodStart ?? null, h.periodEnd ?? null);

        for (const d of occ) {
          const ymd = toLocalYmd(d);
          if (!ymd) continue;

          const { start: dayStart, end: dayEnd } = localDayBounds(d);
          const doneCount = await countHabitRunsBetween(h.id, dayStart, dayEnd).catch(() => 0);
          const done = doneCount > 0;

          if (!map[ymd]) map[ymd] = [];
          map[ymd].push({ id: h.id, name: h.name, done, category: (h as any).categoryName ?? null, color: h.color ?? null });
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
