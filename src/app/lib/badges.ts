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
  // Fetch current user points
  const u = await sql`SELECT points FROM users WHERE id = ${userId} LIMIT 1`;
  const points = u[0]?.points ?? 0;

  // Fetch badges that the user qualifies for
  const eligible = await sql`
    SELECT id, name, description, points_required
    FROM badges
    WHERE points_required <= ${points}
    ORDER BY points_required ASC
  `;

  const awarded: Array<{ id: string; name: string }> = [];

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
    }
  }

  return awarded;
}