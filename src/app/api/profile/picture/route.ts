import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProfilePicture } from '@/app/lib/profile';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profilePicture = await getProfilePicture(session.user.email);
  
  return NextResponse.json({ 
    profile_picture: profilePicture 
  });
}