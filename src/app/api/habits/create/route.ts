import { getToken } from 'next-auth/jwt';
import { createHabit } from '@/app/lib/habits';
import { getCategoryById } from '@/app/lib/categories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;
    const categoryId = body?.categoryId ?? null;

    if (!name || typeof name !== 'string') {
      return Response.json({ error: 'Invalid or missing `name`' }, { status: 400 });
    }

    if (categoryId !== null && typeof categoryId !== 'number') {
      return Response.json({ error: '`categoryId` must be a number or null' }, { status: 400 });
    }

    // Validate authentication via next-auth token
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

    if (categoryId !== null) {
      const category = await getCategoryById(categoryId);
      if (!category) {
        return Response.json({ error: 'Invalid `categoryId`' }, { status: 400 });
      }
    }

    const habit = await createHabit({ name, categoryId, userId });
    return Response.json({ habit });
  } catch (error) {
    console.error('Create habit error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
