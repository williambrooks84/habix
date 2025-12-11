'use server'

import sql from '@/app/lib/database'

export async function isUserAdmin(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `
    return result.length > 0 && result[0].is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function makeUserAdmin(userId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET is_admin = true WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error('Error making user admin:', error)
    return false
  }
}

export async function removeUserAdmin(userId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET is_admin = false WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error('Error removing admin status:', error)
    return false
  }
}

export async function getAllAdmins() {
  try {
    const result = await sql`
      SELECT id, email, first_name, last_name, created_at 
      FROM users 
      WHERE is_admin = true
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error('Error fetching admins:', error)
    return []
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, first_name, last_name, is_admin, is_blocked, points, created_at
      FROM users
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function blockUser(userId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET is_blocked = true WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error('Error blocking user:', error)
    return false
  }
}

export async function unblockUser(userId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET is_blocked = false WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error('Error unblocking user:', error)
    return false
  } 
}

export async function GetAllHabits() {
  try {
    const result = await sql`
      SELECT h.*, 
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        c.name AS category
      FROM habits h
      LEFT JOIN users u ON h.user_id = u.id
      LEFT JOIN categories c ON h.category_id = c.id
    `;
    return result;
  } catch (error) {
    console.error('Error fetching all habits:', error);
    return false;
  }
}

export async function DeleteHabit(habitId: number): Promise<boolean> {
  try {
    await sql`
      DELETE FROM habits WHERE id = ${habitId}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting habit:', error);
    return false;
  } 
}