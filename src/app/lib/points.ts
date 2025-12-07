import sql from './database'
import { awardBadgesForUser } from './badges'

export async function createHabitRunAndAwardPoints(userId: number, habitId: number, runDate?: string) {
  const date = runDate ?? new Date().toISOString().slice(0, 10);
  try {
    // daily bonus removed — no longer tracking dayBonusAwarded
    await sql`BEGIN`;

    try {
      const inserted = await sql`
        INSERT INTO habit_runs (habit_id, user_id, run_date, completed_at)
        VALUES (${habitId}, ${userId}, ${date}::date, NOW())
        ON CONFLICT (habit_id, run_date) DO NOTHING
        RETURNING id
      `;

      if (!inserted || inserted.length === 0) {
        await sql`ROLLBACK`;
        return { ok: true, alreadyExists: true };
      }

      await sql`UPDATE users SET points = points + 1 WHERE id = ${userId}`;

      await sql`COMMIT`;
      let awardedBadges = [] as Array<{ id: string; name: string }>;
      try {
        awardedBadges = await awardBadgesForUser(userId);
      } catch (e) {
        console.error('awardBadgesForUser error', e);
      }
      return { ok: true, alreadyExists: false, awardedBadges };
    } catch (innerErr) {
      await sql`ROLLBACK`;
      throw innerErr;
    }
  } catch (err) {
    console.error('createHabitRunAndAwardPoints error', err);
    return { ok: false, error: String(err) };
  }
}

export async function getUserPoints(userId: number) {
  const rows = await sql`SELECT points FROM users WHERE id = ${userId} LIMIT 1`;
  return rows[0]?.points ?? 0;
}

export async function awardPointsForCompletion(userId: number, habitId: number, runDate?: string) {
  const date = runDate ?? new Date().toISOString().slice(0, 10);
  try {
    await sql`UPDATE users SET points = points + 1 WHERE id = ${userId}`;

    try {
      const awardedBadges = await awardBadgesForUser(userId);
      return { ok: true, awardedBadges };
    } catch (e) {
      console.error('awardBadgesForUser error', e);
      return { ok: true, awardedBadges: [] };
    }
  } catch (err) {
    console.error('awardPointsForCompletion error', err);
    return { ok: false, error: String(err) };
  }
}

export async function removePointsForCompletion(userId: number, habitId: number, runDate?: string) {
  const date = runDate ?? new Date().toISOString().slice(0, 10);
  try {
    await sql`UPDATE users SET points = points - 1 WHERE id = ${userId}`;

    return { ok: true };
  } catch (err) {
    console.error('removePointsForCompletion error', err);
    return { ok: false, error: String(err) };
  }
}