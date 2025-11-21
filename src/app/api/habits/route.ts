import { getToken } from 'next-auth/jwt';
import sql from '@/app/lib/database';

export async function GET(request: Request) {
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

		const rows = await sql`
			SELECT h.id, h.name, h.category_id, h.user_id, h.motivation, h.period_start, h.period_end, h.frequency, h.created_at, h.updated_at,
						 c.id as cat_id, c.name as cat_name
			FROM habits h
			LEFT JOIN categories c ON c.id = h.category_id
			WHERE h.user_id = ${userId}
			ORDER BY h.created_at DESC
		`;

		const habits = (rows || []).map((r: any) => ({
			id: r.id,
			name: r.name,
			category: r.cat_id ? { id: r.cat_id, name: r.cat_name } : null,
			motivation: r.motivation,
			periodStart: r.period_start,
			periodEnd: r.period_end,
			frequency: r.frequency,
			createdAt: r.created_at,
			updatedAt: r.updated_at,
		}));

		return Response.json({ habits });
	} catch (error) {
		console.error('Get habits error:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}

