'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import RecommendationList from '@/components/recommendation/recommendation-list';
import Loading from '@/components/ui/loading/loading';
import NoHabit from '@/components/ui/habit/no-habit';
import AddHabbitButton from '@/components/ui/habit/add-habit-button';

export default function RecommendationPage() {
    const { data: session, status } = useSession();

    const [loadingRecommendations, setLoadingRecommendations] = React.useState(false);
    const [recommendations, setRecommendations] = React.useState<any[] | null>(null);

    React.useEffect(() => {
        if (!session) return;
        let mounted = true;
        async function getRecommendations() {
            setLoadingRecommendations(true);
            try {
                const res = await fetch('/api/recommendations', { credentials: 'include' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                if (!mounted) return;
                setRecommendations(body.recommendations ?? []);
            } catch {
                if (!mounted) return;
                setRecommendations([]);
            } finally {
                if (mounted) setLoadingRecommendations(false);
            }
        }
        getRecommendations();
        return () => { mounted = false; };
    }, [session]);

    if (status === 'loading') return <Loading />;

    if (loadingRecommendations) return <Loading />;

    return (
        <main className="w-full mx-auto px-6 py-8 flex flex-col gap-8">
            <h1 className="text-2xl font-semibold text-foreground">Nos recommendations</h1>
            <section aria-labelledby="habits-section" className="flex flex-col justify-center md:items-center gap-9 mb-15">
                <RecommendationList items={recommendations ?? []} />
            </section>
        </main>
    )
}