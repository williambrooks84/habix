'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Loading from '@/components/ui/loading/loading';
import HomeDisconnected from '@/components/home-disconnected';
import NoHabit from '@/components/ui/habit/no-habit';
import TodayHabits from '@/components/habit/today-habits';
import { ChartLineInteractive } from '@/components/ui/evolution/chart';
import { Toast } from '@/components/ui/recommendation/recommendation-toast';

export default function Home() {
  const { data: session, status } = useSession();
  const [loadingHabits, setLoadingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<any[] | null>(null);
  const [recommendationTitle, setRecommendationTitle] = React.useState<string | null>(null);

  const userName = (session?.user as any)?.first_name
    ?? (session?.user?.name ? session.user.name.split(/\s+/)[0] : undefined)
    ?? (session?.user?.email ? session.user.email.split('@')[0] : 'Anonymous');

  async function fetchRandomRecommendation() {
    try {
      const res = await fetch('/api/recommendations');
      if (!res.ok) return null;
      const data = await res.json();
      const recommendations = data.recommendations ?? [];
      if (recommendations.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * recommendations.length);
      return recommendations[randomIndex];
    } catch {
      return null;
    }
  }

  React.useEffect(() => {
    if (!session) return;
    let mounted = true;
    async function load() {
      setLoadingHabits(true);
      try {
        const res = await fetch('/api/habits', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (!mounted) return;
        setHabits(body.habits ?? []);
      } catch {
        if (!mounted) return;
        setHabits([]);
      } finally {
        if (mounted) setLoadingHabits(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [session]);

  React.useEffect(() => {
    fetchRandomRecommendation().then(rec => {
      if (rec && rec.title) setRecommendationTitle(rec.title);
    });
  }, []);

  if (status === 'loading') return <Loading />;

  if (loadingHabits) return <Loading />;

  if (!session) return <HomeDisconnected />;

  const hasHabits = Array.isArray(habits) && habits.length > 0;
  
  return (
    <div>
      <Toast title="Recommendation :" message={recommendationTitle ?? "Chargement..."} />
      <main className="w-full mx-auto px-6 py-8 grid gap-8">
        <h1 id="welcome-heading" className="text-2xl font-semibold">
          Bienvenue, {userName}!
        </h1>
        <h2 className="text-lg text-foreground">Pensez à compléter vos habitudes du jour !</h2>

        <section aria-labelledby="habits-section" className="flex flex-col justify-center gap-9 mb-10">
          {hasHabits ? (
            <>
              <TodayHabits />
              <ChartLineInteractive />
            </>
          ) : (
            <>
              <NoHabit />
            </>
          )}
        </section>
      </main>

    </div>
  );
}
