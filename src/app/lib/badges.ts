import sql from './database';

export async function getAllBadges() {
  return await sql`
    SELECT id, name, description, points_required
    FROM badges
    ORDER BY points_required ASC
  `;
}