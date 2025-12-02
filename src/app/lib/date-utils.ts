export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function toLocalYmd(d?: Date | null): string | null {
  if (!d) return null;
  return formatYMD(d);
}

export function localDayBounds(d: Date): { start: Date; end: Date } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}
