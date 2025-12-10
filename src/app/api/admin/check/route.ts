import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    console.log('Admin check - Full token:', token);
    
    if (!token) {
      console.log('Admin check - No token found');
      return NextResponse.json({ isAdmin: false });
    }

    const userId = (token as any).sub || (token as any).userId || (token as any).user?.id;
    console.log('Admin check - userId:', userId);

    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const { isUserAdmin } = await import('@/app/lib/admin');
    const isAdmin = await isUserAdmin(userId);
    console.log('Admin check - isAdmin from database:', isAdmin);

    return NextResponse.json({ isAdmin });
  } catch (err) {
    console.error('Check admin error:', err);
    return NextResponse.json({ isAdmin: false });
  }
}
