import { NextResponse } from 'next/server';
import { getAllBadges } from '@/app/lib/badges';

const badgeIconMap = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  master: 'Master',
  legend: 'Legend',
  mythic: 'Mythic',
};

type BadgeId = keyof typeof badgeIconMap;

export async function GET() {
  try {
    const badges = await getAllBadges();

    const result = badges.map((badge: { id: string } & any) => ({
      ...badge,
      icon: badgeIconMap[badge.id as BadgeId] || null,
    }));

    return NextResponse.json({ badges: result });
  } catch (error) {
    console.error('Failed to fetch badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}