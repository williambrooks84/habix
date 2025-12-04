'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { usePoints } from '@/components/wrappers/PointsContext';

export default function PointsDisplay() {
  const { data: session, status } = useSession();
  const { pointsVersion } = usePoints();
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchPoints = async () => {
    if (session?.user?.email) {
      try {
        const res = await fetch('/api/profile/points');
        const data = await res.json();
        setPoints(data.points ?? 0);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [session, pointsVersion]);

  if (status !== 'authenticated' || loading) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border-2 border-primary text-primary">
      <span className="font-bold text-base">{points}</span>
      <span className="text-sm font-medium">points</span>
    </div>
  );
}
