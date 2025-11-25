import sql from './database'
import { Habit } from './definitions'

export async function getHabitsByUser(userId: number): Promise<Habit[]> {
  return (await sql`
    SELECT id, name, category_id, user_id, motivation, period_start, period_end, frequency_type, frequency_config, created_at, updated_at
    FROM habits
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
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