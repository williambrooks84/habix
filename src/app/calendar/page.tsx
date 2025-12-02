import { CalendarHijri } from "@/components/ui/calendar/calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { GET as getCalendarData } from "@/app/api/habits/calendar/route";
import { NextRequest } from "next/server";

async function getInitialCalendarData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  
  const months = [month - 1, month, month + 1].map((m) => {
    let y = year, mm = m;
    if (mm < 1) { mm = 12; y = year - 1; }
    else if (mm > 12) { mm = 1; y = year + 1; }
    return { y, mm };
  });

  const results = await Promise.all(
    months.map(async ({ y, mm }) => {
      try {
        const url = new URL(`http://localhost:3000/api/habits/calendar?year=${y}&month=${mm}`);
        const req = new NextRequest(url);
        const response = await getCalendarData(req);
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    })
  );

  const merged: Record<string, Array<any>> = {};
  results.forEach((json) => {
    if (!json?.days) return;
    Object.entries(json.days).forEach(([ymd, items]) => {
      merged[ymd] = (merged[ymd] ?? []).concat(items as any[]);
    });
  });

  return merged;
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const initialData = await getInitialCalendarData();

  return (
    <div className="flex flex-col px-6 gap-8">
      <h1 className="text-2xl font-semibold text-foreground">Calendrier</h1>
      <CalendarHijri initialData={initialData} />
    </div>
  );
}