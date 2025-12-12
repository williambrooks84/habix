'use server'

import sql from '@/app/lib/database'
import { Notification } from './definitions'

export async function createNotification(
  userId: number,
  title: string,
  body?: string | null,
  data?: any
): Promise<any | null> {
  try {
    const sqlText = `INSERT INTO notifications (user_id, title, body, data)
      VALUES ($1, $2, $3, $4::jsonb)
      RETURNING *`
    const params = [userId, title, body ?? null, data ? JSON.stringify(data) : null]

    const res: any = await (sql as any).query(sqlText, params)
    const rows = Array.isArray(res) ? res : res?.rows ?? []
    const row = rows?.[0] ?? null

    console.debug('createNotification inserted for user', userId, { title, body, data, row })
    return row
  } catch (err) {
    console.error('createNotification error:', err)
    return null
  }
}

export async function getNotificationsForUser(
  userId: number,
  opts: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
): Promise<Notification[]> {
  const { unreadOnly = false, limit = 50, offset = 0 } = opts
  try {
    if (unreadOnly) {
      const rows = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId} AND read = false
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      return rows as Notification[]
    } else {
      const rows = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      return rows as Notification[]
    }
  } catch (err) {
    console.error('getNotificationsForUser error:', err)
    return []
  }
}

export async function markAsRead(notificationId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE notifications SET read = true WHERE id = ${notificationId}
    `
    return true
  } catch (err) {
    console.error('markAsRead error:', err)
    return false
  }
}

export async function markAllRead(userId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE notifications SET read = true WHERE user_id = ${userId} AND read = false
    `
    return true
  } catch (err) {
    console.error('markAllRead error:', err)
    return false
  }
}

export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    await sql`
      DELETE FROM notifications WHERE id = ${notificationId}
    `
    return true
  } catch (err) {
    console.error('deleteNotification error:', err)
    return false
  }
}

export async function countUnread(userId: number): Promise<number> {
  try {
    const res = await sql`
      SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_id = ${userId} AND read = false
    `
    return res?.[0]?.cnt ?? 0
  } catch (err) {
    console.error('countUnread error:', err)
    return 0
  }
}
