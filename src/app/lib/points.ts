import sql from './database'
import { awardBadgesForUser } from './badges'

export async function createHabitRunAndAwardPoints(userId: number, habitId: number, runDate?: string) {
  const date = runDate ?? new Date().toISOString().slice(0, 10);
  try {
    let dayBonusAwarded = false;
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
        return { ok: true, alreadyExists: true, dayBonusAwarded: false };
      }

      await sql`INSERT INTO point_events (user_id, points) VALUES (${userId}, 1)`;
      await sql`UPDATE users SET points = points + 1 WHERE id = ${userId}`;

      const activeRow = await sql`SELECT COUNT(*)::int AS c FROM habits WHERE user_id = ${userId}`;
      const activeCount = activeRow[0]?.c ?? 0;

      if (activeCount > 0) {
        const completedRow = await sql`
          SELECT COUNT(DISTINCT habit_id)::int AS c
          FROM habit_runs
          WHERE user_id = ${userId} AND run_date = ${date}::date
        `;
        const completedCount = completedRow[0]?.c ?? 0;

        if (completedCount >= activeCount) {
          const alreadyRow = await sql`
            SELECT 1 FROM point_events
            WHERE user_id = ${userId} AND points = 5 AND (created_at::date) = ${date}::date
            LIMIT 1
          `;
          const already = Array.isArray(alreadyRow) && alreadyRow.length > 0;

          if (!already) {
            await sql`INSERT INTO point_events (user_id, points) VALUES (${userId}, 5)`;
            await sql`UPDATE users SET points = points + 5 WHERE id = ${userId}`;
            dayBonusAwarded = true;
          }
        }
      }

      await sql`COMMIT`;
      // After committing points updates, award any badges the user now qualifies for
      try {
        await awardBadgesForUser(userId);
      } catch (e) {
        console.error('awardBadgesForUser error', e);
      }
      return { ok: true, alreadyExists: false, dayBonusAwarded };
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
    await sql`INSERT INTO point_events (user_id, points) VALUES (${userId}, 1)`;
    await sql`UPDATE users SET points = points + 1 WHERE id = ${userId}`;

    // Award badges if user reached new thresholds
    try {
      await awardBadgesForUser(userId);
    } catch (e) {
      console.error('awardBadgesForUser error', e);
    }

    return { ok: true, dayBonusAwarded: false };
  } catch (err) {
    console.error('awardPointsForCompletion error', err);
    return { ok: false, error: String(err) };
  }
}

export async function removePointsForCompletion(userId: number, habitId: number, runDate?: string) {
  const date = runDate ?? new Date().toISOString().slice(0, 10);
  try {
    await sql`INSERT INTO point_events (user_id, points) VALUES (${userId}, -1)`;
    await sql`UPDATE users SET points = points - 1 WHERE id = ${userId}`;

    // Note: we only award badges when points increase. If you want to remove badges
    // when points drop below thresholds, implement a removal flow here.
    return { ok: true, dayBonusRemoved: false };
  } catch (err) {
    console.error('removePointsForCompletion error', err);
    return { ok: false, error: String(err) };
  }
}