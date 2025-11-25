import { getToken } from 'next-auth/jwt';
import { deleteHabit } from '@/app/lib/habits';

export async function DELETE(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const tokenUser: any = (token as any).user ?? (token as any);
    const userIdRaw = tokenUser?.id ?? tokenUser?.sub ?? null;
    const userId = userIdRaw ? parseInt(String(userIdRaw), 10) : null;
    if (!userId) {
      return Response.json({ error: 'Authenticated user id not available' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const idRaw = body?.id ?? body?.habitId ?? body?.habit_id;
    const id = idRaw ? parseInt(String(idRaw), 10) : null;
    if (!id) {
      return Response.json({ error: 'Missing or invalid `id` in request body' }, { status: 400 });
    }

    const result = await deleteHabit(id);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Delete habit error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

