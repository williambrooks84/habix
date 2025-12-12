import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    console.log('Admin delete - token:', token)

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requesterId = (token as any).sub || (token as any).userId || (token as any).user?.id
    if (!requesterId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { isUserAdmin, DeleteHabit } = await import('@/app/lib/admin')
    const admin = await isUserAdmin(Number(requesterId))
    console.log('Admin delete - isAdmin:', admin)

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const targetHabitId = body?.habitId ?? body?.id

    if (!targetHabitId) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Fetch the habit to know its owner and name before deleting
    const { default: sql } = await import('@/app/lib/database')
    const habitRows = await sql`SELECT * FROM habits WHERE id = ${Number(targetHabitId)}`
    const habit = Array.isArray(habitRows) && habitRows.length > 0 ? habitRows[0] : null
    const ownerId = habit?.user_id ?? habit?.userId ?? null
    const habitName = habit?.name ?? null

    const deleted = await DeleteHabit(Number(targetHabitId))

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
    }

    // Notify the habit owner (but not the admin themselves).
    try {
      const { createNotification } = await import('@/app/lib/notifications')

      if (ownerId && Number(ownerId) && Number(ownerId) !== Number(requesterId)) {
        const title = 'Votre habitude a été supprimée'
        const bodyText = `L'habitude "${habitName ?? '—'}" a été supprimée par un administrateur.`
        const notifData = { habitId: Number(targetHabitId), deletedBy: Number(requesterId) }
        await createNotification(Number(ownerId), title, bodyText, notifData)
      }
    } catch (notifErr) {
      console.error('Failed to create notification for habit owner:', notifErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete habit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
