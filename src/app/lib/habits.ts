import sql from './database'
import { Habit } from './definitions'

export async function getHabitsByUser(userId: number): Promise<Habit[]> {
  return (await sql`
    SELECT h.id, h.name, h.category_id, h.user_id, h.motivation, h.period_start, h.period_end, h.frequency_type, h.frequency_config, h.created_at, h.updated_at, c.name AS category_name
    FROM habits h
    LEFT JOIN categories c ON c.id = h.category_id
    WHERE h.user_id = ${userId}
    ORDER BY h.created_at DESC
  `).map((r:any) => ({
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    userId: r.user_id,
    motivation: r.motivation,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    frequencyType: r.frequency_type,
    frequencyConfig: r.frequency_config,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    categoryName: r.category_name,
  }))
}

export async function getHabitById(id: number): Promise<Habit | null> {
  const rows = await sql`
    SELECT id, name, category_id, user_id, motivation, period_start, period_end, frequency_type, frequency_config, created_at, updated_at
    FROM habits
    WHERE id = ${id}
    LIMIT 1
  `
  if (!rows || rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    userId: r.user_id,
    motivation: r.motivation,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    frequencyType: r.frequency_type,
    frequencyConfig: r.frequency_config,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function createHabit(input: {
  name: string;
  categoryId?: number | null;
  motivation?: string | null;
  userId?: number | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  frequencyType?: string | null;
  frequencyConfig?: string | null;
}): Promise<Habit> {
  const rows = await sql`
    INSERT INTO habits (name, category_id, user_id, motivation, period_start, period_end, frequency_type, frequency_config)
    VALUES (${input.name}, ${input.categoryId ?? null}, ${input.userId ?? null}, ${input.motivation ?? null}, ${input.periodStart ?? null}, ${input.periodEnd ?? null}, ${input.frequencyType ?? null}, ${input.frequencyConfig ?? null})
    RETURNING id, name, category_id, user_id, motivation, period_start, period_end, frequency_type, frequency_config, created_at, updated_at
  `
  const r = rows[0]
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    userId: r.user_id,
    motivation: r.motivation,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    frequencyType: r.frequency_type,
    frequencyConfig: r.frequency_config,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function deleteHabit(id: number): Promise<boolean> {
    const res = await sql`DELETE FROM habits WHERE id = ${id} RETURNING id`
    return res.length > 0
}

function toYMD(d: string | Date) {
  if (!d && d !== '') return null;
  // Accept YYYY-MM-DD strings directly (avoid Date parsing quirks)
  if (typeof d === 'string') {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(d)) return d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const date = d as Date;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function markHabitComplete(habitId: number, userId: number | null, runDate: string | Date, notes?: string | null) {
  const ymd = toYMD(runDate);
  if (!ymd) throw new Error('Invalid runDate');
  const rows = await sql`
    INSERT INTO habit_runs (habit_id, user_id, run_date, notes)
    VALUES (${habitId}, ${userId ?? null}, ${ymd}, ${notes ?? null})
    ON CONFLICT (habit_id, run_date)
    DO UPDATE SET notes = EXCLUDED.notes, completed_at = now()
    RETURNING id, habit_id, user_id, run_date, completed_at, notes, created_at
  `;
  return rows[0];
}

export async function deleteHabitCompletion(habitId: number, runDate: string | Date) {
  const ymd = toYMD(runDate);
  if (!ymd) throw new Error('Invalid runDate');
  const res = await sql`
    DELETE FROM habit_runs WHERE habit_id = ${habitId} AND run_date = ${ymd} RETURNING id
  `;
  return res.length > 0;
}

export async function countHabitRunsBetween(habitId: number, fromDate: string | Date, toDate: string | Date) {
  const f = toYMD(fromDate);
  const t = toYMD(toDate);
  if (!f || !t) throw new Error('Invalid date range');
  const rows = await sql`
    SELECT count(*)::int AS count FROM habit_runs WHERE habit_id = ${habitId} AND run_date BETWEEN ${f} AND ${t}
  `;
  return rows[0]?.count ?? 0;
}

export async function updateNextRun(habitId: number, nextRun: Date | string | null) {
  const val = nextRun ? (typeof nextRun === 'string' ? new Date(nextRun) : nextRun) : null;
  const rows = await sql`
    UPDATE habits SET next_run = ${val ?? null}, updated_at = NOW() WHERE id = ${habitId} RETURNING id
  `;
  return rows.length > 0;
}