import sql from './database';

export async function getAllBadges() {
  return await sql`
    SELECT id, name, description, points_required
    FROM badges
    ORDER BY points_required ASC
  `;
}

export async function getUserBadges(userId: number) {
  const rows = await sql`
    SELECT ub.badge_id as id, b.name, b.description, b.points_required, ub.awarded_at
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = ${userId}
    ORDER BY ub.awarded_at DESC
  `;
  return rows;
}

export async function awardBadgesForUser(userId: number) {

  const u = await sql`SELECT points FROM users WHERE id = ${userId} LIMIT 1`;
  const points = u[0]?.points ?? 0;

  const eligible = await sql`
    SELECT id, name, description, points_required
    FROM badges
    WHERE points_required <= ${points}
    ORDER BY points_required ASC
  `;

  const awarded: Array<{ id: string; name: string }> = [];

  let createNotification: ((userId: number, title: string, body?: string | null, data?: any) => Promise<any | boolean>) | null = null;
  try {
    ({ createNotification } = await import('./notifications') as any);
  } catch (e) {
    createNotification = null;
  }

  for (const b of eligible) {
    const exists = await sql`
      SELECT 1 FROM user_badges
      WHERE user_id = ${userId} AND badge_id = ${b.id}
      LIMIT 1
    `;
    if (!Array.isArray(exists) || exists.length === 0) {
      await sql`
        INSERT INTO user_badges (user_id, badge_id, awarded_at)
        VALUES (${userId}, ${b.id}, NOW())
      `;
      awarded.push({ id: b.id, name: b.name });

      try {
        if (createNotification) {
          const title = `Nouveau badge : ${b.name}`;
          const body = `Félicitations — vous avez obtenu le badge "${b.name}".`;
          const data = { badgeId: b.id };

          const notifResult = await createNotification(userId, title, body, data);
          console.log('badge notification insert result for user', userId, 'badge', b.id, ':', notifResult);
          if (!notifResult) {
            console.warn('Badge notification not created (returned null/false).');
          }
        }
      } catch (notifErr) {
        console.error('Failed to create badge notification:', notifErr);
      }
    }
  }

  return awarded;
}