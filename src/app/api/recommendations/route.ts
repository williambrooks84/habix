import { getAllRecommendations } from '../../lib/recommendations';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const recommendations = await getAllRecommendations();
    return NextResponse.json({ recommendations });
  } catch (err) {
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}